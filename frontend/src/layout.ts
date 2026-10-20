import type { CommonData } from './types'

export function renderLayout(common: CommonData, content: string, currentPath: string): string {
  const nav = common.nav
    .map(item => `<a href="${item.path}" class="${item.path === currentPath ? 'active' : ''}">${item.label}</a>`)
    .join('')

  const footerLinks = common.footer.links
    .map(l => `<a href="${l.path}">${l.label}</a>`)
    .join('')

  return `
    <header class="p-topbar">
      <button class="p-burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="p-nav">
        <span></span><span></span><span></span>
      </button>
      <a class="p-brand" href="/">${common.siteName}</a>
      <nav class="p-nav" id="p-nav">${nav}</nav>
      <div class="p-actions">
        <button class="btn ghost" id="theme-toggle" type="button">◐</button>
        <a class="btn primary p-signin" href="/login">Sign In</a>
      </div>
    </header>

    <main class="p-main content">
      ${content}
    </main>

    <footer class="p-footer">
      <div class="p-foot-top">
        <div class="p-foot-brand">${common.siteName}</div>
        <nav class="p-foot-nav">${footerLinks}</nav>
      </div>
      <div class="p-copy">${common.footer.copy}</div>
    </footer>

    <div class="nav-overlay" id="nav-overlay"></div>
  `
}
