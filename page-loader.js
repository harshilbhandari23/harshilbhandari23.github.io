/* Page loading animation, in the format of thestart.com.au.
   Loading a page: a black screen with a dot. The dot slides left as the page's name scrambles in and
   thin lines close in around it. The name scrambles away, then a circle opens from the centre to show
   the page. Following a link to another page: the same circle closes first.

   It is drawn on the html element's ::before and ::after, not with extra elements, so it is on screen
   before the first paint and React can't remove it while the homepage starts up.
   Loaded from <head> right after theme.js. Visitors who reduce motion on their device don't get it.
   Timings are in TIME below. */
(function () {
  var root = document.documentElement;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  var TIME = { start: 80, hold: 800, scrambleIn: 420, scrambleOut: 200, open: 750, close: 720, maxWait: 1600, safety: 6000 };

  function lineLayer(x, y, w, h, alpha) {
    return 'linear-gradient(rgba(var(--hbl),var(' + alpha + ')),rgba(var(--hbl),var(' + alpha + '))) ' + x + ' ' + y + '/' + w + ' ' + h + ' no-repeat';
  }
  function plusLayers(x, y) {
    return [
      lineLayer('calc(' + x + ' - 4px)', y, '9px', '1px', '--hbp'),
      lineLayer(x, 'calc(' + y + ' - 4px)', '1px', '9px', '--hbp')
    ];
  }
  var LAYERS = [].concat(
    plusLayers('var(--v2)', 'var(--h1)'), plusLayers('var(--v3)', 'var(--h1)'),
    plusLayers('var(--v2)', 'var(--h2)'), plusLayers('var(--v3)', 'var(--h2)'),
    ['radial-gradient(circle,var(--hbf) 3px,transparent 3.6px) var(--hbd) center/8px 8px no-repeat'],
    [
      lineLayer('var(--v1)', '0', '1px', '100%', '--hba'), lineLayer('var(--v2)', '0', '1px', '100%', '--hba'),
      lineLayer('var(--v3)', '0', '1px', '100%', '--hba'), lineLayer('var(--v4)', '0', '1px', '100%', '--hba'),
      lineLayer('0', 'var(--h1)', '100%', '1px', '--hba'), lineLayer('0', 'var(--h2)', '100%', '1px', '--hba')
    ]
  ).join(',');

  var EASE_LINES = 'cubic-bezier(.95,-.01,.24,1.1)'; /* measured from the reference */
  var EASE_IRIS = 'cubic-bezier(.76,0,.24,1)';
  function reg(name, syntax, initial) { return '@property ' + name + '{syntax:"' + syntax + '";inherits:false;initial-value:' + initial + '}'; }

  var CSS = '' +
    reg('--hbr', '<length>', '0px') + reg('--v1', '<length>', '0px') + reg('--v2', '<length>', '0px') + reg('--v3', '<length>', '0px') + reg('--v4', '<length>', '0px') +
    reg('--h1', '<length>', '0px') + reg('--h2', '<length>', '0px') + reg('--hbd', '<length>', '0px') + reg('--hba', '<number>', '0') + reg('--hbp', '<number>', '0') +
    /* colours. Dark mode inverts the whole page, so these are the inverse of what shows */
    'html{--hbb:#000;--hbf:#f6f6f6;--hbl:255,255,255}' +
    'html[data-theme="dark"]{--hbb:#e8e8ec;--hbf:#111827;--hbl:0,0,0}' +
    /* the black screen, with a circular hole of radius --hbr */
    'html[data-hb]::before{content:"";position:fixed;inset:0;z-index:100000;pointer-events:none;background:var(--hbb);--hbr:0px;' +
      '-webkit-mask:radial-gradient(circle at 50% 50%,transparent var(--hbr),#000 calc(var(--hbr) + 1px));mask:radial-gradient(circle at 50% 50%,transparent var(--hbr),#000 calc(var(--hbr) + 1px));' +
      'transition:--hbr ' + TIME.close + 'ms ' + EASE_IRIS + '}' +
    'html[data-hb="start"]::before{--hbr:72vmax;transition:none}' +
    'html[data-hb="open"]::before{--hbr:72vmax;transition:--hbr ' + TIME.open + 'ms ' + EASE_IRIS + '}' +
    /* the dot, the lines and the name */
    'html[data-hb]::after{content:attr(data-hb-label);position:fixed;inset:0;z-index:100001;pointer-events:none;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding-left:22px;' +
      'color:var(--hbf);font:400 13px/1 FunnelDisplay,sans-serif;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;background:' + LAYERS + ';' +
      '--v1:12.5vw;--v2:25vw;--v3:75vw;--v4:87.5vw;--h1:12.5vh;--h2:87.5vh;--hba:0;--hbp:0;--hbd:calc(50vw - 4px);' +
      'transition:--v1 .7s ' + EASE_LINES + ' .1s,--v2 .7s ' + EASE_LINES + ',--v3 .7s ' + EASE_LINES + ',--v4 .7s ' + EASE_LINES + ' .1s,--h1 .7s ' + EASE_LINES + ',--h2 .7s ' + EASE_LINES + ',--hba .4s ease,--hbp .4s ease,--hbd .55s cubic-bezier(.2,.7,.2,1)}' +
    'html[data-hb="label"]::after{--v1:calc(50vw - var(--hbw)/2 - 66px);--v2:calc(50vw - var(--hbw)/2);--v3:calc(50vw + var(--hbw)/2);--v4:calc(50vw + var(--hbw)/2 + 66px);--h1:calc(50vh - 29px);--h2:calc(50vh + 29px);--hba:.16;--hbp:.55;--hbd:calc(50vw - var(--hbw)/2 + 24px)}' +
    'html[data-hb="start"]::after{opacity:0;transition:none}' +
    'html[data-hb="open"]::after{opacity:0;transition:opacity .2s ease}' +
    /* page content waits for the circle to open */
    'html[data-hb-wait] .cs-reveal.in{opacity:0;transform:translateY(28px)}' +
    'html[data-hb-wait] .cs-fade{animation-play-state:paused}' +
    /* the white loader this replaces */
    '.fixed.inset-0.bg-white{display:none!important}';

  var st = document.createElement('style');
  st.id = 'hb-loader-style';
  st.textContent = CSS;
  (document.head || root).appendChild(st);

  function state(s) { root.setAttribute('data-hb', s); }
  function label(t) { root.setAttribute('data-hb-label', t); }
  function clear() {
    root.removeAttribute('data-hb');
    root.removeAttribute('data-hb-label');
    root.removeAttribute('data-hb-wait');
    root.style.removeProperty('--hbw');
  }

  /* the page's name, from its title */
  function pageName() {
    var t = (document.title || '').split(' - ');
    var name = t[0].trim() || 'Harshil Bhandari';
    return name.length > 30 ? name.slice(0, 29).trim() + '…' : name;
  }

  function measure(text) {
    var pad = 26, dot = 22, width = text.length * 10;
    try {
      var c = document.createElement('canvas').getContext('2d');
      c.font = '400 13px FunnelDisplay,sans-serif';
      width = c.measureText(text.toUpperCase()).width + text.length * 13 * 0.12;
    } catch (e) {}
    return Math.ceil(width + dot + pad * 2);
  }

  var CHARS = 'ABCDEFGHKLMNOPRSTUXZ';
  function scramble(text, ms, away, done) {
    var start = Date.now();
    (function step() {
      var p = Math.min(1, (Date.now() - start) / ms);
      var keep = Math.floor(text.length * (away ? 1 - p : p)), out = text.slice(0, keep);
      var tail = away ? Math.ceil(2 * (1 - p)) : (p < 1 ? 3 : 0);
      for (var i = 0; i < tail && keep + i < text.length; i++) out += text.charAt(keep + i) === ' ' ? ' ' : CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      label(out);
      if (p < 1) setTimeout(step, 32); else if (done) done();
    })();
  }

  /* ---------- on load ---------- */
  var startedAt = Date.now(), finished = false, safety;
  state('cover');
  root.setAttribute('data-hb-wait', '');
  label('');

  function whenReady(cb) {
    var called = false, go = function () { if (!called) { called = true; cb(); } };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
    setTimeout(go, Math.max(0, TIME.maxWait - (Date.now() - startedAt)));
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(safety);
    root.removeAttribute('data-hb-wait');
    state('open');
    setTimeout(clear, TIME.open + 40);
  }

  safety = setTimeout(finish, TIME.safety);

  setTimeout(function () {
    var name = pageName();
    root.style.setProperty('--hbw', measure(name) + 'px');
    state('label');
    scramble(name, TIME.scrambleIn);
    setTimeout(function () {
      whenReady(function () {
        scramble(name, TIME.scrambleOut, true, function () {
          label('');
          state('cover');
          setTimeout(finish, 120);
        });
      });
    }, TIME.hold);
  }, TIME.start);

  /* ---------- on leaving: the circle closes, then the next page takes over ---------- */
  var leaving = false;
  function leave(href) {
    leaving = true;
    clearTimeout(safety);
    finished = true;
    root.removeAttribute('data-hb-wait');
    label('');
    state('start');
    root.getBoundingClientRect();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { state('cover'); });
    });
    setTimeout(function () { location.href = href; }, TIME.close + 30);
  }

  document.addEventListener('click', function (e) {
    if (leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    /* a jump within this page just scrolls */
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    e.preventDefault();
    leave(url.href);
  });

  /* coming back with the browser's Back button can restore this page as it was left, mid-animation */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { leaving = false; clear(); }
  });
})();
