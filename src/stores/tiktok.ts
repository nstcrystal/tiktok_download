import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TikTokVideoData } from '@/types/tiktok'
import { fetchTikTokData, parseTikTokUrl } from '@/services/tiktokApi'

export const useTikTokStore = defineStore('tiktok', () => {
  const inputUrl = ref('')
  const validatedUrl = ref<string | null>(null)
  const video = ref<TikTokVideoData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isValidUrl = ref(false)

  function validateUrl(url: string) {
    inputUrl.value = url
    const parsed = parseTikTokUrl(url)
    validatedUrl.value = parsed
    isValidUrl.value = parsed !== null
    if (parsed) error.value = null
  }

  async function fetchVideo() {
    const url = validatedUrl.value
    if (!url) {
      error.value = 'Please enter a valid TikTok URL'
      return
    }

    loading.value = true
    error.value = null
    video.value = null

    try {
      video.value = await fetchTikTokData(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch video data'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    inputUrl.value = ''
    validatedUrl.value = null
    video.value = null
    loading.value = false
    error.value = null
    isValidUrl.value = false
  }

  return {
    inputUrl,
    validatedUrl,
    video,
    loading,
    error,
    isValidUrl,
    validateUrl,
    fetchVideo,
    reset,
  }
})
