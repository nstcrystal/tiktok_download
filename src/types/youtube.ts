export interface YouTubeVideoData {
  id: string
  url: string
  title: string
  thumbnail: string
  channel: string
  channelUrl: string
  duration?: number
}

export interface YouTubeOEmbedResponse {
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
  thumbnail_width: number
  thumbnail_height: number
  html: string
}

export type YouTubeQuality = 'max' | '2160' | '1440' | '1080' | '720' | '480' | '360'
export type YouTubeAudioFormat = 'mp3' | 'ogg' | 'wav' | 'opus' | 'best'

export interface CobaltRequest {
  url: string
  vQuality: YouTubeQuality
  aFormat: YouTubeAudioFormat
  isAudioOnly: boolean
  filenameStyle: 'classic' | 'pretty' | 'basic' | 'nerdy'
}

export interface CobaltSuccessResponse {
  status: 'stream' | 'redirect' | 'picker'
  url: string
  filename: string
  picker?: Array<{ type: string; url: string; thumb?: string }>
}

export interface CobaltErrorResponse {
  status: 'error'
  error: { code: string; context?: unknown }
  text: string
}

export type CobaltResponse = CobaltSuccessResponse | CobaltErrorResponse

export type DownloadMode = 'video' | 'audio'
