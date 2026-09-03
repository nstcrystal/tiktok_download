<script setup lang="ts">
import { ref } from 'vue'
import { useYouTubeStore } from '@/stores/youtube'
import { fetchYouTubeDownloadUrl, triggerDownload } from '@/services/youtubeApi'

const store = useYouTubeStore()
const quality = ref('1080')

async function handleDownloadVideo() {
  if (!store.validatedUrl || !store.video) return
  store.downloading = 'video'
  try {
    const { downloadUrl, filename } = await fetchYouTubeDownloadUrl(store.validatedUrl, 'video', quality.value)
    const safeName = filename || `youtube_${store.video.id}_${quality.value}p.mp4`
    await triggerDownload(downloadUrl, safeName)
  } catch (e) {
    store.error = e instanceof Error ? e.message : 'Tải video thất bại'
  } finally {
    store.downloading = null
  }
}

async function handleDownloadAudio() {
  if (!store.validatedUrl || !store.video) return
  store.downloading = 'audio'
  try {
    const { downloadUrl, filename } = await fetchYouTubeDownloadUrl(store.validatedUrl, 'audio')
    const safeName = filename || `youtube_${store.video.id}_audio.mp3`
    await triggerDownload(downloadUrl, safeName)
  } catch (e) {
    store.error = e instanceof Error ? e.message : 'Tải audio thất bại'
  } finally {
    store.downloading = null
  }
}
</script>

<template>
  <main class="home">
    <section class="hero">
      <h1 class="hero-title">YouTube Downloader</h1>
      <p class="hero-subtitle">Tải xuống video YouTube chất lượng cao hoặc tách âm thanh MP3</p>
    </section>

    <section class="howto">
      <h2 class="howto-title">How to use</h2>
      <ol class="howto-steps">
        <li>Mở YouTube và sao chép link video (youtube.com, youtu.be hoặc Shorts).</li>
        <li>Dán link vào thanh tìm kiếm bên dưới.</li>
        <li>Bấm <strong>Download</strong> để xem trước, sau đó chọn tải Video hoặc Audio.</li>
      </ol>
    </section>

    <section class="downloader">
      <form class="url-form" @submit.prevent="store.fetchVideo()">
        <div class="input-group">
          <input
            v-model="store.inputUrl"
            type="url"
            placeholder="Paste YouTube video URL here..."
            class="url-input"
            autocomplete="off"
            @input="store.validateUrl(store.inputUrl)"
          />
          <button type="submit" class="btn btn-primary" :disabled="store.loading || !store.isValidUrl">
            <span v-if="store.loading" class="spinner"></span>
            <span v-else>Download</span>
          </button>
        </div>
        <p v-if="store.error" class="error-msg">{{ store.error }}</p>
      </form>

      <div v-if="store.video" class="result">
        <div class="video-card">
          <div class="video-player youtube-player">
            <img :src="store.video.thumbnail" :alt="store.video.title" class="video-cover youtube-cover" loading="lazy" />
            <a :href="store.video.url" target="_blank" rel="noopener" class="yt-play-badge" aria-label="Open on YouTube">
              <span class="yt-play-icon">▶</span>
            </a>
          </div>
          <div class="video-meta">
            <div class="author-row">
              <span class="author-name yt-channel">{{ store.video.channel }}</span>
              <a v-if="store.video.channelUrl" :href="store.video.channelUrl" target="_blank" rel="noopener" class="channel-link">View channel</a>
            </div>
            <p class="video-title">{{ store.video.title }}</p>
            <p class="video-url-hint">{{ store.video.url }}</p>
          </div>

          <div class="yt-options">
            <label class="quality-label" for="yt-quality">Quality</label>
            <select id="yt-quality" v-model="quality" class="quality-select">
              <option value="max">Max (best)</option>
              <option value="2160">2160p 4K</option>
              <option value="1440">1440p</option>
              <option value="1080">1080p HD</option>
              <option value="720">720p</option>
              <option value="480">480p</option>
              <option value="360">360p</option>
            </select>
          </div>

          <div class="download-actions">
            <button class="btn btn-download" :disabled="store.downloading !== null" @click="handleDownloadVideo">
              <span v-if="store.downloading === 'video'" class="spinner spinner-dark"></span>
              <span v-else>Download Video ({{ quality === 'max' ? 'Best' : quality + 'p' }})</span>
            </button>
            <button class="btn btn-download btn-music" :disabled="store.downloading !== null" @click="handleDownloadAudio">
              <span v-if="store.downloading === 'audio'" class="spinner spinner-dark"></span>
              <span v-else>Download Audio (MP3)</span>
            </button>
          </div>

          <p class="yt-note">
            Sử dụng Cobalt API (api.cobalt.tools). Nếu tải thất bại, thử lại hoặc kiểm tra video có giới hạn bản quyền/age-restrict không.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  max-width: 720px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 2.5rem;
}

.hero-title {
  font-family: 'Public Sans', 'Public Sans Fallback: BlinkMacSystemFont',
    'Public Sans Fallback: Segoe UI', 'Public Sans Fallback: Helvetica Neue',
    'Public Sans Fallback: Arial', 'Public Sans Fallback: Noto Sans', sans-serif;
  font-size: 2.75rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  line-height: 1.15;
}

.hero-subtitle {
  color: var(--ui-fg-muted);
  font-size: 1rem;
  margin: 0;
}

.howto {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
}

.howto-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-fg-muted);
  margin: 0 0 0.75rem;
}

.howto-steps {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--ui-fg-muted);
  font-size: 0.925rem;
  line-height: 1.8;
}

.url-form {
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-elevated);
  color: var(--ui-fg);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.url-input:focus {
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary) 20%, transparent);
}

.url-input::placeholder {
  color: var(--ui-fg-muted);
  opacity: 0.7;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, opacity 0.2s, transform 0.1s;
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: var(--ui-primary);
  color: var(--ui-primary-fg);
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  background: var(--ui-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-msg {
  color: var(--ui-danger);
  font-size: 0.875rem;
  margin: 0.75rem 0.5rem 0;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner-dark {
  border-color: rgba(0, 0, 0, 0.15);
  border-top-color: currentColor;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.video-card {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  overflow: hidden;
  box-shadow: var(--ui-shadow-lg);
}

.video-player {
  position: relative;
  background: #000;
}

.youtube-player {
  aspect-ratio: 16 / 9;
}

.video-cover {
  width: 100%;
  display: block;
  aspect-ratio: 9 / 16;
  object-fit: cover;
}

.youtube-cover {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.yt-play-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.yt-play-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 0, 0, 0.9);
  color: #fff;
  border-radius: 50%;
  font-size: 1.25rem;
  padding-left: 0.2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: transform 0.2s, background 0.2s;
}

.yt-play-badge:hover .yt-play-icon {
  transform: scale(1.08);
  background: #ff0000;
}

.video-meta {
  padding: 1.25rem;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.author-name {
  font-weight: 600;
}

.yt-channel {
  color: var(--ui-fg);
}

.channel-link {
  font-size: 0.8rem;
  color: var(--ui-primary);
  text-decoration: none;
  border: 1px solid var(--ui-border);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  transition: background 0.2s;
}

.channel-link:hover {
  background: var(--ui-bg-muted);
}

.video-title {
  margin: 0 0 0.5rem;
  color: var(--ui-fg);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-url-hint {
  font-size: 0.8rem;
  color: var(--ui-fg-muted);
  word-break: break-all;
  margin: 0;
}

.yt-options {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.25rem 0.75rem;
}

.quality-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ui-fg-muted);
}

.quality-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-elevated);
  color: var(--ui-fg);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}

.quality-select:focus {
  border-color: var(--ui-primary);
}

.download-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
}

.btn-download {
  justify-content: center;
  background: var(--ui-primary);
  color: var(--ui-primary-fg);
}

.btn-download:hover:not(:disabled) {
  background: var(--ui-primary-hover);
}

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-music {
  background: var(--ui-bg-muted);
  color: var(--ui-fg);
  border: 1px solid var(--ui-border);
}

.btn-music:hover:not(:disabled) {
  background: var(--ui-border);
}

.yt-note {
  padding: 0 1.25rem 1.25rem;
  font-size: 0.75rem;
  color: var(--ui-fg-muted);
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.25rem;
  }
  .input-group {
    flex-direction: column;
  }
}
</style>
