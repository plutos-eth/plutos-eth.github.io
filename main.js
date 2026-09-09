/* ==========================================================================
   banana — site behaviour
   ==========================================================================

   ┌──────────────────────────────────────────────────────────────────────┐
   │  EVERYTHING YOU NEED TO EDIT AT LAUNCH IS IN THE CONFIG BLOCK BELOW. │
   │  Leave a value as null and the page renders an honest "TBA" state     │
   │  instead of a broken link or a fake address.                          │
   └──────────────────────────────────────────────────────────────────────┘
*/

const CONFIG = {
  // The one official contract address. This is the single source of truth for
  // it on the page — the header chip, the strip, the copy buttons and the
  // explorer link all read from here.
  ca: "0xb871A9C07595Ba956B216bc6210468cd009909B5",

  // Where people buy it.
  buyUrl: "https://www.ponsfamily.com/launchpad/0xb871A9C07595Ba956B216bc6210468cd009909B5",
  chartUrl: null,        // e.g. a DEX chart for the pair

  // Socials. null hides / disables the button rather than guessing a handle.
  xUrl: null,            // e.g. "https://x.com/your_handle"

  // Token facts. Strings, shown verbatim.
  supply: null,          // e.g. "1,000,000,000"
  tax: null,             // e.g. "0 / 0"

  // Block explorer, used to build a link once `ca` is set.
  explorer: null,        // e.g. "https://explorer.robinhood.com/address/"
};

/* ------------------------------------------------------------------------ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const shortCa = (a) => a.slice(0, 6) + '…' + a.slice(-4);

/* ---------------------------------------------------------- contract UI -- */
function applyConfig() {
  const live = typeof CONFIG.ca === 'string' && /^0x[0-9a-fA-F]{40}$/.test(CONFIG.ca);

  if (live) {
    $$('[data-ca-full]').forEach(el => { el.textContent = CONFIG.ca; });
    $$('[data-ca-short]').forEach(el => { el.textContent = shortCa(CONFIG.ca); });
    $$('[data-ca-label]').forEach(el => { el.textContent = 'OFFICIAL CONTRACT'; });
    $$('[data-ca-dot]').forEach(el => el.classList.remove('dot-pending'));
    $$('[data-ca-copy-hint]').forEach(el => { el.textContent = el.dataset.caCopyHint; });
    $('.ca-bar')?.classList.add('live');
  } else {
    // Nothing to copy yet — make that unmistakable rather than half-working.
    $$('[data-ca-copy-hint]').forEach(el => { el.textContent = 'soon'; });
  }

  const setLink = (sel, url) => {
    const el = $(sel);
    if (!el) return;
    if (url) {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener';
      el.removeAttribute('aria-disabled');
    }
  };
  setLink('[data-buy-link]', CONFIG.buyUrl);
  setLink('[data-chart-link]', CONFIG.chartUrl || (live && CONFIG.explorer ? CONFIG.explorer + CONFIG.ca : null));
  setLink('[data-x-link]', CONFIG.xUrl);

  if (CONFIG.supply) $('[data-supply]').textContent = CONFIG.supply;
  if (CONFIG.tax)    $('[data-tax]').textContent = CONFIG.tax;

  return live;
}

const caIsLive = applyConfig();

/* -------------------------------------------------------------- copying -- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
}

async function copyCa() {
  if (!caIsLive) { toast('Contract address not published yet'); return; }
  try {
    await navigator.clipboard.writeText(CONFIG.ca);
  } catch {
    // Clipboard API is unavailable over file:// and in some locked-down browsers.
    const ta = document.createElement('textarea');
    ta.value = CONFIG.ca;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-100px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { toast('Copy failed — select it by hand'); ta.remove(); return; }
    ta.remove();
  }
  toast('Contract address copied');
}

$$('[data-copy-ca]').forEach(el => {
  el.addEventListener('click', copyCa);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyCa(); }
  });
});

/* --------------------------------------------------------- sticky header -- */
const hdr = $('#hdr');
const onScroll = () => hdr.classList.toggle('stuck', window.scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* ------------------------------------------------------------ mobile nav -- */
const burger = $('.burger');
const mobnav = $('#mobnav');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  mobnav.hidden = open;
});
$$('#mobnav a').forEach(a => a.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  mobnav.hidden = true;
}));

/* -------------------------------------------------------------- scrollspy -- */
const navLinks = $$('.nav a');
const sections = navLinks
  .map(a => $(a.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => spy.observe(s));
}

/* ---------------------------------------------------------------- reveal -- */
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const targets = $$('.sec-head, .card, .panel, .stat, .dl-table-wrap, .dl-side, .cta, .hero-card, .faq');
  targets.forEach(el => el.classList.add('rv'));
  const rev = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  targets.forEach(el => rev.observe(el));
}

/* ------------------------------------------------------------- accordion -- */
// One answer open at a time — the list is long enough that several open at
// once turns it back into a wall of text.
const qas = $$('.qa');
qas.forEach(d => d.addEventListener('toggle', () => {
  if (!d.open) return;
  qas.forEach(o => { if (o !== d) o.open = false; });
}));
