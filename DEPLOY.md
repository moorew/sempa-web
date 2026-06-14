# Deploying sempa.ca (GoDaddy domain → free hosting)

Your domain is **registered** at GoDaddy, but its **nameservers point at Fastmail**,
so **Fastmail is where your DNS actually lives** — that's where you edit records.
Records added in GoDaddy's DNS panel are ignored while Fastmail's nameservers are
active. You only change DNS to point at a free static host. Recommended host:
**GitHub Pages** (your code's already on GitHub; HTTPS is free and automatic). A
Cloudflare alternative is at the bottom.

> **Where do I edit DNS?** Wherever your *authoritative nameservers* are. Yours are
> Fastmail's, so do all DNS edits in **Fastmail → Settings → Domains → sempa.ca →
> DNS**. Don't bother with GoDaddy's DNS screen — it's not in the path.
>
> **Verifying the domain with GitHub is not enough on its own.** That just adds a
> `_github-pages-challenge-…` TXT record so nobody else can claim the domain; it
> does **not** make the site load. You still need the A + CNAME records in step 4.
> Keep the verification TXT record in place.

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

### 4. Point your DNS at GitHub — **at Fastmail, not GoDaddy**
Fastmail → **Settings → Domains → sempa.ca → DNS** (the custom / advanced records
section). Add these records:

| Type | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| A | `@` | `185.199.108.153` | 1 hr |
| A | `@` | `185.199.109.153` | 1 hr |
| A | `@` | `185.199.110.153` | 1 hr |
| A | `@` | `185.199.111.153` | 1 hr |
| CNAME | `www` | `moorew.github.io.` | 1 hr |

**Your email keeps working.** Fastmail runs your mail *and* your DNS, but web (`A`)
and mail (`MX`) are different record types and live side-by-side at the apex `@`.
So:
- **Leave every Fastmail mail record exactly as-is** — the `MX` records, the SPF/
  DKIM/DMARC `TXT` records, any `SRV` and `autodiscover`/`autoconfig` records. The
  four `A` records above sit alongside them and do not touch email.
- **Remove only** an existing apex web record that points somewhere else — i.e. any
  `A @`, `ALIAS @` or `ANAME @` aimed at a Fastmail landing/redirect page, and any
  `CNAME @`. (You can't have a `CNAME` on the apex next to other records anyway,
  which is why GitHub uses four `A` records here.)
- Keep the GitHub `_github-pages-challenge-…` `TXT` verification record.
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

> ⚠️ **Email warning for the Cloudflare route:** because your DNS currently lives at
> Fastmail, switching nameservers to Cloudflare moves *all* DNS — including your
> email records — to Cloudflare. If you go this way you must first re-create every
> Fastmail mail record (MX, SPF/DKIM/DMARC TXT, SRV, autodiscover) in Cloudflare,
> or your email will stop working. Option A (add records at Fastmail) avoids this
> entirely and is the safer choice for you.

---

## Before launch — wire the donation links
In `donate.html` (and the nav `Support` buttons if you want them to point at a
specific page), replace the placeholders once your accounts exist:
- **GitHub Sponsors:** `https://github.com/sponsors/moorew`
- **Ko-fi:** `https://ko-fi.com/clevercode`

Set up GitHub Sponsors (Settings → Sponsors, links a bank via Stripe) and a Ko-fi
account (payout via PayPal or Stripe) first, then drop in the real URLs.

## Optional polish later
- A favicon (`favicon.ico` / `favicon.svg` at the root) and an `og:image` for
  link previews — not included yet.
- A `404.html` for a branded not-found page.
