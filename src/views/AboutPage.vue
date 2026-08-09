<script setup lang="ts">
</script>

<template>
  <main class="about">
    <section class="about-hero">
      <h1 class="about-title">About TikTok Downloader</h1>
      <p class="about-description">
        A free web tool to save TikTok content without watermarks — videos in HD,
        extracted audio, and full photo albums, all directly in your browser.
      </p>
    </section>

    <section class="about-section">
      <h2 class="section-label">Features</h2>
      <div class="card-grid">
        <article class="card">
          <h3 class="card-title">Video downloads</h3>
          <p class="card-text">
            Save TikTok videos in both standard and HD quality without watermark.
          </p>
        </article>
        <article class="card">
          <h3 class="card-title">Audio extraction</h3>
          <p class="card-text">
            Download the soundtrack of any video as a ready-to-use MP3 file.
          </p>
        </article>
        <article class="card">
          <h3 class="card-title">Photo carousels</h3>
          <p class="card-text">
            Download individual photos or the entire album from a photo post.
          </p>
        </article>
        <article class="card">
          <h3 class="card-title">Instant preview</h3>
          <p class="card-text">
            See the post's author, caption, and engagement stats before downloading.
          </p>
        </article>
      </div>
    </section>

    <section class="about-section">
      <h2 class="section-label">Supported Links</h2>
      <ul class="link-list">
        <li><code>tiktok.com/@user/video/…</code> — video posts</li>
        <li><code>tiktok.com/@user/photo/…</code> — photo posts</li>
        <li><code>vm.tiktok.com/…</code> and <code>vt.tiktok.com/…</code> — short share links</li>
        <li><code>m.tiktok.com/v/…</code> — mobile links</li>
      </ul>
    </section>

    <section class="about-section">
      <h2 class="section-label">Tech Stack</h2>
      <div class="stack-tags">
        <span class="tag">Vue 3</span>
        <span class="tag">TypeScript</span>
        <span class="tag">Pinia</span>
        <span class="tag">Vite</span>
        <span class="tag"><a href="https://www.tikwm.com/" target="_blank" rel="noopener">TikWM API</a></span>
      </div>
    </section>

    <section class="about-section">
      <h2 class="section-label">How It Works</h2>
      <div class="card card-wide">
        <p class="card-text">
          Paste a TikTok share link into the input on the home page. The app sends it to the
          <a class="card-link" href="https://www.tikwm.com/" target="_blank" rel="noopener">TikWM API</a>,
          which resolves the post and returns the media URLs together with the author, caption, and
          stats. You can then download the no-watermark video, HD version, the audio track, or every
          photo in the album — all client-side, with no account or sign-up required.
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
  font-size: 2.5rem;
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
