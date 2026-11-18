// Takes the theme object and applies it to the page:
// CSS variables, fonts, the tab title and the tab icon.

/** Sets CSS variables like --color-primary that styles/global.css uses. */
export function applyTheme(theme) {
  const root = document.documentElement;
  const c = theme.colors;
  const vars = {
    '--bg': c.background,
    '--bg-accent': c.backgroundAccent,
    '--surface': c.surface,
    '--text': c.text,
    '--muted': c.muted,
    '--primary': c.primary,
    '--primary-text': c.primaryText,
    '--good': c.good,
    '--bad': c.bad,
    '--font-display': theme.fonts.display,
    '--font-body': theme.fonts.body,
  };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  Object.entries(theme.pads).forEach(([key, pad]) => root.style.setProperty(`--pad-${key}`, pad.color));

  document.title = theme.gameTitle;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.background);
  loadFonts(theme.fontsUrl);
  setEmojiFavicon(theme.logoEmoji);
}

/** Adds the Google Fonts stylesheet once. */
function loadFonts(url) {
  if (!url || document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

/** Turns an emoji into the browser-tab icon. */
function setEmojiFavicon(emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${emoji}</text></svg>`;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
