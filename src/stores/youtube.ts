import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { YouTubeVideoData } from '@/types/youtube'
import { fetchYouTubeMeta, parseYouTubeUrl } from '@/services/youtubeApi'

export const useYouTubeStore = defineStore('youtube', () => {
  const inputUrl = ref('')
  const validatedUrl = ref<string | null>(null)
  const video = ref<YouTubeVideoData | null>(null)
  const loading = ref(false)
  const downloading = ref<'video' | 'audio' | null>(null)
  const error = ref<string | null>(null)
  const isValidUrl = ref(false)

  function validateUrl(url: string) {
    inputUrl.value = url
    const parsed = parseYouTubeUrl(url)
    validatedUrl.value = parsed
    isValidUrl.value = parsed !== null
    if (parsed) error.value = null
  }

  async function fetchVideo() {
    const url = validatedUrl.value
    if (!url) {
      error.value = 'Vui lòng nhập link YouTube hợp lệ'
      return
    }
    loading.value = true
    error.value = null
    video.value = null
    try {
      video.value = await fetchYouTubeMeta(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Không thể lấy thông tin video'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    inputUrl.value = ''
    validatedUrl.value = null
    video.value = null
    loading.value = false
    downloading.value = null
    error.value = null
    isValidUrl.value = false
  }

  return {
    inputUrl,
    validatedUrl,
    video,
    loading,
    downloading,
    error,
    isValidUrl,
    validateUrl,
    fetchVideo,
    reset,
  }
})
