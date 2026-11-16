/* Sandbox page: opens an app inside the screen of its device (a Mac, an iPhone or an Apple Watch) and closes it again.

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
    function paint() { dev.classList.toggle('is-hot', coarse || over || focused || dev.classList.contains('is-app')); }
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
      if (!screen.contains(btn)) screen.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
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

    sec.addEventListener('click', function (e) {
      var o = e.target.closest && e.target.closest('[data-sb-open]');
      if (o && sec.contains(o)) { open(o); return; }
      var h = e.target.closest && e.target.closest('[data-sb-home]');
      if (h && dev.contains(h)) close();
    });
    sec.addEventListener('keydown', function (e) { if (e.key === 'Escape' && frame) { e.stopPropagation(); close(); } });
  });
})();
