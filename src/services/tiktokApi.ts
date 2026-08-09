import type { TikTokApiResponse, TikTokVideoData } from '@/types/tiktok'

const API_BASES = ['https://www.tikwm.com/api/', 'https://tikwm.com/api/']
const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 2

async function postToApi(base: string, url: string, signal?: AbortSignal): Promise<TikTokApiResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(base, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json, text/plain, */*',
      },
      body: new URLSearchParams({ url, count: '12', cursor: '0', hd: '1' }),
      signal: signal || controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

async function fetchTikTokData(url: string, signal?: AbortSignal): Promise<TikTokVideoData> {
  let lastError: unknown

  for (const base of API_BASES) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result: TikTokApiResponse = await postToApi(base, url, signal)

        if (result.code !== 0) {
          throw new Error(result.msg || 'API returned an error')
        }

        const d = result.data
        return {
          title: d.title || 'Untitled',
          cover: d.cover,
          videoUrl: d.play,
          videoUrlHd: d.hdplay || d.play,
          musicUrl: d.music,
          author: d.author.nickname,
          authorAvatar: d.author.avatar,
          duration: d.duration,
          likes: d.digg_count,
          shares: d.share_count,
          comments: d.comment_count,
          plays: d.play_count,
          wmplay: d.wmplay,
          hdplay: d.hdplay || d.play,
          music: d.music,
          images: d.images || [],
          imagesCount: d.images_count || d.images?.length || 0,
        }
      } catch (e) {
        lastError = e
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Failed to fetch video data'
  throw new Error(`Không thể lấy dữ liệu video. Vui lòng kiểm tra link và thử lại. (${message})`)
}

function parseTikTokUrl(input: string): string | null {
  const trimmed = input.trim()
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/photo\/(\d+)/,
    /(?:https?:\/\/)?vm\.tiktok\.com\/([\w]+)/,
    /(?:https?:\/\/)?vt\.tiktok\.com\/([\w]+)/,
    /(?:https?:\/\/)?m\.tiktok\.com\/v\/(\d+)/,
  ]

  for (const pattern of patterns) {
    if (pattern.test(trimmed)) return trimmed
  }
  return null
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
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }
}

export { fetchTikTokData, parseTikTokUrl, triggerDownload }
