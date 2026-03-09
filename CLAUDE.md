# berugo-dev

Browser-only SPA developer tools. No backend.

## Stack
- jQuery 3.x (CDN), Tailwind CSS 3 (CLI), jose 5.x (ESM CDN), Web Crypto API

## Structure
```
index.html          # SPA shell — all tool panels here
src/css/main.css    # Tailwind directives + component classes
src/js/app.js       # jQuery init, sidebar nav, theme toggle
src/js/utils.js     # syntaxHighlightJson, copyToClipboard
src/js/tools/       # base64.js, url-codec.js, jwt.js, jwks.js
dist/css/main.css   # Generated (gitignored or built by CI)
.github/workflows/deploy.yml  # CI: build CSS → GitHub Pages
```

## Dev
```bash
npm install && npm run dev
# Serve with a local server (ES modules need HTTP, not file://)
npx serve .
```

## Adding a tool
1. Create `src/js/tools/<name>.js` exporting `init<Name>()`
2. Import + call it in `app.js`
3. Add nav item (`data-tool="<id>"`) and panel (`id="panel-<id>"`) in `index.html`
