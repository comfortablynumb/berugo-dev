# berugo.dev — Developer Tools

Browser-based developer tools SPA. No backend — everything runs in the browser.

## Tools

### Encoding / Decoding
| Tool | Description |
|------|-------------|
| **Base64** | Encode/decode text (UTF-8 safe) |
| **URL Codec** | `encodeURIComponent` / `decodeURIComponent` |
| **HTML Entities** | Encode/decode HTML entities (`&amp;`, `&lt;`, `&gt;` etc.) |
| **String Escape** | Escape/unescape JSON-safe strings (`\n`, `\t`, `\\`, etc.) |
| **Image to Base64** | Convert images to Base64 data URLs for embedding in HTML/CSS |

### Crypto & Security
| Tool | Description |
|------|-------------|
| **Hash Generator** | SHA-1, SHA-256, SHA-384, SHA-512 via Web Crypto API |
| **HMAC Signature** | Sign messages with HMAC-SHA-1/256/384/512; output as hex or base64 |
| **TOTP Generator** | Live time-based OTP codes (RFC 6238) from a base32 secret |

### JWT
| Tool | Description |
|------|-------------|
| **JWT Decoder** | Parse header + payload from any JWT (no signature check) |
| **JWT Verifier** | Verify JWT signature with HMAC secret or RSA/EC public key |
| **JWT Generator** | Build and sign JWTs with HS256/RS256/ES256 etc. |
| **JWKS Generator** | Generate RSA-2048 or EC P-256 key pairs as JWKS |

### Format & Transform
| Tool | Description |
|------|-------------|
| **JSON Formatter** | Format, validate, and minify JSON |
| **CSV ↔ JSON** | Convert between CSV and JSON array of objects |
| **Number Base** | Convert between binary, octal, decimal, and hex (live) |
| **Color Converter** | Convert between HEX, RGB, and HSL (live) |
| **String Case** | camelCase, PascalCase, snake_case, kebab-case, UPPER_SNAKE, Title Case |
| **JSON → TypeScript** | Generate TypeScript interfaces from a JSON sample |
| **XML Formatter** | Format, validate, and minify XML |
| **HTML Beautifier** | Indent and format, or minify HTML markup |
| **YAML ↔ JSON** | Convert between YAML and JSON |
| **JSON Schema** | Validate JSON data against a JSON Schema |
| **JSON Diff** | Semantic diff of two JSON structures — added, removed, changed |
| **Unit Converter** | Length, weight, temperature, data, time, speed, area, volume |
| **Chmod Calculator** | Toggle permission bits or enter octal/symbolic → full Unix chmod breakdown |
| **Hex Dump** | View text as a hex dump: offset · hex bytes · ASCII columns |

### Network
| Tool | Description |
|------|-------------|
| **URL Parser** | Break a URL into protocol, host, path, port, query params, hash |
| **CIDR Calculator** | Subnet mask, broadcast, host range from CIDR notation |

### Generators
| Tool | Description |
|------|-------------|
| **UUID Generator** | Generate v4 UUIDs in bulk (1–100) |
| **Timestamp Converter** | Unix timestamp (s/ms) or date string → UTC / ISO / local |
| **Lorem Ipsum** | Generate placeholder words, sentences, or paragraphs |
| **Password Generator** | Cryptographically secure passwords with custom character sets |
| **Cron Parser** | Describe cron expressions and preview next run times |
| **Nano ID** | Tiny, URL-safe unique IDs with custom alphabet and length |
| **QR Code** | Generate QR codes from any text or URL |
| **Date Calculator** | Difference between two dates; add/subtract a duration from a date |

### Text
| Tool | Description |
|------|-------------|
| **Regex Tester** | Test regex patterns with live match inspection and group capture |
| **Diff** | Compare two texts line by line, highlight additions and removals |
| **Markdown Preview** | Render Markdown to HTML with live preview |
| **Text Stats** | Character, word, sentence, and byte counts |
| **Sort / Dedupe Lines** | Sort, reverse, shuffle, and deduplicate lines |

## Tech Stack

- **jQuery 3.x** — CDN
- **Tailwind CSS 3.x** — CLI build
- **jose 5.x** — ESM CDN (JWT/JWKS operations)
- **Web Crypto API** — Hashing, key generation, TOTP

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

## Adding a Tool

1. Create `src/js/tools/<name>.js` exporting `init<Name>()`
2. Import + call it in `src/js/app.js`
3. Add nav items (`data-tool="<id>"`) and panel (`id="panel-<id>"`) in `index.html`
4. Add a home card in `#panel-home`

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
│       └── tools/          (one file per tool)
├── dist/css/main.css       (generated)
├── package.json
├── tailwind.config.js
└── .github/workflows/deploy.yml
```
