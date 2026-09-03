import type { CobaltResponse, YouTubeVideoData } from '@/types/youtube'

const COBALT_INSTANCES = ['https://api.cobalt.tools', 'https://co.wuk.sh']
const REQUEST_TIMEOUT_MS = 30000

function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim()
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&\s]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?&\s]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^?&\s]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?&\s]+)/,
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([^&\s]+)/,
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
    // normalize to watch url for cobalt
    const hasScheme = /^https?:\/\//i.test(trimmed)
    const normalized = hasScheme ? trimmed : `https://${trimmed}`
    // if it's youtu.be or shorts etc, keep original but ensure valid
    return normalized
  }
  // also accept raw ID? require 11 chars
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

  // Fallback: construct minimal data without network
  return {
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    title: 'YouTube Video',
    thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    channel: 'YouTube',
    channelUrl: `https://www.youtube.com/watch?v=${id}`,
  }
}

async function requestCobalt(
  url: string,
  opts: { isAudioOnly: boolean; vQuality?: string; aFormat?: string },
  signal?: AbortSignal,
): Promise<CobaltResponse> {
  let lastError: unknown
  for (const base of COBALT_INSTANCES) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(`${base}/api/json`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          vQuality: opts.vQuality ?? '1080',
          aFormat: opts.aFormat ?? 'mp3',
          isAudioOnly: opts.isAudioOnly,
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
      // try next instance
      continue
    }
  }
  const message = lastError instanceof Error ? lastError.message : 'Failed to connect to download service'
  throw new Error(message)
}

async function fetchYouTubeDownloadUrl(
  url: string,
  mode: 'video' | 'audio',
  quality: string = '1080',
): Promise<{ downloadUrl: string; filename: string }> {
  const id = extractYouTubeId(url)
  if (!id) throw new Error('Invalid YouTube URL')
  const normalizedUrl = `https://www.youtube.com/watch?v=${id}`

  const cobaltRes = await requestCobalt(normalizedUrl, {
    isAudioOnly: mode === 'audio',
    vQuality: quality,
    aFormat: mode === 'audio' ? 'mp3' : 'mp4',
  })

  if (cobaltRes.status === 'picker' && cobaltRes.picker?.length) {
    // pick first
    const first = cobaltRes.picker[0]!
    return { downloadUrl: first.url, filename: cobaltRes.filename || `youtube_${id}.${mode === 'audio' ? 'mp3' : 'mp4'}` }
  }

  if ('url' in cobaltRes && cobaltRes.url) {
    return { downloadUrl: cobaltRes.url, filename: cobaltRes.filename }
  }

  throw new Error('Không thể lấy link tải. Vui lòng thử lại.')
}

async function triggerDownload(url: string, filename: string) {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok) throw new Error('Download failed')
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(objectUrl)
  } catch {
    // fallback: open in new tab / direct link
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

export { parseYouTubeUrl, extractYouTubeId, fetchYouTubeMeta, requestCobalt, fetchYouTubeDownloadUrl, triggerDownload, getYouTubeIdFromUrl }
