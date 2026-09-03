<script setup lang="ts">
</script>

<template>
  <main class="about">
    <section class="about-hero">
      <h1 class="about-title">About</h1>
      <p class="about-description">
        Một công cụ web miễn phí để lưu nội dung TikTok & YouTube — TikTok không logo HD, trích xuất âm thanh,
        album ảnh, và YouTube video/audio chất lượng cao, tất cả trực tiếp trong trình duyệt của bạn.
      </p>
    </section>

    <section class="about-section">
      <h2 class="section-label">Features</h2>
      <div class="card-grid">
        <article class="card">
          <h3 class="card-title">TikTok Video</h3>
          <p class="card-text">
            Lưu video TikTok ở cả chất lượng tiêu chuẩn và HD mà không có logo.
          </p>
        </article>
        <article class="card">
          <h3 class="card-title">YouTube Video & Audio</h3>
          <p class="card-text">
            Tải video YouTube đến 4K hoặc tách riêng âm thanh MP3 với nhiều mức chất lượng.
          </p>
        </article>
        <article class="card">
          <h3 class="card-title">Photo carousels</h3>
          <p class="card-text">
            Tải xuống từng ảnh hoặc toàn bộ album từ một bài đăng ảnh TikTok.
          </p>
        </article>
        <article class="card">
          <h3 class="card-title">Instant preview</h3>
          <p class="card-text">
            Xem thông tin tác giả, tiêu đề, thumbnail và stats trước khi tải xuống.
          </p>
        </article>
      </div>
    </section>

    <section class="about-section">
      <h2 class="section-label">Supported Links — TikTok</h2>
      <ul class="link-list">
        <li>Video - <code>tiktok.com/@user/video/…</code></li>
        <li>Hình ảnh - <code>tiktok.com/@user/photo/…</code></li>
        <li>Link rút gọn - <code>vm.tiktok.com/…</code> and <code>vt.tiktok.com/…</code></li>
        <li>Link mobile - <code>m.tiktok.com/v/…</code></li>
      </ul>
    </section>

    <section class="about-section">
      <h2 class="section-label">Supported Links — YouTube</h2>
      <ul class="link-list">
        <li>Video - <code>youtube.com/watch?v=…</code></li>
        <li>Shorts - <code>youtube.com/shorts/…</code></li>
        <li>Rút gọn - <code>youtu.be/…</code> and <code>m.youtube.com/…</code></li>
        <li>ID thuần - <code>11 ký tự ID</code> (ví dụ <code>dQw4w9WgXcQ</code>)</li>
      </ul>
    </section>

    <section class="about-section">
      <h2 class="section-label">Tech Stack</h2>
      <div class="stack-tags">
        <span class="tag">Vue 3</span>
        <span class="tag">TypeScript</span>
        <span class="tag">Pinia</span>
        <span class="tag">Vite</span>
        <span class="tag">Tailwind CSS</span>
        <span class="tag"><a href="https://www.tikwm.com/" target="_blank" rel="noopener">TikWM API</a></span>
        <span class="tag"><a href="https://cobalt.tools/" target="_blank" rel="noopener">Cobalt API</a></span>
        <span class="tag">YouTube oEmbed</span>
      </div>
    </section>

    <section class="about-section">
      <h2 class="section-label">How It Works</h2>
      <div class="card card-wide">
        <p class="card-text">
          <strong>TikTok:</strong> Dán link bài đăng vào <strong>TikTok</strong> tab. Web gửi tới
          <a class="card-link" href="https://www.tikwm.com/" target="_blank" rel="noopener">TikWM API</a>
          để giải quyết bài đăng và trả về URL video/ảnh, tác giả và stats. Bạn có thể tải video không logo, bản HD,
          audio hoặc toàn bộ album ảnh.<br /><br />
          <strong>YouTube:</strong> Dán link video/Shorts vào <strong>YouTube</strong> tab. Web dùng
          <a class="card-link" href="https://www.youtube.com/oembed" target="_blank" rel="noopener">YouTube oEmbed</a>
          để preview tiêu đề & thumbnail, sau đó gọi
          <a class="card-link" href="https://cobalt.tools/" target="_blank" rel="noopener">Cobalt API</a>
          (api.cobalt.tools / co.wuk.sh) để lấy link tải trực tiếp video hoặc audio theo chất lượng bạn chọn. Tất cả
          phía client, không cần tài khoản.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about {
  max-width: 720px;
  margin: 0 auto;
}

.about-hero {
  text-align: center;
  margin-bottom: 3rem;
}

.about-title {
  font-family: 'Public Sans', 'Public Sans Fallback: BlinkMacSystemFont',
    'Public Sans Fallback: Segoe UI', 'Public Sans Fallback: Helvetica Neue',
    'Public Sans Fallback: Arial', 'Public Sans Fallback: Noto Sans', sans-serif;
  font-size: 2.75rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  line-height: 1.15;
}

.about-description {
  max-width: 520px;
  margin: 0 auto;
  color: var(--ui-fg-muted);
  line-height: 1.6;
}

.about-section {
  margin-bottom: 2.5rem;
}

.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-fg-muted);
  margin: 0 0 0.75rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.card {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: 1.25rem;
  box-shadow: var(--ui-shadow-sm);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card:hover {
  border-color: var(--ui-primary);
  box-shadow: var(--ui-shadow-lg);
}

.card-wide {
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: 1.5rem;
  box-shadow: var(--ui-shadow-sm);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.card-text {
  color: var(--ui-fg-muted);
  font-size: 0.925rem;
  line-height: 1.6;
  margin: 0;
}

.link-list {
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  overflow: hidden;
}

.link-list li {
  padding: 0.875rem 1.25rem;
  color: var(--ui-fg-muted);
  font-size: 0.925rem;
  border-bottom: 1px solid var(--ui-border);
}

.link-list li:last-child {
  border-bottom: none;
}

code {
  background: var(--ui-bg-muted);
  color: var(--ui-fg);
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  font-size: 0.875em;
}

.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ui-fg);
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
}

.tag a {
  color: inherit;
  text-decoration: none;
}

.tag a:hover {
  color: var(--ui-primary);
}

.card-link {
  color: var(--ui-primary);
  text-decoration: none;
}

.card-link:hover {
  text-decoration: underline;
}
</style>
