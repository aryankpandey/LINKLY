/* =========================================================
   LINKLY — script.js
   Premium SaaS URL Shortener
   ========================================================= */

'use strict';

/* ─── State ─────────────────────────────────────────────── */
const STATE = {
  currentUrl:    '',
  currentShort:  '',
  currentAlias:  '',
  currentExpiry: 'never',
  links:         [],       // loaded from localStorage
};

const STORAGE_KEY = 'linkly_links_v2';
const BASE_DOMAIN = 'linkly.dev';

/* ─── DOM Refs ───────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const DOM = {
  urlInput:      $('urlInput'),
  urlError:      $('urlError'),
  urlCounter:    $('urlCounter'),
  aliasInput:    $('aliasInput'),
  expirySelect:  $('expirySelect'),
  shortenBtn:    $('shortenBtn'),
  outputCard:    $('outputCard'),
  outputUrl:     $('outputUrl'),
  copyBtn:       $('copyBtn'),
  openBtn:       $('openBtn'),
  qrBtn:         $('qrBtn'),
  shareBtn:      $('shareBtn'),
  statClicks:    $('statClicks'),
  statCreated:   $('statCreated'),
  statExpires:   $('statExpires'),
  statStatus:    $('statStatus'),
  recentList:    $('recentList'),
  recentEmpty:   $('recentEmpty'),
  clearHistoryBtn: $('clearHistoryBtn'),
  qrModal:       $('qrModal'),
  qrClose:       $('qrClose'),
  qrImage:       $('qrImage'),
  qrSkeleton:    $('qrSkeleton'),
  qrUrl:         $('qrUrl'),
  qrDownload:    $('qrDownload'),
  clearModal:    $('clearModal'),
  clearModalClose: $('clearModalClose'),
  clearCancelBtn: $('clearCancelBtn'),
  clearConfirmBtn: $('clearConfirmBtn'),
  themeToggle:   $('themeToggle'),
  toastContainer: $('toastContainer'),
  backToTop:     $('backToTop'),
  mouseGlow:     $('mouseGlow'),
  cursorGlow:    $('cursorGlow'),
  kbdHint:       $('kbdHint'),
};

/* ─── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
  renderRecent();
  initTheme();
  initMouseEffects();
  initRipples();
  initFAQ();
  initScrollEvents();
  initKeyboard();
  initCharCounter();
  initFAQAnimation();
  hideKbdHint();

  // Scroll reveal (IntersectionObserver for elements not animated by CSS)
  observeAnimations();
});

/* ─── LocalStorage ───────────────────────────────────────── */
function loadLinks() {
  try {
    STATE.links = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    STATE.links = [];
  }
}

function saveLinks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.links));
  } catch (e) {
    console.warn('localStorage unavailable:', e);
  }
}

/* ─── Theme ──────────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('linkly_theme') || 'dark';
  setTheme(saved);

  DOM.themeToggle.addEventListener('click', () => {
    const current = document.body.dataset.theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

function setTheme(t) {
  document.body.dataset.theme = t;
  localStorage.setItem('linkly_theme', t);
  const darkIcon  = DOM.themeToggle.querySelector('.theme-dark');
  const lightIcon = DOM.themeToggle.querySelector('.theme-light');
  if (t === 'dark') {
    darkIcon.style.display  = '';
    lightIcon.style.display = 'none';
  } else {
    darkIcon.style.display  = 'none';
    lightIcon.style.display = '';
  }
}

/* ─── Mouse Glow & Cursor ────────────────────────────────── */
function initMouseEffects() {
  let cx = 0, cy = 0;
  const glow   = DOM.mouseGlow;
  const cursor = DOM.cursorGlow;

  // Only show custom cursor on non-touch devices
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (!isTouch) cursor.style.opacity = '1';

  document.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    if (!isTouch) {
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (!isTouch) cursor.style.opacity = '1';
  });
}

/* ─── Ripple Effect ──────────────────────────────────────── */
function initRipples() {
  document.querySelectorAll('.ripple').forEach(attachRipple);
}

function attachRipple(el) {
  el.addEventListener('click', function (e) {
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;
    const wave   = document.createElement('span');
    wave.classList.add('ripple-wave');
    wave.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    this.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });
}

/* ─── Char Counter ───────────────────────────────────────── */
function initCharCounter() {
  DOM.urlInput.addEventListener('input', () => {
    const len = DOM.urlInput.value.length;
    DOM.urlCounter.textContent = len > 0 ? `${len} chars` : '';
    if (DOM.urlError.classList.contains('visible')) validateUrl();
  });
}

/* ─── URL Validation ─────────────────────────────────────── */
function validateUrl() {
  const val = DOM.urlInput.value.trim();
  if (!val) {
    showError('Please enter a URL.');
    return false;
  }
  try {
    const parsed = new URL(val);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      showError('URL must start with http:// or https://');
      return false;
    }
  } catch {
    showError('That doesn\'t look like a valid URL. Try including https://');
    return false;
  }
  hideError();
  return true;
}

function showError(msg) {
  DOM.urlError.textContent = '⚠ ' + msg;
  DOM.urlError.classList.add('visible');
  DOM.urlInput.setAttribute('aria-invalid', 'true');
}

function hideError() {
  DOM.urlError.classList.remove('visible');
  DOM.urlInput.removeAttribute('aria-invalid');
}

/* ─── Code Generator ─────────────────────────────────────── */
function generateCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  arr.forEach(b => { code += chars[b % chars.length]; });
  return code;
}

function getExpiryDate(val) {
  if (val === 'never') return null;
  const now = new Date();
  if (val === '24h')  now.setHours(now.getHours() + 24);
  if (val === '7d')   now.setDate(now.getDate() + 7);
  if (val === '30d')  now.setDate(now.getDate() + 30);
  return now;
}

function formatDate(d) {
  if (!d) return 'Never';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
}

/* ─── Shorten Button ─────────────────────────────────────── */
DOM.shortenBtn.addEventListener('click', shortenUrl);

async function shortenUrl() {
  if (!validateUrl()) {
    DOM.urlInput.focus();
    return;
  }

  const longUrl = DOM.urlInput.value.trim();
  const alias   = DOM.aliasInput.value.trim().replace(/[^a-zA-Z0-9\-_]/g, '') || null;
  const expiry  = DOM.expirySelect.value;

  // Check alias uniqueness
  if (alias && STATE.links.some(l => l.code === alias)) {
    toast('That alias is already taken. Choose another.', 'error');
    DOM.aliasInput.focus();
    return;
  }

  // Loading state
  setLoading(true);
  await delay(900 + Math.random() * 600); // simulate network

  const code     = alias || generateCode();
  const shortUrl = `https://${BASE_DOMAIN}/${code}`;
  const expiryDate = getExpiryDate(expiry);
  const now      = new Date().toISOString();

  const link = {
    id:      Date.now(),
    code,
    longUrl,
    shortUrl,
    expiry:  expiryDate ? expiryDate.toISOString() : null,
    created: now,
    clicks:  0,
    status:  'active',
  };

  STATE.links.unshift(link);
  if (STATE.links.length > 50) STATE.links = STATE.links.slice(0, 50);
  saveLinks();

  STATE.currentShort = shortUrl;
  STATE.currentUrl   = longUrl;

  // Show output
  showOutput(link);
  setLoading(false);
  renderRecent();
  toast('Link created!', 'success');

  // Scroll to output
  DOM.outputCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setLoading(on) {
  DOM.shortenBtn.classList.toggle('loading', on);
  DOM.shortenBtn.disabled = on;
  DOM.urlInput.disabled   = on;
}

function showOutput(link) {
  DOM.outputUrl.textContent = link.shortUrl;
  DOM.outputUrl.href        = link.longUrl;
  DOM.outputUrl.setAttribute('aria-label', `Short link: ${link.shortUrl}`);

  DOM.statClicks.textContent  = link.clicks;
  DOM.statCreated.textContent  = formatDate(link.created);
  DOM.statExpires.textContent  = formatDate(link.expiry);
  DOM.statStatus.textContent   = link.status.charAt(0).toUpperCase() + link.status.slice(1);
  DOM.statStatus.className     = 'stat-card-value status-active';

  DOM.outputCard.hidden = false;
  DOM.outputCard.style.animation = 'fadeUp 0.4s ease forwards';
}

/* ─── Copy ───────────────────────────────────────────────── */
DOM.copyBtn.addEventListener('click', async () => {
  if (!STATE.currentShort) return;
  try {
    await navigator.clipboard.writeText(STATE.currentShort);
    toast('Link copied to clipboard!', 'success', '✓');
    DOM.copyBtn.style.borderColor = 'var(--success)';
    DOM.copyBtn.style.color       = 'var(--success)';
    setTimeout(() => {
      DOM.copyBtn.style.borderColor = '';
      DOM.copyBtn.style.color       = '';
    }, 1800);
  } catch {
    toast('Copy failed — try manually.', 'error');
  }
});

/* ─── Open ───────────────────────────────────────────────── */
DOM.openBtn.addEventListener('click', () => {
  if (STATE.currentUrl) window.open(STATE.currentUrl, '_blank', 'noopener,noreferrer');
});

/* ─── QR Code ────────────────────────────────────────────── */
DOM.qrBtn.addEventListener('click', () => openQR(STATE.currentShort));
DOM.qrClose.addEventListener('click', closeQR);
DOM.qrModal.addEventListener('click', e => { if (e.target === DOM.qrModal) closeQR(); });

function openQR(url) {
  if (!url) return;
  DOM.qrModal.hidden = false;
  document.body.style.overflow = 'hidden';
  DOM.qrUrl.textContent        = url;
  DOM.qrSkeleton.style.display = '';
  DOM.qrImage.style.display    = 'none';

  const encodedUrl = encodeURIComponent(url);
  const apiUrl     = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedUrl}&size=200x200&bgcolor=101010&color=FFFFFF&margin=16`;

  DOM.qrImage.onload = () => {
    DOM.qrSkeleton.style.display = 'none';
    DOM.qrImage.style.display    = 'block';
  };
  DOM.qrImage.onerror = () => {
    DOM.qrSkeleton.style.display = 'none';
    DOM.qrUrl.textContent        = 'Failed to load QR code.';
  };
  DOM.qrImage.src = apiUrl;
  DOM.qrDownload._url = apiUrl;
}

function closeQR() {
  DOM.qrModal.hidden           = true;
  document.body.style.overflow = '';
}

DOM.qrDownload.addEventListener('click', () => {
  const src = DOM.qrImage.src;
  if (!src) return;
  const a  = document.createElement('a');
  a.href   = src;
  a.download = `linkly-qr-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('QR code downloading…', 'info');
});

/* ─── Share ──────────────────────────────────────────────── */
DOM.shareBtn.addEventListener('click', async () => {
  if (!STATE.currentShort) return;
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Linkly — Short Link',
        text:  'Check out this link I shortened with Linkly!',
        url:   STATE.currentShort,
      });
    } catch (e) {
      if (e.name !== 'AbortError') fallbackShare();
    }
  } else {
    fallbackShare();
  }
});

function fallbackShare() {
  navigator.clipboard.writeText(STATE.currentShort).then(() => {
    toast('Link copied — share it anywhere!', 'info', '📋');
  }).catch(() => {
    toast('Could not copy link.', 'error');
  });
}

/* ─── Recent Links ───────────────────────────────────────── */
function renderRecent() {
  DOM.recentList.innerHTML = '';

  if (!STATE.links.length) {
    DOM.recentEmpty.style.display = '';
    return;
  }

  DOM.recentEmpty.style.display = 'none';

  STATE.links.forEach(link => {
    const card = document.createElement('div');
    card.className  = 'recent-card';
    card.dataset.id = link.id;
    card.setAttribute('role', 'listitem');

    const isExpired = link.expiry && new Date(link.expiry) < new Date();

    card.innerHTML = `
      <div class="recent-urls">
        <a class="recent-short" href="${escHtml(link.longUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escHtml(link.shortUrl)}">
          ${escHtml(link.shortUrl)}
        </a>
        <span class="recent-orig" title="${escHtml(link.longUrl)}">${escHtml(truncate(link.longUrl, 60))}</span>
      </div>
      <div class="recent-actions">
        <button class="action-btn ripple recent-copy" data-url="${escHtml(link.shortUrl)}" title="Copy" aria-label="Copy ${escHtml(link.shortUrl)}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
        <button class="action-btn ripple recent-open" data-url="${escHtml(link.longUrl)}" title="Open" aria-label="Open original URL">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open
        </button>
        <button class="action-btn ripple recent-qr" data-url="${escHtml(link.shortUrl)}" title="QR" aria-label="Show QR code">
          QR
        </button>
        <button class="action-btn ripple recent-delete" data-id="${link.id}" title="Delete" aria-label="Delete this link" style="color:var(--error);border-color:rgba(239,68,68,.25)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    `;

    if (isExpired) card.style.opacity = '.55';

    // attach ripples
    card.querySelectorAll('.ripple').forEach(attachRipple);

    // copy
    card.querySelector('.recent-copy').addEventListener('click', async e => {
      const url = e.currentTarget.dataset.url;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast('Copied!', 'success', '✓');
    });

    // open
    card.querySelector('.recent-open').addEventListener('click', e => {
      window.open(e.currentTarget.dataset.url, '_blank', 'noopener,noreferrer');
    });

    // qr
    card.querySelector('.recent-qr').addEventListener('click', e => {
      openQR(e.currentTarget.dataset.url);
    });

    // delete
    card.querySelector('.recent-delete').addEventListener('click', () => {
      deleteLink(link.id, card);
    });

    DOM.recentList.appendChild(card);
  });
}

function deleteLink(id, cardEl) {
  cardEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  cardEl.style.opacity    = '0';
  cardEl.style.transform  = 'translateX(20px)';
  setTimeout(() => {
    STATE.links = STATE.links.filter(l => l.id !== id);
    saveLinks();
    renderRecent();
  }, 250);
}

/* ─── Clear History ──────────────────────────────────────── */
DOM.clearHistoryBtn.addEventListener('click', () => {
  if (!STATE.links.length) {
    toast('No history to clear.', 'info');
    return;
  }
  DOM.clearModal.hidden = false;
  document.body.style.overflow = 'hidden';
});

[DOM.clearModalClose, DOM.clearCancelBtn].forEach(el => {
  el.addEventListener('click', () => {
    DOM.clearModal.hidden = true;
    document.body.style.overflow = '';
  });
});

DOM.clearModal.addEventListener('click', e => {
  if (e.target === DOM.clearModal) {
    DOM.clearModal.hidden = true;
    document.body.style.overflow = '';
  }
});

DOM.clearConfirmBtn.addEventListener('click', () => {
  STATE.links = [];
  saveLinks();
  renderRecent();
  DOM.clearModal.hidden = true;
  document.body.style.overflow = '';
  toast('History cleared.', 'info');
});

/* ─── FAQ ────────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = $( answerId );

      // collapse all
      document.querySelectorAll('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const a = $( b.getAttribute('aria-controls') );
        if (a) a.classList.remove('open');
      });

      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

function initFAQAnimation() {
  // Already handled by CSS max-height transition
}

/* ─── Toast ──────────────────────────────────────────────── */
function toast(msg, type = 'info', icon = null) {
  const icons = { success: '✓', error: '✕', info: '🔗' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon || icons[type]}</span>${escHtml(msg)}`;
  DOM.toastContainer.appendChild(el);

  setTimeout(() => {
    el.classList.add('leaving');
    el.addEventListener('animationend', () => el.remove());
  }, 3000);
}

/* ─── Scroll Events ──────────────────────────────────────── */
function initScrollEvents() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    // Back to top
    DOM.backToTop.hidden = y < 300;
    // Kbd hint
    if (y > 80) DOM.kbdHint.classList.add('hidden');
    else DOM.kbdHint.classList.remove('hidden');
  }, { passive: true });

  DOM.backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function hideKbdHint() {
  setTimeout(() => DOM.kbdHint.classList.add('hidden'), 5000);
}

/* ─── Keyboard Shortcuts ─────────────────────────────────── */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;

    // Ctrl/Cmd+K — focus shortener
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      DOM.urlInput.focus();
      DOM.urlInput.select();
      document.querySelector('#shortener').scrollIntoView({ behavior: 'smooth' });
    }

    // Enter on url input → shorten
    if (e.key === 'Enter' && document.activeElement === DOM.urlInput) {
      shortenUrl();
    }

    // Escape closes modals
    if (e.key === 'Escape') {
      closeQR();
      DOM.clearModal.hidden = true;
      document.body.style.overflow = '';
    }
  });
}

/* ─── Intersection Observer (scroll reveal) ──────────────── */
function observeAnimations() {
  const els = document.querySelectorAll('.animate-fade-up');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => {
    el.style.animationPlayState = 'paused';
    obs.observe(el);
  });
}

/* ─── Helpers ────────────────────────────────────────────── */
function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
