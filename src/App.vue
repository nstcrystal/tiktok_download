<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'

const dark = ref(false)

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark')
})

function toggleTheme() {
  dark.value = !dark.value
  document.documentElement.classList.toggle('dark', dark.value)
  document.documentElement.style.colorScheme = dark.value ? 'dark' : 'light'
  localStorage.setItem('theme', dark.value ? 'dark' : 'light')
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <a href="https://nstcrystal.is-a.dev" class="logo">NSTCrystal</a>
      <nav class="nav">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/about" class="nav-link">About</RouterLink>
        <button class="theme-toggle" :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme">
          <span v-if="dark" class="theme-icon">☀️</span>
          <span v-else class="theme-icon">🌙</span>
        </button>
      </nav>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
    <footer class="app-footer">
      <p class="footer-credits">© {{ new Date().getFullYear() }} • NSTCrystal. All rights reserved</p>
      <div class="footer-links">
        <a href="https://github.com/nstcrystal" target="_blank" rel="noopener" aria-label="GitHub"
          class="footer-link">GitHub</a>
        <a href="mailto:nstcrystal@gmail.com" aria-label="Email" class="footer-link">Email</a>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --ui-bg: #ffffff;
  --ui-bg-muted: #f5f5f5;
  --ui-bg-elevated: #ffffff;
  --ui-fg: #18181b;
  --ui-fg-muted: #52525b;
  --ui-border: #e4e4e7;
  --ui-primary: #2563eb;
  --ui-primary-hover: #1d4ed8;
  --ui-primary-fg: #ffffff;
  --ui-danger: #dc2626;
  --ui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --ui-shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.08);
  --ui-radius: 12px;
}

.dark {
  --ui-bg: #020618;
  --ui-bg-muted: #0b1120;
  --ui-bg-elevated: #0b1120;
  --ui-fg: #f4f4f5;
  --ui-fg-muted: #a1a1aa;
  --ui-border: #27272a;
  --ui-primary: #3b82f6;
  --ui-primary-hover: #2563eb;
  --ui-primary-fg: #ffffff;
  --ui-danger: #ef4444;
  --ui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --ui-shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.5);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Public Sans', 'Public Sans Fallback: BlinkMacSystemFont',
    'Public Sans Fallback: Segoe UI', 'Public Sans Fallback: Helvetica Neue',
    'Public Sans Fallback: Arial', 'Public Sans Fallback: Noto Sans', sans-serif;
  background: var(--ui-bg);
  color: var(--ui-fg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

::selection {
  color: var(--ui-fg);
  background: var(--ui-bg-muted);
}

.dark ::selection {
  color: var(--ui-fg);
  background: var(--ui-border);
}

img,
a {
  -webkit-user-drag: none;
}

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 896px;
  margin: 0 auto;
  padding: 0 1rem;
  border-left: 1px solid var(--ui-border);
  border-right: 1px solid var(--ui-border);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0;
}

.logo {
  font-size: 1.125rem;
  font-weight: 700;
  text-decoration: none;
  color: var(--ui-fg);
  transition: color 0.2s;
}

.logo:hover {
  color: var(--ui-primary);
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: color-mix(in srgb, var(--ui-bg-muted) 80%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--ui-border) 50%, transparent);
  border-radius: 9999px;
  padding: 0.25rem 0.375rem;
  box-shadow: var(--ui-shadow-lg);
}

.nav-link {
  text-decoration: none;
  color: var(--ui-fg-muted);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  transition: color 0.2s, background 0.2s;
}

.nav-link:hover {
  color: var(--ui-fg);
}

.nav-link.router-link-exact-active {
  color: var(--ui-fg);
  background: var(--ui-bg-elevated);
  box-shadow: var(--ui-shadow-sm);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.theme-toggle:hover {
  background: var(--ui-bg-muted);
}

.theme-icon {
  font-size: 1rem;
  line-height: 1;
}

.app-main {
  flex: 1;
  padding: 2.5rem 0 3rem;
}

.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0 2rem;
  border-top: 1px solid var(--ui-border);
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-credits {
  font-size: 0.75rem;
  color: var(--ui-fg-muted);
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-link {
  font-size: 0.75rem;
  color: var(--ui-fg-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--ui-primary);
}

@media (max-width: 480px) {
  .logo {
    display: none;
  }

  .app-header {
    justify-content: center;
  }

  .app-footer {
    justify-content: center;
    text-align: center;
  }
}
</style>
