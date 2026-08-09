<script setup lang="ts">
</script>

<template>
  <main class="about">
    <h1>About TikTok Downloader</h1>
    <p class="lead">
      TikTok Downloader is a free web tool that lets you save TikTok content without
      watermarks. Paste a share link and download it in high quality with just one click.
    </p>

    <section class="feature-list">
      <h2>Features</h2>
      <ul>
        <li>
          <strong>Video downloads</strong> — Save TikTok videos in both standard and HD quality
          without watermark.
        </li>
        <li>
          <strong>Audio extraction</strong> — Download the soundtrack of any video as an MP3 file.
        </li>
        <li>
          <strong>Photo carousels</strong> — Download individual photos or the entire album from a
          TikTok photo post.
        </li>
        <li>
          <strong>Instant preview</strong> — See the post's author, caption, and engagement stats
          before downloading.
        </li>
      </ul>
    </section>

    <section class="feature-list">
      <h2>Supported Links</h2>
      <ul>
        <li>Video posts — <code>tiktok.com/@user/video/…</code></li>
        <li>Photo posts — <code>tiktok.com/@user/photo/…</code></li>
        <li>Short share links — <code>vm.tiktok.com/…</code> and <code>vt.tiktok.com/…</code></li>
        <li>Mobile links — <code>m.tiktok.com/v/…</code></li>
      </ul>
    </section>

    <section class="feature-list">
      <h2>Tech Stack</h2>
      <ul>
        <li>Vue 3 with TypeScript and Pinia for state management</li>
        <li>Vite for fast development and optimized production builds</li>
        <li>Powered by the <a href="https://www.tikwm.com/" target="_blank" rel="noopener">TikWM API</a></li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.about {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;
  line-height: 1.6;
}

.lead {
  color: #555;
  margin-bottom: 1.5rem;
}

.feature-list {
  margin-bottom: 1.5rem;
}

.feature-list h2 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.feature-list ul {
  padding-left: 1.25rem;
  color: #444;
}

.feature-list li {
  margin-bottom: 0.35rem;
}

code {
  background: #eee;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.875em;
}

a {
  color: #ff0050;
}
</style>
