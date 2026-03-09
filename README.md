# berugo.dev — Developer Tools

Browser-based developer tools SPA. No backend — everything runs in the browser.

## Tools

### Encoding / Decoding
| Tool | Description |
|------|-------------|
| **Base64** | Encode/decode text (UTF-8 safe) |
| **URL Codec** | `encodeURIComponent` / `decodeURIComponent` |
| **HTML Entities** | Encode/decode HTML entities (`&amp;`, `&lt;`, `&gt;` etc.) |

### Crypto & Security
| Tool | Description |
|------|-------------|
| **Hash Generator** | SHA-1, SHA-256, SHA-384, SHA-512 via Web Crypto API |
| **JWT Decoder** | Parse header + payload from any JWT (no signature check) |
| **JWT Verifier** | Verify JWT signature with HMAC secret or RSA/EC public key |
| **JWT Generator** | Build and sign JWTs with HS256/RS256/ES256 etc. |
| **JWKS Generator** | Generate RSA-2048 or EC P-256 key pairs as JWKS |

### Format & Transform
| Tool | Description |
|------|-------------|
| **JSON Formatter** | Format, validate, and minify JSON |
| **Number Base** | Convert between binary, octal, decimal, and hex (live) |
| **Color Converter** | Convert between HEX, RGB, and HSL (live) |
| **String Case** | camelCase, PascalCase, snake_case, kebab-case, UPPER_SNAKE, Title Case |

### Generators
| Tool | Description |
|------|-------------|
| **UUID Generator** | Generate v4 UUIDs in bulk (1–100) |
| **Timestamp Converter** | Unix timestamp (s/ms) or date string → UTC / ISO / local |

### Text
| Tool | Description |
|------|-------------|
| **Regex Tester** | Test regex patterns with live match inspection and group capture |

## Tech Stack

- **jQuery 3.x** — CDN
- **Tailwind CSS 3.x** — CLI build
- **jose 5.x** — ESM CDN (JWT/JWKS operations)
- **Web Crypto API** — Key generation

## Development

```bash
npm install
npm run dev     # Starts CSS watcher + HTTP server at http://localhost:3000
```

Open `http://localhost:3000` in a browser. ES modules require a server (`file://` won't work).

## Build

```bash
npm run build   # Minified CSS → dist/css/main.css
```

## Deploy

Push to `main` — GitHub Actions builds CSS and deploys to GitHub Pages automatically.

**Setup required (once):**
1. Repo Settings → Pages → Source: **GitHub Actions**
2. Push to `main`

## JWT Usage Examples

### Verifier — HMAC secret
Paste your JWT, enter the shared secret string, click **Verify**.

### Verifier — RSA public key (PEM)
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9...
-----END PUBLIC KEY-----
```

### Verifier — EC public key (JWK JSON)
```json
{"kty":"EC","crv":"P-256","x":"...","y":"..."}
```

### Generator — HMAC
Select `HS256`, enter any string as the secret, provide a JSON payload.

### Generator — RSA/EC
Select `RS256`/`ES256`, paste a PEM private key or private JWK JSON.

## Project Structure

```
berugo-dev/
├── index.html
├── src/
│   ├── css/main.css
│   └── js/
│       ├── app.js
│       ├── utils.js
│       └── tools/
│           ├── base64.js
│           ├── url-codec.js
│           ├── html-entities.js
│           ├── hash.js
│           ├── jwt.js
│           ├── jwks.js
│           ├── json-formatter.js
│           ├── number-base.js
│           ├── color-converter.js
│           ├── string-case.js
│           ├── uuid.js
│           ├── timestamp.js
│           └── regex.js
├── dist/css/main.css     (generated)
├── package.json
├── tailwind.config.js
└── .github/workflows/deploy.yml
```
