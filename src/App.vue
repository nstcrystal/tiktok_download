<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink to="/" class="logo">TikTok Downloader</RouterLink>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/about" class="nav-link">About</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  background: #f5f5f5;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
  background: linear-gradient(135deg, #ff0050, #00f2ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #ff0050;
}

.nav-link.router-link-exact-active {
  color: #ff0050;
}
</style>
