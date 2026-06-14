# Deploying sempa.ca (GoDaddy domain → free hosting)

Your domain is registered at **GoDaddy**. Keep it there — you only change its DNS
to point at a free static host. Recommended host: **GitHub Pages** (your code's
already on GitHub; HTTPS is free and automatic). A Cloudflare alternative is at
the bottom.

Recurring cost with this setup: just your existing GoDaddy `.ca` renewal. Hosting,
HTTPS and DNS are all free.

---

## A · GitHub Pages (recommended)

### 1. Put the site in a repo
Pick one:
- **Dedicated repo (cleanest):** create a public repo, e.g. `moorew/sempa-web`,
  and upload the **contents of this `site/` folder** to its root
  (`index.html`, `assets/`, `CNAME`, etc. at the top level).
- **Or reuse `moorew/sempa`:** copy the `site/` contents into a `/docs` folder on
  `main`.

The included **`CNAME` file already contains `sempa.ca`** — keep it at the repo
root (or in `/docs`). It tells Pages which domain to serve.

### 2. Turn on Pages
Repo → **Settings → Pages**:
- **Source:** Deploy from a branch
- **Branch:** `main`, folder `/ (root)` (or `/docs` if you used that)
- Save. The first build takes a minute or two.

### 3. Set the custom domain
Still in **Settings → Pages → Custom domain**: enter `sempa.ca`, Save.
(It may already be filled in from the `CNAME` file.) Leave **Enforce HTTPS**
unchecked until the certificate finishes provisioning (step 5).

### 4. Point GoDaddy DNS at GitHub
GoDaddy → **My Products → sempa.ca → DNS / Manage DNS**. Make these records:

| Type | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| A | `@` | `185.199.108.153` | 1 hr |
| A | `@` | `185.199.109.153` | 1 hr |
| A | `@` | `185.199.110.153` | 1 hr |
| A | `@` | `185.199.111.153` | 1 hr |
| CNAME | `www` | `moorew.github.io.` | 1 hr |

Then:
- **Delete** GoDaddy's default parked `A @` record (often `Parked`/an IP) and any
  `CNAME @`.
- Turn **off** GoDaddy "Domain Forwarding" if it's enabled (it overrides the above).
- Use **your GitHub username** in the `www` CNAME — `moorew.github.io` matches the
  `moorew/sempa` repo owner.

### 5. Wait, then lock it in
DNS can take from a few minutes up to a couple of hours. Once `https://sempa.ca`
loads, go back to **Settings → Pages** and tick **Enforce HTTPS**. Done.

> Note: a custom domain can only be attached to **one** GitHub Pages site per
> account at a time.

---

## B · Cloudflare alternative (also free)
If you'd rather have Cloudflare's DNS/caching/analytics:
1. Create a free Cloudflare account, **Add site** `sempa.ca`. Cloudflare gives you
   two nameservers.
2. In **GoDaddy → Nameservers**, switch from "GoDaddy default" to **Custom** and
   paste Cloudflare's two nameservers.
3. Use **Cloudflare Pages**: connect the GitHub repo, set the build output
   directory to `/` (the files are pre-built — no build command), add `sempa.ca`
   as a custom domain. Cloudflare wires DNS + HTTPS automatically.
4. On Cloudflare Pages the `CNAME` file is harmless but unused — you can ignore it.

GoDaddy stays your registrar in both options; only DNS/nameservers change.

---

## Before launch — wire the donation links
In `donate.html` (and the nav `Support` buttons if you want them to point at a
specific page), replace the placeholders once your accounts exist:
- **GitHub Sponsors:** `https://github.com/sponsors/moorew`
- **Ko-fi:** `https://ko-fi.com/moorew`

Set up GitHub Sponsors (Settings → Sponsors, links a bank via Stripe) and a Ko-fi
account (payout via PayPal or Stripe) first, then drop in the real URLs.

## Optional polish later
- A favicon (`favicon.ico` / `favicon.svg` at the root) and an `og:image` for
  link previews — not included yet.
- A `404.html` for a branded not-found page.
