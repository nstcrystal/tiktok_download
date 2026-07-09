export interface TikTokVideoData {
  title: string
  cover: string
  videoUrl: string
  videoUrlHd: string
  musicUrl: string
  author: string
  authorAvatar: string
  duration: number
  likes: number
  shares: number
  comments: number
  plays: number
  wmplay: string
  hdplay: string
  music: string
}

export interface TikTokApiResponse {
  code: number
  msg: string
  data: {
    title: string
    cover: string
    play: string
    wmplay: string
    hdplay: string
    music: string
    author: {
      nickname: string
      avatar: string
    }
    duration: number
    digg_count: number
    share_count: number
    comment_count: number
    play_count: number
  }
}

export interface DownloadState {
  status: 'idle' | 'loading' | 'success' | 'error'
  video: TikTokVideoData | null
  error: string | null
  progress: boolean
}
