<script setup lang="ts">
import { useTikTokStore } from '@/stores/tiktok'
import { triggerDownload } from '@/services/tiktokApi'

const store = useTikTokStore()

async function handleDownload(url: string, label: string) {
  const filename = `tiktok_${Date.now()}_${label}.mp4`
  await triggerDownload(url, filename)
}

async function handleDownloadAudio(url: string) {
  const filename = `tiktok_${Date.now()}_audio.mp3`
  await triggerDownload(url, filename)
}

async function handleDownloadImage(url: string, index: number) {
  const filename = `tiktok_${Date.now()}_photo_${index + 1}.jpg`
  await triggerDownload(url, filename)
}

async function handleDownloadAllImages(images: string[]) {
  for (const [index, image] of images.entries()) {
    await handleDownloadImage(image, index)
    await new Promise((resolve) => setTimeout(resolve, 400))
  }
}
</script>

<template>
  <main class="home">
    <section class="hero">
      <h1 class="hero-title">TikTok Downloader</h1>
      <p class="hero-subtitle">
        Tải xuống video hoặc ảnh TikTok không có logo ở chất lượng HD
      </p>
    </section>

    <section class="howto">
      <h2 class="howto-title">How to use</h2>
      <ol class="howto-steps">
        <li>Mở ứng dụng hoặc trang web TikTok và sao chép link của bài đăng video hoặc ảnh.</li>
        <li>Dán link vào thanh tìm kiếm bên dưới.</li>
        <li>Bấm vào nút <strong>Download</strong>, xem trước bài đăng, sau đó tải xuống với chất lượng bạn muốn hoặc tải xuống tất cả các bức ảnh.</li>
      </ol>
    </section>

    <section class="downloader">
      <form class="url-form" @submit.prevent="store.fetchVideo()">
        <div class="input-group">
          <input v-model="store.inputUrl" type="url" placeholder="Paste TikTok video URL here..." class="url-input"
            autocomplete="off" @input="store.validateUrl(store.inputUrl)" />
          <button type="submit" class="btn btn-primary" :disabled="store.loading || !store.isValidUrl">
            <span v-if="store.loading" class="spinner"></span>
            <span v-else>Download</span>
          </button>
        </div>
        <p v-if="store.error" class="error-msg">{{ store.error }}</p>
      </form>

      <div v-if="store.video" class="result">
        <template v-if="store.video.images.length > 0">
          <div class="photo-card">
            <div class="video-meta">
              <div class="author-row">
                <img :src="store.video.authorAvatar" :alt="store.video.author" class="author-avatar" loading="lazy" />
                <span class="author-name">{{ store.video.author }}</span>
              </div>
              <p class="video-title">{{ store.video.title }}</p>
              <div class="stats-row">
                <span>🖼️ {{ store.video.imagesCount }} photos</span>
                <span>❤️ {{ store.video.likes }}</span>
                <span>💬 {{ store.video.comments }}</span>
                <span>🔗 {{ store.video.shares }}</span>
              </div>
            </div>
            <div class="photo-grid">
              <figure v-for="(image, index) in store.video.images" :key="index" class="photo-item">
                <img :src="image" :alt="`${store.video.title} ${index + 1}`" class="photo-img" loading="lazy" />
                <figcaption>
                  <button class="btn btn-download btn-photo" @click="handleDownloadImage(image, index)">
                    Download
                  </button>
                </figcaption>
              </figure>
            </div>
            <div class="download-actions">
              <button class="btn btn-download" @click="handleDownloadAllImages(store.video.images)">
                Download All ({{ store.video.imagesCount }})
              </button>
            </div>
          </div>
        </template>
        <template v-else>
        <div class="video-card">
          <div class="video-player">
            <img :src="store.video.cover" :alt="store.video.title" class="video-cover" loading="lazy" />
            <div class="video-info">
              <span class="info-badge">{{ Math.floor(store.video.duration / 60) }}:{{ String(store.video.duration %
                60).padStart(2, '0') }}</span>
              <span class="info-badge">{{ (store.video.plays / 1000000).toFixed(1) }}M plays</span>
            </div>
          </div>
          <div class="video-meta">
            <div class="author-row">
              <img :src="store.video.authorAvatar" :alt="store.video.author" class="author-avatar" loading="lazy" />
              <span class="author-name">{{ store.video.author }}</span>
            </div>
            <p class="video-title">{{ store.video.title }}</p>
            <div class="stats-row">
              <span>❤️ {{ store.video.likes }}</span>
              <span>💬 {{ store.video.comments }}</span>
              <span>🔗 {{ store.video.shares }}</span>
            </div>
          </div>
          <div class="download-actions">
            <button class="btn btn-download" @click="handleDownload(store.video.videoUrl, 'no_watermark')">
              Download No Watermark
            </button>
            <button class="btn btn-download btn-hd" @click="handleDownload(store.video.videoUrlHd, 'hd')">
              Download HD
            </button>
            <button class="btn btn-download btn-music" @click="handleDownloadAudio(store.video.musicUrl)">
              Download Audio
            </button>
          </div>
        </div>
        </template>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #ff0050, #00f2ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.url-form {
  margin-bottom: 2rem;
}

.howto {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.howto-title {
  font-size: 1rem;
  margin: 0 0 0.5rem;
}

.howto-steps {
  margin: 0;
  padding-left: 1.25rem;
  color: #555;
  font-size: 0.925rem;
  line-height: 1.7;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: #ff0050;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.1s;
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: linear-gradient(135deg, #ff0050, #00f2ea);
  color: #fff;
  white-space: nowrap;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-msg {
  color: #e53935;
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
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
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.photo-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  padding: 0 1rem 1rem;
}

.photo-item {
  margin: 0;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}

.photo-img {
  width: 100%;
  display: block;
  aspect-ratio: 9 / 16;
  object-fit: cover;
}

.photo-item figcaption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 0.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.btn-photo {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.video-player {
  position: relative;
  background: #000;
}

.video-cover {
  width: 100%;
  display: block;
  aspect-ratio: 9 / 16;
  object-fit: cover;
}

.video-info {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.info-badge {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.video-meta {
  padding: 1rem;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 600;
}

.video-title {
  margin: 0 0 0.75rem;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats-row {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.download-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.btn-download {
  justify-content: center;
  background: #ff0050;
  color: #fff;
}

.btn-hd {
  background: #00c853;
}

.btn-music {
  background: #7c4dff;
}
</style>
