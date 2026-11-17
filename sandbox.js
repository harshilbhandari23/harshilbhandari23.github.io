/* Sandbox page: tapping a device takes it full screen, and apps run on it. There is one device for each system (a Mac, an
   iPhone, an Apple Watch, a Meta Quest 3).

   Full screen: a click or tap anywhere on a device lifts its panel to fill the window (the page behind stops scrolling) and
   scales the device up to fit. The Back button in the top-left corner, and the Escape key, step back: out of a running app
   to the device's home screen first, then out of full screen. Tapping an app's tile, or
   its row in the list, goes full screen first and then starts the app.

   An app is started by any element with data-sb-open (a tile on the device's screen or a row in the list beside it).
   It carries data-url (the app's address) and data-name. The app opens in an iframe that grows out of the tile it was
   started from. It closes with the device's own control (the Mac window's close dot, the iPhone's home bar, the
   Watch's crown), with the Escape key, or when another app is opened.
   Only one app runs on a device at a time. Each device is independent of the others. */
(function () {
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var devices = [].slice.call(document.querySelectorAll('.sb-device'));
  if (!devices.length) return;

  devices.forEach(function (dev) {
    var sec = dev.closest('.sb-sec') || document;
    var screen = dev.querySelector('.sb-screen'), view = dev.querySelector('.sb-view');
    var title = dev.querySelector('.sb-win-title');
    var frame = null, opener = null, gone = 0;
    if (!screen || !view) return;

    /* A device is line art until the pointer is over its panel, or it has focus, or an app is open (or the screen is a touch
       screen, which has no hover). Then it takes its own system's colours: the CSS does the painting for .is-hot. */
    var stage = dev.closest('.sb-stage') || dev, over = false, focused = false;
    var coarse = window.matchMedia && matchMedia('(hover:none)').matches;
    var full = false, busy = false, hold = null, natW = 0;
    function paint() { dev.classList.toggle('is-hot', coarse || over || focused || full || dev.classList.contains('is-app')); }
    stage.addEventListener('pointerenter', function () { over = true; paint(); });
    stage.addEventListener('pointerleave', function () { over = false; paint(); });
    stage.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches(':focus-visible')) { focused = true; paint(); } });
    stage.addEventListener('focusout', function () { focused = false; paint(); });
    paint();

    function drop(f) { if (f && f.parentNode) f.parentNode.removeChild(f); }

    function open(btn) {
      var url = btn.getAttribute('data-url'), name = btn.getAttribute('data-name') || 'App';
      if (!url) return;
      clearTimeout(gone);
      drop(frame);
      frame = document.createElement('iframe');
      frame.className = 'sb-frame';
      frame.src = url;
      frame.title = name;
      /* the app can run, use forms and open links, but cannot reach into this page from another origin */
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals');
      frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      view.appendChild(frame);
      if (title) title.textContent = name;
      /* the app grows out of the tile it was started from (the middle of the screen if it came from the list) */
      var s = screen.getBoundingClientRect(), t = btn.getBoundingClientRect(), ox = 50, oy = 50;
      if (s.width && screen.contains(btn)) { ox = (t.left + t.width / 2 - s.left) / s.width * 100; oy = (t.top + t.height / 2 - s.top) / s.height * 100; }
      view.style.transformOrigin = ox.toFixed(1) + '% ' + oy.toFixed(1) + '%';
      opener = btn;
      dev.classList.add('is-app'); paint();
      if (!full && !screen.contains(btn)) screen.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      var control = dev.querySelector('[data-sb-home]');
      if (control && !reduced) setTimeout(function () { try { control.focus({ preventScroll: true }); } catch (e) {} }, 420);
    }

    function close() {
      if (!frame) return;
      var f = frame; frame = null;
      dev.classList.remove('is-app'); paint();
      /* let the app shrink back before it is taken out */
      gone = setTimeout(function () { drop(f); }, reduced ? 0 : 480);
      if (opener) { try { opener.focus({ preventScroll: true }); } catch (e) {} }
    }

    /* ---- full screen ---- */
    var fsBtn = stage.querySelector('[data-sb-fs]'), backBtn = stage.querySelector('[data-sb-back]');
    var ease = reduced ? 0 : 540;
    /* the largest the whole device can be and still fit in the window under the site's menu bar */
    function fit() {
      var narrow = window.innerWidth <= 600, w = window.innerWidth - (narrow ? 28 : 112), h = window.innerHeight - (narrow ? 108 : 64) - 20 - (narrow ? 20 : 36);
      var natH = natW * (dev.__ratio || 1), k = Math.min(w / natW, h / natH);
      dev.style.setProperty('--sb-w', Math.max(120, Math.floor(natW * k)) + 'px');
    }
    function expand(after) {
      if (full || busy) return;
      busy = true; full = true;
      var r = stage.getBoundingClientRect(), d = dev.getBoundingClientRect();
      natW = d.width; dev.__ratio = d.height / d.width;
      /* the panel's place in the page is held open while it is lifted out */
      hold = document.createElement('div');
      hold.className = 'sb-hold';
      hold.style.cssText = 'width:' + r.width + 'px;height:' + r.height + 'px';
      stage.parentNode.insertBefore(hold, stage.nextSibling);
      stage.style.cssText = 'top:' + r.top + 'px;left:' + r.left + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
      dev.style.setProperty('--sb-w', natW + 'px');
      stage.classList.add('is-full');
      document.documentElement.classList.add('sb-lock');
      void stage.offsetWidth;
      fit();
      stage.style.top = '0px'; stage.style.left = '0px'; stage.style.width = '100%'; stage.style.height = '100%';
      if (backBtn) { try { backBtn.focus({ preventScroll: true }); } catch (e) {} }
      paint();
      setTimeout(function () { busy = false; if (after) after(); }, ease);
    }
    function collapse() {
      if (!full || busy) return;
      busy = true;
      if (frame) close();
      var r = hold.getBoundingClientRect();
      stage.classList.add('is-returning');
      stage.style.top = r.top + 'px'; stage.style.left = r.left + 'px'; stage.style.width = r.width + 'px'; stage.style.height = r.height + 'px';
      dev.style.setProperty('--sb-w', natW + 'px');
      setTimeout(function () {
        stage.classList.remove('is-full', 'is-returning');
        stage.style.cssText = '';
        dev.style.removeProperty('--sb-w');
        if (hold && hold.parentNode) hold.parentNode.removeChild(hold);
        hold = null; full = false; busy = false;
        document.documentElement.classList.remove('sb-lock');
        if (fsBtn) { try { fsBtn.focus({ preventScroll: true }); } catch (e) {} }
        paint();
      }, ease + 30);
    }
    window.addEventListener('resize', function () { if (full) fit(); });

    sec.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest && t.closest('[data-sb-fs]')) { if (stage.contains(t)) expand(); return; }
      if (t.closest && t.closest('[data-sb-back]')) { if (stage.contains(t)) { if (frame) close(); else collapse(); } return; }
      var o = t.closest && t.closest('[data-sb-open]');
      if (o && sec.contains(o)) {
        if (full) open(o); else if (!busy) expand(function () { open(o); });
        return;
      }
      if (!(t.closest && dev.contains(t))) return;
      var h = t.closest('[data-sb-home]');
      if (full) { if (h) close(); return; }
      expand();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (frame) { e.stopPropagation(); close(); }
      else if (full) collapse();
    });
  });
})();
