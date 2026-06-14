# Sempa — website

Static marketing + docs site for Sempa. Plain HTML/CSS/JS — no build step, no
database, no framework. Drop the contents of this folder onto any static host.

## Pages
- `index.html` — home (hero, philosophy, features, theme showcase, privacy, donate)
- `features.html` — full feature showcase (live UI elements) + keyboard shortcuts
- `download.html` — server-first flow; live per-platform links from the GitHub
  Releases API + older-versions menu; coming-soon clients
- `docs.html` — user guide + self-hosting (incl. Tailscale) with a sticky TOC
- `contribute.html` — help-wanted (clients, integrations, packaging) + dev setup
- `donate.html` — GitHub Sponsors + Ko-fi
- `open-source.html` — project-health hub: description, source, AGPL-3.0 license,
  User Guide, issues, contributing, security-vulnerability reporting, discussions
- `privacy.html` — privacy policy (self-hosted app, Android app, this website)

## Assets (`assets/`)
- `site.css` — all styles, built on the app's `--sempa-*` token layer
- `themes.css` — the six theme token sets (imported by site.css); the site itself
  is themeable via the palette button in the nav (persists to localStorage)
- `site.js` — theme switcher, mobile nav, scroll-reveal, GitHub Releases fetch
- `img/` — fallback mockup PNGs (the hero uses a live, themeable mockup instead)

## Things to wire before launch
1. **Donation links** — replace the placeholders:
   - GitHub Sponsors: `https://github.com/sponsors/moorew` (donate.html, twice)
   - Ko-fi: `https://ko-fi.com/clevercode` (donate.html)
2. **Releases** — the Download page reads `api.github.com/repos/moorew/sempa/releases`
   live. Until the repo has published releases (with `.msi` / `.apk` assets), it
   gracefully falls back to linking `…/releases/latest`. Asset matching uses
   filename patterns (`*x64*.msi`, `*arm64*.msi`, `*.apk`) — adjust in `site.js`
   (`matchAsset` calls) if your release asset names differ.
3. **Open Graph / favicon** — add a favicon and `og:image` when ready (not included).

## Hosting (sempa.ca)
A `CNAME` file (containing `sempa.ca`) is included for **GitHub Pages** custom
domains. Options:
- **GitHub Pages** — push `site/` to a repo (or `/docs`), enable Pages, set the
  custom domain to `sempa.ca`, and point a DNS `CNAME`/`ALIAS` at the Pages host.
- **Cloudflare Pages / Netlify** — connect the repo, set output dir to `site/`,
  add `sempa.ca` as a custom domain. (Delete or ignore the `CNAME` file on these.)

No server-side code is required anywhere.
