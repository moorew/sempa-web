/* ════════════════════════════════════════════════════════════════════════
   SEMPA · website — shared behaviour
   Theme switcher (re-skins the whole site), mobile nav, scroll reveal,
   active-link, and live GitHub Releases fetch for the download page.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Show content even if anything below fails (guards the .reveal hidden state).
  document.documentElement.classList.add('has-reveal');

  var REPO = 'moorew/sempa';

  var THEMES = [
    { id: 'terracotta', label: 'Terracotta', sub: 'Warm clay', sw: '#b3592e' },
    { id: 'forest',     label: 'Forest',     sub: 'Pine green', sw: '#3f6f47' },
    { id: 'plum',       label: 'Plum',       sub: 'Aubergine', sw: '#7a4a9e' },
    { id: 'slate',      label: 'Slate',      sub: 'Graphite', sw: '#4a5a6b' },
    { id: 'oled',       label: 'OLED',       sub: 'Dark only', sw: '#0b0b0b', darkOnly: true },
    { id: 'ocean',      label: 'Ocean',      sub: 'Marine', sw: '#2f6499' }
  ];

  var TKEY = 'sempa-site-theme', MKEY = 'sempa-site-mode';

  function getTheme() { try { return localStorage.getItem(TKEY) || 'terracotta'; } catch (e) { return 'terracotta'; } }
  function getMode()  { try { return localStorage.getItem(MKEY) || 'light'; } catch (e) { return 'light'; } }

  function apply(theme, mode) {
    var t = THEMES.find(function (x) { return x.id === theme; }) || THEMES[0];
    if (t.darkOnly) mode = 'dark';
    var el = document.documentElement;
    el.setAttribute('data-theme', t.id);
    el.classList.toggle('dark', mode === 'dark');
    try { localStorage.setItem(TKEY, t.id); localStorage.setItem(MKEY, mode); } catch (e) {}
    syncUI(t.id, mode);
  }

  function syncUI(theme, mode) {
    document.querySelectorAll('.tp-opt').forEach(function (o) {
      o.classList.toggle('sel', o.getAttribute('data-theme') === theme);
    });
    document.querySelectorAll('.tp-mode button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-mode') === mode);
    });
    var dis = (THEMES.find(function (x){return x.id===theme;})||{}).darkOnly;
    document.querySelectorAll('.tp-mode').forEach(function (m) { m.style.opacity = dis ? '.4' : '1'; m.style.pointerEvents = dis ? 'none' : 'auto'; });
  }

  // Pre-paint apply (also called inline in <head> of each page to avoid flash)
  apply(getTheme(), getMode());

  document.addEventListener('DOMContentLoaded', function () {
    buildSwitcher();
    wireNav();
    revealObserver();
    activeLink();
    if (document.getElementById('releases')) { loadReleases(); recommendArch(); }
    apply(getTheme(), getMode()); // resync UI after DOM ready
  });

  /* ── Theme switcher popover ─────────────────────────────────────────── */
  function buildSwitcher() {
    var pop = document.getElementById('theme-pop');
    if (!pop) return;
    var grid = THEMES.map(function (t) {
      return '<button class="tp-opt" data-theme="' + t.id + '" aria-label="' + t.label + ' theme">' +
        '<span class="tp-sw" style="background:' + t.sw + (t.id === 'oled' ? ';box-shadow:inset 0 0 0 1px #555' : '') + '"></span>' +
        t.label + '</button>';
    }).join('');
    pop.innerHTML =
      '<div class="tp-h">Theme</div><div class="tp-grid">' + grid + '</div>' +
      '<div class="tp-mode">' +
        '<button data-mode="light" aria-label="Light mode">' + ICON.sun + 'Light</button>' +
        '<button data-mode="dark" aria-label="Dark mode">' + ICON.moon + 'Dark</button>' +
      '</div>';

    pop.querySelectorAll('.tp-opt').forEach(function (o) {
      o.addEventListener('click', function () { apply(o.getAttribute('data-theme'), getMode()); });
    });
    pop.querySelectorAll('.tp-mode button').forEach(function (b) {
      b.addEventListener('click', function () { apply(getTheme(), b.getAttribute('data-mode')); });
    });

    var trigger = document.getElementById('theme-trigger');
    if (trigger) {
      trigger.addEventListener('click', function (e) { e.stopPropagation(); pop.classList.toggle('open'); });
      document.addEventListener('click', function (e) { if (!pop.contains(e.target) && e.target !== trigger) pop.classList.remove('open'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pop.classList.remove('open'); });
    }
    syncUI(getTheme(), getMode());
  }

  /* ── Mobile nav ─────────────────────────────────────────────────────── */
  function wireNav() {
    var t = document.getElementById('nav-toggle'), links = document.getElementById('nav-links');
    if (t && links) t.addEventListener('click', function () { links.classList.toggle('open'); });
  }

  /* ── Active link ────────────────────────────────────────────────────── */
  function activeLink() {
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === 'index.html' && href === 'index.html')) a.classList.add('active');
    });
  }

  /* ── Reveal on scroll (rect-based — reliable everywhere, with safety net) ─ */
  function revealObserver() {
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    function check() {
      var vh = window.innerHeight || 800;
      els = els.filter(function (e) {
        if (e.getBoundingClientRect().top < vh * 0.92) { e.classList.add('in'); return false; }
        return true;
      });
      if (!els.length) { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); }
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    setTimeout(function () { document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); }); }, 2600);
  }

  /* ── GitHub Releases (download page) ────────────────────────────────── */
  function matchAsset(assets, patterns) {
    for (var i = 0; i < patterns.length; i++) {
      var re = patterns[i];
      var hit = assets.find(function (a) { return re.test(a.name); });
      if (hit) return hit;
    }
    return null;
  }

  function loadReleases() {
    var fallback = 'https://github.com/' + REPO + '/releases/latest';
    fetch('https://api.github.com/repos/' + REPO + '/releases', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('gh ' + r.status); return r.json(); })
      .then(function (releases) {
        if (!Array.isArray(releases) || !releases.length) throw new Error('no releases');
        var stable = releases.filter(function (r) { return !r.draft && !r.prerelease; });
        var latest = stable[0] || releases[0];
        var assets = latest.assets || [];

        setText('latest-tag', latest.tag_name || 'latest');
        setText('latest-date', latest.published_at ? new Date(latest.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '');

        // Windows
        wireLink('dl-win-x64', matchAsset(assets, [/x64.*\.msi$/i, /x86_64.*\.msi$/i, /\.msi$/i]), fallback, 'win');
        wireLink('dl-win-arm', matchAsset(assets, [/arm64.*\.msi$/i, /aarch64.*\.msi$/i]), null, 'win-arm');
        // Android
        wireLink('dl-android', matchAsset(assets, [/\.apk$/i]), fallback, 'android');
        // Linux
        wireLink('dl-linux-appimage', matchAsset(assets, [/x86_64.*\.appimage$/i, /amd64.*\.appimage$/i, /\.appimage$/i]), fallback, 'linux');
        wireLink('dl-linux-deb', matchAsset(assets, [/amd64.*\.deb$/i, /x86_64.*\.deb$/i, /\.deb$/i]), fallback, 'linux-deb');
        wireLink('dl-linux-rpm', matchAsset(assets, [/x86_64.*\.rpm$/i, /\.rpm$/i]), fallback, 'linux-rpm');

        // Older versions menu
        var menu = document.getElementById('older-list');
        if (menu) {
          menu.innerHTML = stable.slice(0, 8).map(function (r) {
            return '<a href="' + r.html_url + '" target="_blank" rel="noopener" class="older-item">' +
              '<span class="mono">' + (r.tag_name || '') + '</span>' +
              '<span class="dim">' + (r.published_at ? new Date(r.published_at).toLocaleDateString() : '') + '</span></a>';
          }).join('');
        }
      })
      .catch(function () {
        // Graceful fallback — everything points at /releases/latest
        ['latest-tag'].forEach(function (id) { setText(id, 'GitHub'); });
        ['dl-win-x64', 'dl-android', 'dl-linux-appimage', 'dl-linux-deb', 'dl-linux-rpm'].forEach(function (id) {
          var el = document.getElementById(id); if (el) { el.href = fallback; el.target = '_blank'; el.rel = 'noopener'; el.classList.remove('disabled'); }
        });
        var arm = document.getElementById('dl-win-arm'); if (arm) { arm.href = fallback; arm.target = '_blank'; }
        var menu = document.getElementById('older-list');
        if (menu) menu.innerHTML = '<a href="' + fallback + '" target="_blank" rel="noopener" class="older-item"><span>All releases on GitHub</span><span class="dim">→</span></a>';
      });
  }

  function wireLink(id, asset, fallback, label) {
    var el = document.getElementById(id);
    if (!el) return;
    if (asset) {
      el.href = asset.browser_download_url; el.classList.remove('disabled');
      var sz = el.querySelector('[data-size]');
      if (sz && asset.size) sz.textContent = (asset.size / 1048576).toFixed(1) + ' MB';
    } else if (fallback) {
      el.href = fallback; el.target = '_blank'; el.rel = 'noopener'; el.classList.remove('disabled');
    } else {
      // hide rows with no matching asset (e.g. ARM build absent)
      if (el.closest('[data-optional]')) el.closest('[data-optional]').style.display = 'none';
    }
  }

  function setText(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; }

  /* ── Recommend the Windows build matching the visitor's CPU ──────────── */
  function recommendArch() {
    var hint = document.getElementById('arch-hint');
    function mark(arch) {
      var row = document.getElementById(arch === 'arm64' ? 'dl-win-arm' : 'dl-win-x64');
      if (row) row.classList.add('dl-rec');
      if (hint) {
        hint.classList.add('on');
        hint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
          '<span>Your device looks like <b>' + (arch === 'arm64' ? 'ARM64' : 'x64 / Intel') + '</b> \u2014 we\u2019ve highlighted the matching build.</span>';
      }
    }
    try {
      if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        navigator.userAgentData.getHighEntropyValues(['architecture']).then(function (d) {
          if (!d) return;
          if (d.architecture === 'arm') mark('arm64');
          else if (d.architecture === 'x86') mark('x64');
        }).catch(function () {});
        return;
      }
    } catch (e) {}
    // Fallback: UA string sniff (covers most ARM Windows / Apple-silicon browsers)
    if (/aarch64|arm64/i.test(navigator.userAgent || '')) mark('arm64');
  }

  var ICON = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
  };

  window.SempaSite = { apply: apply, THEMES: THEMES };
})();
