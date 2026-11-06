/* Light / dark mode.
   - Dark mode inverts the page colours (html filter) and puts photos, project images, videos
     and embeds back to their real colours, so it works on every page without touching the
     site's compiled CSS.
   - Two controls, always in sync: a round sun/moon button in the corner and a sliding
     Light/Dark switch in the footer.
   - The choice is remembered (localStorage "hb-theme"). Default is light.
   Loaded synchronously from <head> so the saved theme is applied before the first paint. */
(function () {
  var KEY = 'hb-theme';
  var root = document.documentElement;

  var CSS = '' +
    /* ---- dark theme ---- */
    'html[data-theme="dark"]{filter:invert(1) hue-rotate(180deg) contrast(.88);background:#fff}' +
    /* put real-colour media back: photos, project art, embeds (not logos, statues, pillars, vines) */
    'html[data-theme="dark"] img:not([src$=".svg"]):not([src*="piller"]):not([src*="abhay"]):not([src*="tejas"]):not([src*="branch"]):not(.ww-item img),' +
    'html[data-theme="dark"] video,html[data-theme="dark"] iframe{filter:invert(1) hue-rotate(180deg)!important}' +
    'html[data-theme="dark"] .ww-item img{opacity:.92}' +
    'html.theme-anim,html.theme-anim body{transition:filter .45s ease,background-color .45s ease}' +
    'html.theme-anim img,html.theme-anim iframe{transition:filter .45s ease}' +
    /* ---- controls ---- */
    '.tm-btn{position:fixed;right:20px;bottom:20px;z-index:10010;width:44px;height:44px;border-radius:50%;border:1px solid #e5e7eb;background:#fff;color:#111827;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.12);transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .25s,border-color .25s;padding:0}' +
    '.tm-btn:hover{transform:translateY(-2px) rotate(12deg);box-shadow:0 10px 26px rgba(0,0,0,.16);border-color:#9ca3af}' +
    '.tm-btn:focus-visible,.tm-switch:focus-visible{outline:2px solid #3b82f6;outline-offset:3px}' +
    '.tm-btn svg{width:20px;height:20px;display:block}' +
    '.tm-btn .sun{display:none}html[data-theme="dark"] .tm-btn .sun{display:block}html[data-theme="dark"] .tm-btn .moon{display:none}' +
    '.tm-row{display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 16px 30px;font-family:FunnelDisplay,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af}' +
    '.tm-row .lab{transition:color .3s}.tm-row .lab.on{color:#111827}' +
    '.tm-switch{all:unset;box-sizing:border-box;cursor:pointer;display:inline-block}' +
    '.tm-track{position:relative;display:block;width:56px;height:30px;border-radius:999px;background:#e5e7eb;border:1px solid #d1d5db;transition:background .35s,border-color .35s}' +
    '.tm-track svg{position:absolute;top:7px;width:14px;height:14px;color:#6b7280}' +
    '.tm-track .s{left:8px}.tm-track .m{right:8px}' +
    '.tm-knob{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.28);transition:transform .35s cubic-bezier(.2,.7,.2,1)}' +
    '.tm-switch[aria-checked="true"] .tm-track{background:#111827;border-color:#111827}' +
    '.tm-switch[aria-checked="true"] .tm-track svg{color:#9ca3af}' +
    '.tm-switch[aria-checked="true"] .tm-knob{transform:translateX(26px)}' +
    '.tm-switch:hover .tm-knob{box-shadow:0 2px 8px rgba(0,0,0,.34)}' +
    '@media (max-width:767px){.tm-btn{right:14px;bottom:14px;width:40px;height:40px}}' +
    '@media (prefers-reduced-motion:reduce){.tm-btn,.tm-knob,.tm-track{transition:none}html.theme-anim,html.theme-anim body,html.theme-anim img,html.theme-anim iframe{transition:none}}';

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8Z"/></svg>';

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  function sync() {
    var dark = current() === 'dark';
    var b = document.querySelectorAll('.tm-btn,.tm-switch');
    for (var i = 0; i < b.length; i++) {
      if (b[i].classList.contains('tm-switch')) b[i].setAttribute('aria-checked', dark ? 'true' : 'false');
      else b[i].setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    var l = document.querySelectorAll('.tm-row .lab');
    for (var j = 0; j < l.length; j++) l[j].classList.toggle('on', (l[j].getAttribute('data-for') === 'dark') === dark);
  }

  function apply(t, animate) {
    if (animate) {
      root.classList.add('theme-anim');
      clearTimeout(apply.timer);
      apply.timer = setTimeout(function () { root.classList.remove('theme-anim'); }, 700);
    }
    if (t === 'dark') root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    sync();
  }

  function toggle() { var t = current() === 'dark' ? 'light' : 'dark'; save(t); apply(t, true); }

  // 1) apply the saved theme immediately (before paint) and inject the styles
  var st = document.createElement('style');
  st.id = 'tm-style';
  st.textContent = CSS;
  (document.head || root).appendChild(st);
  if (stored() === 'dark') root.setAttribute('data-theme', 'dark');

  // 2) controls (added after the page has hydrated, and put back if the page re-renders)
  function button() {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tm-btn'; b.innerHTML = '<span class="moon">' + MOON + '</span><span class="sun">' + SUN + '</span>';
    b.addEventListener('click', toggle);
    return b;
  }
  function row() {
    var d = document.createElement('div');
    d.className = 'tm-row';
    d.innerHTML = '<span class="lab" data-for="light">Light</span>' +
      '<button type="button" class="tm-switch" role="switch" aria-checked="false" aria-label="Dark mode"><span class="tm-track">' +
      '<span class="s">' + SUN + '</span><span class="m">' + MOON + '</span><span class="tm-knob"></span></span></button>' +
      '<span class="lab" data-for="dark">Dark</span>';
    d.querySelector('.tm-switch').addEventListener('click', toggle);
    return d;
  }
  function place() {
    if (!document.body) return false;
    if (!document.querySelector('.tm-btn')) document.body.appendChild(button());
    var f = document.querySelector('footer');
    if (f && !f.querySelector('.tm-row')) f.appendChild(row());
    sync();
    return !!f;
  }
  function start() {
    var n = 0;
    (function tick() {
      if (place() || ++n > 40) {
        new MutationObserver(function () { place(); }).observe(document.body, { childList: true, subtree: true });
        return;
      }
      setTimeout(tick, 250);
    })();
  }
  if (document.readyState === 'complete') setTimeout(start, 1200);
  else window.addEventListener('load', function () { setTimeout(start, 1200); });

  // keep several open tabs in step
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(e.newValue === 'dark' ? 'dark' : 'light', true); });
  // public hook, e.g. window.setTheme('dark')
  window.setTheme = function (t) { save(t === 'dark' ? 'dark' : 'light'); apply(t === 'dark' ? 'dark' : 'light', true); };
})();
