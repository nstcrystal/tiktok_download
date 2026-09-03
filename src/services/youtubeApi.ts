import type { CobaltResponse, YouTubeVideoData } from '@/types/youtube'

const REQUEST_TIMEOUT_MS = 30000

// Backend base URL: ưu tiên VITE_API_URL (deploy riêng), fallback /api (Vite proxy local), cuối cùng localhost:3001
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''
const getApiUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : path)

// New Cobalt API (v10) - POST to / with new schema, but public instances now require auth
// Keep as optional fallback, but primary is direct extraction via CORS proxy
const COBALT_INSTANCES = ['https://api.cobalt.tools', 'https://co.wuk.sh']

function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim()
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&\s]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?&\s]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^?&\s]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?&\s]+)/,
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([^&\s?]+)/,
  ]
  for (const p of patterns) {
    const m = trimmed.match(p)
    if (m?.[1]) return m[1]!
  }
  return null
}

function parseYouTubeUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const id = extractYouTubeId(trimmed)
  if (id) {
    const hasScheme = /^https?:\/\//i.test(trimmed)
    const normalized = hasScheme ? trimmed : `https://${trimmed}`
    return normalized
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`
  }
  return null
}

function getYouTubeIdFromUrl(url: string): string {
  return extractYouTubeId(url) ?? url
}

async function fetchYouTubeMeta(url: string, signal?: AbortSignal): Promise<YouTubeVideoData> {
  const id = extractYouTubeId(url)
  if (!id) throw new Error('Invalid YouTube URL')

  // Try backend first (yt-dlp, more accurate, handles SABR) - hỗ trợ cả GitHub Pages qua VITE_API_URL
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    const r = await fetch(getApiUrl(`/api/youtube/meta?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`), {
      signal: signal || controller.signal,
    })
    clearTimeout(timeoutId)
    if (r.ok) {
      const j = await r.json()
      if (j.title) {
        return {
          id: j.id || id,
          url: j.url || `https://www.youtube.com/watch?v=${id}`,
          title: j.title,
          thumbnail: j.thumbnail || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          channel: j.channel || 'YouTube',
          channelUrl: j.channelUrl || '',
        }
      }
    }
  } catch {
    // backend not available, fall through to oEmbed
  }

  // Primary: oEmbed (no key, CORS ok)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`
    const res = await fetch(oembedUrl, { signal: signal || controller.signal })
    clearTimeout(timeoutId)
    if (res.ok) {
      const data = (await res.json()) as {
        title: string
        author_name: string
        author_url: string
        thumbnail_url: string
      }
      return {
        id,
        url: `https://www.youtube.com/watch?v=${id}`,
        title: data.title || 'YouTube Video',
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        channel: data.author_name || 'Unknown',
        channelUrl: data.author_url || '',
      }
    }
  } catch {
    // fallback to thumbnail only
  }

  return {
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    title: 'YouTube Video',
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    channel: 'YouTube',
    channelUrl: `https://www.youtube.com/watch?v=${id}`,
  }
}

// --- Direct stream extraction via CORS proxy (fallback when Cobalt is blocked) ---

const CORS_PROXIES = [
  // Verified working 2026-09: syrins returns youtube HTML with CORS
  (u: string) => `https://api.cors.syrins.tech/?url=${encodeURIComponent(u)}`,
  (u: string) => `https://api.cors.lol/?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.org/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
]

async function fetchTextViaProxy(targetUrl: string, signal?: AbortSignal): Promise<string> {
  // Try Vite dev proxy first (same-origin, uses server IP which still returns formats with url)
  // This works in `npm run dev` but not on GitHub Pages static
  const isDevProxyAvailable = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  if (isDevProxyAvailable) {
    try {
      const url = new URL(targetUrl)
      const videoId = url.searchParams.get('v')
      if (videoId) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        const res = await fetch(`/__yt_watch?v=${videoId}`, {
          signal: signal || controller.signal,
          headers: { Accept: 'text/html,*/*' },
        })
        clearTimeout(timeoutId)
        if (res.ok) {
          const text = await res.text()
          if (text && text.length > 1000) return text
        }
      }
    } catch {
      // fall through to CORS proxies
    }
  }

  let lastError: unknown
  for (const build of CORS_PROXIES) {
    const proxyUrl = build(targetUrl)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)
      const res = await fetch(proxyUrl, {
        signal: signal || controller.signal,
        headers: { Accept: 'text/html,*/*' },
      })
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (text && text.length > 1000) return text
      throw new Error('Empty response from proxy')
    } catch (e) {
      lastError = e
      continue
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Không thể tải trang YouTube qua proxy (CORS). Vui lòng thử lại hoặc dùng link khác.')
}

interface YtFormat {
  itag: number
  url?: string
  mimeType?: string
  qualityLabel?: string
  quality?: string
  audioQuality?: string
  width?: number
  height?: number
  fps?: number
  bitrate?: number
  approxDurationMs?: string
  signatureCipher?: string
  cipher?: string
}

interface StreamingData {
  expiresInSeconds: string
  formats: YtFormat[]
  adaptiveFormats: YtFormat[]
}

function parseStreamingData(html: string): StreamingData | null {
  // Try ytInitialPlayerResponse
  const patterns = [
    /ytInitialPlayerResponse\s*=\s*(\{.+?\});/s,
    /"streamingData"\s*:\s*(\{.+?"adaptiveFormats".+?\})/s,
  ]

  for (const pat of patterns) {
    const m = html.match(pat)
    if (!m) continue
    try {
      let jsonStr = m[1]!
      // If we matched ytInitialPlayerResponse, extract streamingData inside
      if (jsonStr.includes('streamingData')) {
        const parsed = JSON.parse(jsonStr) as { streamingData?: StreamingData }
        if (parsed.streamingData) return parsed.streamingData
        // fallback: try to extract streamingData substring
        const sdMatch = jsonStr.match(/"streamingData"\s*:\s*(\{.+?\}),"playabilityStatus"/s)
        if (sdMatch?.[1]) {
          const sd = JSON.parse(sdMatch[1]) as StreamingData
          if (sd.formats || sd.adaptiveFormats) return sd
        }
      } else {
        // direct streamingData object
        const sd = JSON.parse(jsonStr) as StreamingData
        if (sd.formats || sd.adaptiveFormats) return sd
      }
    } catch {
      continue
    }
  }

  // Fallback: brute search for "formats":[ and "adaptiveFormats":[
  try {
    const sdMatch = html.match(/"streamingData":\s*(\{[^}]+"formats"[^}]+\})/s)
    if (sdMatch?.[1]) {
      // This is fragile; try JSON extraction with balanced braces
      const start = html.indexOf('"streamingData"')
      const braceStart = html.indexOf('{', start)
      let depth = 0
      let end = -1
      for (let i = braceStart; i < html.length && i < braceStart + 500000; i++) {
        const ch = html[i]
        if (ch === '{') depth++
        else if (ch === '}') {
          depth--
          if (depth === 0) {
            end = i
            break
          }
        }
      }
      if (end !== -1) {
        const sdJson = html.slice(braceStart, end + 1)
        const sd = JSON.parse(sdJson) as StreamingData
        if (sd.formats || sd.adaptiveFormats) return sd
      }
    }
  } catch {
    // ignore
  }

  return null
}

async function getDirectStreams(videoId: string, signal?: AbortSignal): Promise<StreamingData> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const html = await fetchTextViaProxy(watchUrl, signal)
  const sd = parseStreamingData(html)
  if (!sd) throw new Error('Không thể phân tích dữ liệu video (YouTube thay đổi cấu trúc). Vui lòng thử Cobalt fallback hoặc thử lại sau.')
  if ((!sd.formats || sd.formats.length === 0) && (!sd.adaptiveFormats || sd.adaptiveFormats.length === 0)) {
    throw new Error('Không tìm thấy stream cho video này (có thể video giới hạn tuổi/bản quyền).')
  }
  return sd
}

function pickBestStream(sd: StreamingData, mode: 'video' | 'audio', quality: string): YtFormat | null {
  if (mode === 'audio') {
    const audioOnly = (sd.adaptiveFormats || []).filter((f) => f.mimeType?.includes('audio') && f.url)
    if (audioOnly.length === 0) return null
    // prefer mp4 audio (m4a) highest bitrate
    audioOnly.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))
    return audioOnly[0] ?? null
  }

  // video: combine formats (muxed) + adaptive video
  const allVideo = [...(sd.formats || []), ...(sd.adaptiveFormats || [])].filter((f) => f.url && (f.mimeType?.includes('video') || f.qualityLabel))
  if (allVideo.length === 0) return null

  // If quality = max, pick highest height
  if (quality === 'max') {
    allVideo.sort((a, b) => (b.height ?? 0) - (a.height ?? 0) || (b.bitrate ?? 0) - (a.bitrate ?? 0))
    // prefer muxed (has audio) for easy download
    const muxed = allVideo.filter((f) => sd.formats?.some((x) => x.itag === f.itag))
    return muxed[0] ?? allVideo[0] ?? null
  }

  const targetH = parseInt(quality, 10)
  if (!isNaN(targetH)) {
    // exact match first
    const exact = allVideo.filter((f) => f.height === targetH)
    if (exact.length) {
      exact.sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))
      // prefer muxed
      const muxedExact = exact.filter((f) => sd.formats?.some((x) => x.itag === f.itag))
      return muxedExact[0] ?? exact[0] ?? null
    }
    // fallback: closest lower
    const lower = allVideo.filter((f) => (f.height ?? 0) <= targetH).sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    if (lower.length) return lower[0] ?? null
  }

  allVideo.sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
  return allVideo[0] ?? null
}

// --- Cobalt fallback (new API) ---

async function requestCobaltNew(
  url: string,
  opts: { isAudioOnly: boolean; videoQuality?: string },
  signal?: AbortSignal,
): Promise<CobaltResponse> {
  let lastError: unknown
  for (const base of COBALT_INSTANCES) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(`${base}/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          videoQuality: opts.videoQuality ?? '1080',
          audioFormat: 'mp3',
          downloadMode: opts.isAudioOnly ? 'audio' : 'auto',
          filenameStyle: 'basic',
        }),
        signal: signal || controller.signal,
      })
      clearTimeout(timeoutId)
      const json = (await res.json()) as CobaltResponse
      if ((json as { status: string }).status === 'error') {
        const err = json as { text?: string; error?: { code?: string } }
        throw new Error(err.text || err.error?.code || 'Cobalt error')
      }
      return json
    } catch (e) {
      clearTimeout(timeoutId)
      lastError = e
      continue
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Cobalt fallback failed')
}

async function fetchYouTubeDownloadUrl(
  url: string,
  mode: 'video' | 'audio',
  quality: string = '1080',
): Promise<{ downloadUrl: string; filename: string }> {
  const id = extractYouTubeId(url)
  if (!id) throw new Error('Invalid YouTube URL')
  const normalizedUrl = `https://www.youtube.com/watch?v=${id}`

  // Strategy 0: Backend via yt-dlp (handles SABR/DASH, most reliable when server running)
  // Hỗ trợ cả local (Vite proxy) và GitHub Pages (VITE_API_URL trỏ tới backend deploy riêng)
  const tryBackendHealth = async (): Promise<boolean> => {
    const urls = [getApiUrl('/api/health'), 'http://localhost:3001/api/health']
    // Loại trùng
    const uniq = [...new Set(urls)]
    for (const u of uniq) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2500)
        const r = await fetch(u, { signal: controller.signal })
        clearTimeout(timeoutId)
        if (r.ok) return true
      } catch {
        // try next
      }
    }
    return false
  }

  const backendAvailable = await tryBackendHealth()
  if (backendAvailable) {
    const filename = `youtube_${id}_${mode === 'audio' ? 'audio' : quality + 'p'}.${mode === 'audio' ? 'mp3' : 'mp4'}`
    const downloadUrl = getApiUrl(`/api/youtube/download?url=${encodeURIComponent(normalizedUrl)}&quality=${quality}&mode=${mode}`)
    console.log('[YouTube] Using backend download proxy:', downloadUrl)
    return { downloadUrl, filename }
  } else {
    console.warn('[YouTube] Backend not reachable (tried', getApiUrl('/api/health'), 'and localhost:3001), trying direct extraction')
  }

  // Strategy 1: Direct extraction via CORS proxy (works only if YouTube returns muxed formats, now mostly SABR)
  try {
    const sd = await getDirectStreams(id)
    const picked = pickBestStream(sd, mode, quality)
    if (picked?.url) {
      // googlevideo URL may contain \u0026 escaped
      const cleanUrl = picked.url.replace(/\\u0026/g, '&')
      const ext = mode === 'audio' ? 'm4a' : 'mp4'
      const q = picked.qualityLabel ?? (picked.height ? `${picked.height}p` : quality)
      const filename = `youtube_${id}_${mode === 'audio' ? 'audio' : q}.${ext}`
      return { downloadUrl: cleanUrl, filename }
    }
    // If no url but SABR detected, throw specific error to skip to cobalt/external
      if (sd.adaptiveFormats?.length && !sd.adaptiveFormats.some((f) => f.url)) {
        throw new Error('YouTube đã chuyển sang SABR streaming (không còn direct URL trong HTML). Cần backend yt-dlp.')
      }
    } catch (e) {
      // log and fallback
      console.warn('[YouTube] Direct extraction failed:', e)
      if (e instanceof Error && e.message.includes('SABR')) {
        // Even though health check failed, try backend download as last resort
        const filename = `youtube_${id}_${mode === 'audio' ? 'audio' : quality + 'p'}.${mode === 'audio' ? 'mp3' : 'mp4'}`
        const downloadUrl = getApiUrl(`/api/youtube/download?url=${encodeURIComponent(normalizedUrl)}&quality=${quality}&mode=${mode}`)
        console.log('[YouTube] SABR detected, trying backend download as last resort:', downloadUrl)
        const healthUrls = [getApiUrl('/api/health'), 'http://localhost:3001/api/health']
        for (const hu of [...new Set(healthUrls)]) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 2000)
            const health = await fetch(hu, { signal: controller.signal })
            clearTimeout(timeoutId)
            if (health && health.ok) return { downloadUrl, filename }
          } catch {}
        }
        throw new Error(
          'YouTube chặn tải trực tiếp (SABR). Backend chưa chạy hoặc không kết nối được.\n\nCách khắc phục LOCAL:\n1. npm run dev:server (3001) + npm run dev (5173) hoặc npm run dev:all\n\nCách khắc phục GITHUB PAGES (static không chạy được backend):\n- Deploy riêng backend lên Render/Railway/Fly/Vercel (cần Node + yt-dlp + ffmpeg), sau đó set biến môi trường VITE_API_URL=https://your-backend.onrender.com rồi build lại.\n- Hoặc dùng nút dự phòng SaveFrom/Y2Mate/10Downloader, hoặc yt-dlp trực tiếp.',
        )
      }
    }

  // Strategy 2: Cobalt new API
  try {
    const cobaltRes = await requestCobaltNew(normalizedUrl, {
      isAudioOnly: mode === 'audio',
      videoQuality: quality,
    })

    if (cobaltRes.status === 'picker' && cobaltRes.picker?.length) {
      const first = cobaltRes.picker[0]!
      return { downloadUrl: first.url, filename: cobaltRes.filename || `youtube_${id}.${mode === 'audio' ? 'mp3' : 'mp4'}` }
    }

    if ('url' in cobaltRes && cobaltRes.url) {
      return { downloadUrl: cobaltRes.url, filename: cobaltRes.filename }
    }
  } catch (e) {
    console.warn('[YouTube] Cobalt fallback failed:', e)
    // continue to throw combined error
    const msg = e instanceof Error ? e.message : String(e)
    // If direct extraction already failed, surface that message
    if (msg.includes('jwt') || msg.includes('auth')) {
      throw new Error(
        'Cobalt API yêu cầu xác thực và tạm thời chặn YouTube. Đã thử trích xuất trực tiếp nhưng thất bại. Vui lòng thử lại sau hoặc dùng yt-dlp / thử video khác.',
      )
    }
    throw new Error(`Không thể lấy link tải: ${msg}. Vui lòng thử lại hoặc kiểm tra video có bị giới hạn tuổi/bản quyền không.`)
  }

  throw new Error('Không thể lấy link tải. Vui lòng thử lại.')
}

async function triggerDownload(url: string, filename: string) {
  const isGoogleVideo = url.includes('googlevideo.com')

  async function downloadViaFetch(fetchUrl: string): Promise<void> {
    const response = await fetch(fetchUrl, {
      mode: 'cors',
      signal: AbortSignal.timeout(60000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }

  // For googlevideo: try direct fetch, then via CORS proxy to force download instead of navigation
  if (isGoogleVideo) {
    try {
      await downloadViaFetch(url)
      return
    } catch (e) {
      console.warn('[Download] Direct googlevideo fetch failed, trying proxy:', e)
      for (const build of CORS_PROXIES) {
        try {
          await downloadViaFetch(build(url))
          return
        } catch {
          continue
        }
      }
    }
    // If blob download failed, fallback to opening URL (browser will play). Hint download.
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.target = '_blank'
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    return
  }

  try {
    await downloadViaFetch(url)
  } catch {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.target = '_blank'
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }
}

export { parseYouTubeUrl, extractYouTubeId, fetchYouTubeMeta, requestCobaltNew as requestCobalt, fetchYouTubeDownloadUrl, triggerDownload, getYouTubeIdFromUrl }
