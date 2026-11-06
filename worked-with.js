/* "Worked With" logo carousel.
   Adds itself above the footer (homepage) or above the contact block (About).
   Edit the CLIENTS list to add, remove or reorder places. `logo` is optional: without it
   the name is shown as a text mark. */
(function () {
  var CLIENTS = [
    { name: 'Dhirubhai Ambani University', short: 'DAU', logo: '/images/mine/logos/dau-wide.png', wide: true },
    { name: 'UNICEF', short: 'UNICEF', logo: '/images/mine/logos/unicef.png', wide: true },
    { name: 'Smart Energy Learning Centre', short: 'SELC', logo: '/images/mine/logos/selc.png', xwide: true },
    { name: 'IIT Gandhinagar', short: 'IITGN', logo: '/images/mine/logos/iitgn.jpg' },
    { name: 'Imperial English UK', short: 'Imperial English', logo: '/images/mine/logos/imperial.jpg' },
    { name: 'Indus University', short: 'Indus University', logo: '/images/mine/logos/indus.jpg' },
    { name: 'NIFT Jodhpur', short: 'NIFT', logo: '/images/mine/logos/nift.jpg' },
    { name: 'Zion Shipping Tech', short: 'Zion Shipping', logo: '/images/mine/logos/zion.png', wide: true },
    { name: 'BSES Rajdhani Power Limited', short: 'BSES', logo: '/images/mine/logos/bses.png', xwide: true },
    { name: 'Vikartr Technologies', short: 'Vikartr', logo: '/images/mine/logos/vikartr.jpg' },
    { name: 'Gujarat Technological University', short: 'GTU', logo: '/images/mine/logos/gtu.jpg' },
    { name: 'OOI studio', short: 'OOI studio' }
  ];

  var CSS = '' +
    '.ww{position:relative;max-width:64rem;margin:96px auto 0;padding:0 16px}' +
    '.ww-head{padding:0 24px 28px;overflow:hidden}' +
    '.ww-head .line{position:relative}' +
    '.ww-head .line:before{content:"";position:absolute;left:0;right:0;top:50%;border-top:1px solid #d1d5db}' +
    '.ww-head h2{position:relative;display:flex;align-items:baseline;justify-content:center;gap:8px;margin:0;font-weight:300;font-size:clamp(24px,3vw,30px);color:#000}' +
    '.ww-head h2>span{position:relative;background:#fff;white-space:nowrap}' +
    '.ww-head h2>span:first-child{padding-right:12px}.ww-head h2>span:last-child{padding-left:12px}' +
    '.ww-cap{margin:-8px 0 26px;text-align:center;font-family:FunnelDisplay,sans-serif;font-size:12px;color:#9ca3af}' +
    '.ww-box{position:relative;border:1px solid #e5e7eb;overflow:hidden;background:#fff}' +
    '.ww-plus{position:absolute;z-index:5;font-family:monospace;font-size:13px;line-height:1;color:#9ca3af;pointer-events:none;user-select:none}' +
    '.ww-mask{overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scrollbar-width:none;-ms-overflow-style:none;cursor:grab;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}' +
    '.ww-mask::-webkit-scrollbar{display:none}' +
    '.ww-mask.is-drag{cursor:grabbing;user-select:none;-webkit-user-select:none}' +
    '.ww-mask:focus-visible{outline:2px solid #3b82f6;outline-offset:-2px}' +
    '.ww-track{display:flex;width:max-content}' +
    '.ww-item{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:240px;height:156px;border-right:1px solid #f0f1f3;text-decoration:none;color:inherit}' +
    '.ww-item img{display:block;height:72px;width:auto;object-fit:contain;mix-blend-mode:multiply;-webkit-user-drag:none;user-select:none;-webkit-user-select:none;transition:transform .45s cubic-bezier(.2,.7,.2,1)}' +
    '.ww-item .mark{height:84px;display:flex;align-items:center;justify-content:center;max-width:190px;text-align:center;font-family:HBSerif,serif;font-size:28px;line-height:1.1;color:#374151;transition:color .45s,transform .45s cubic-bezier(.2,.7,.2,1)}' +
    '.ww-item small{font-family:FunnelDisplay,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;transition:color .45s;text-align:center;padding:0 10px}' +
    '.ww-item:hover img{transform:scale(1.08)}' +
    '.ww-item:hover .mark{color:#111827;transform:scale(1.06)}' +
    '.ww-item:hover small{color:#111827}' +
    /* dark mode inverts the whole page, so each logo is turned back and sits on a small white tile to keep its true colours */
    '[data-theme="dark"] .ww-item img{mix-blend-mode:normal;background:#fff;box-shadow:0 0 0 6px #fff;border-radius:3px;filter:invert(1) hue-rotate(180deg);opacity:1}' +
    '@media (max-width:767px){.ww{margin-top:72px}.ww-item{width:176px;height:122px}.ww-item .mark{height:64px;max-width:150px;font-size:21px}}';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Logo size. Each logo is given roughly the same area, so a wide wordmark and a round seal look equally big:
     a square logo ends up MAXH tall, a wide one is cut off at MAXW across. Small source files are not blown
     up more than UPSCALE times, so they stay readable. Change AREA to make every logo bigger or smaller. */
  var AREA = 13000, MAXW = 200, MAXH = 96, UPSCALE = 1.7;
  function fit(img) {
    var nw = img.naturalWidth, nh = img.naturalHeight;
    if (!nw || !nh) return;
    var k = window.innerWidth < 768 ? 0.76 : 1, r = nw / nh;
    var h = Math.sqrt(AREA / r), w = h * r;
    if (h > MAXH) { h = MAXH; w = h * r; }
    if (w > MAXW) { w = MAXW; h = w / r; }
    if (h > nh * UPSCALE) { h = nh * UPSCALE; w = nw * UPSCALE; }
    img.style.width = Math.round(w * k) + 'px';
    img.style.height = Math.round(h * k) + 'px';
  }
  function fitAll(root) {
    [].forEach.call(root.querySelectorAll('.ww-item img'), function (img) {
      if (img.complete) fit(img); else img.addEventListener('load', function () { fit(img); }, { once: true });
    });
  }
  var resizing;
  window.addEventListener('resize', function () {
    clearTimeout(resizing);
    resizing = setTimeout(function () { var el = document.getElementById('worked-with'); if (el) fitAll(el); }, 150);
  });

  function cell(c) {
    var top = c.logo
      ? '<img' + (c.xwide ? ' class="xwide"' : c.wide ? ' class="wide"' : '') + ' src="' + esc(c.logo) + '" alt="' + esc(c.name) + ' logo" loading="eager" decoding="async" draggable="false">'
      : '<span class="mark">' + esc(c.name) + '</span>';
    return '<div class="ww-item" title="' + esc(c.name) + '">' + top + '<small>' + esc(c.short || c.name) + '</small></div>';
  }

  /* the heading: each word starts with a larger capital */
  var HEADING = ['In', 'Association', 'With'];
  function word(w) {
    return '<span><span style="font-family:HBSerif, sans-serif;font-size:1.5em">' + esc(w.charAt(0)) + '</span><span style="font-family:HBSerif, sans-serif">' + esc(w.slice(1)) + '</span></span>';
  }

  function build() {
    var sec = document.createElement('section');
    sec.id = 'worked-with';
    sec.className = 'ww';
    sec.setAttribute('aria-label', 'In association with');
    var cells = CLIENTS.map(cell).join('');
    sec.innerHTML =
      '<div class="ww-head"><div class="line"><h2>' +
      '<span>' + HEADING.map(word).join(' ') + '</span>' +
      '</h2></div></div>' +
      '<p class="ww-cap">Organizations I worked with</p>' +
      '<div class="ww-box">' +
      '<span class="ww-plus" style="left:0;top:0;transform:translate(-50%,-50%)">+</span><span class="ww-plus" style="right:0;top:0;transform:translate(50%,-50%)">+</span>' +
      '<span class="ww-plus" style="left:0;bottom:0;transform:translate(-50%,50%)">+</span><span class="ww-plus" style="right:0;bottom:0;transform:translate(50%,50%)">+</span>' +
      '<div class="ww-mask" tabindex="0" role="region" aria-label="Organizations, scroll sideways"><div class="ww-track">' + cells + cells + cells + '</div></div></div>';
    fitAll(sec);
    return sec;
  }

  /* The strip is a scrollable box, so phones and tablets get their own swiping and momentum, and the mouse can drag it.
     It holds three copies of the list and starts in the middle one; whenever it leaves the middle copy it jumps by
     one copy's width, which looks identical, so it never runs out. It drifts by itself until someone touches it, hovers
     it or drags it, then carries on after a pause. SPEED is pixels a second; set it to 0 to stop the drifting. */
  var SPEED = 36;
  function setupScroll(sec) {
    var mask = sec.querySelector('.ww-mask'), track = sec.querySelector('.ww-track'), box = sec.querySelector('.ww-box');
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
    var W = 0, pos = 0, lastSet = -99, last = 0, busyUntil = 0, hover = false, inView = true, dragging = false, startX = 0, startScroll = 0;
    function copy() { W = track.scrollWidth / 3; return W; }
    function wrap() {
      if (!copy()) return;
      var v = mask.scrollLeft;
      if (v >= 2 * W) { v -= W; startScroll -= W; } else if (v < W) { v += W; startScroll += W; } else return;
      mask.scrollLeft = v; pos = v; lastSet = v;
    }
    mask.addEventListener('scroll', function () {
      if (Math.abs(mask.scrollLeft - lastSet) > 2) { busyUntil = performance.now() + 1800; pos = mask.scrollLeft; }
      wrap();
    }, { passive: true });
    /* mouse: drag. Touch and pen already scroll the box natively */
    mask.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; startX = e.clientX; startScroll = mask.scrollLeft;
      mask.classList.add('is-drag');
      try { mask.setPointerCapture(e.pointerId); } catch (err) {}
    });
    mask.addEventListener('pointermove', function (e) { if (dragging) mask.scrollLeft = startScroll - (e.clientX - startX); });
    function release() { if (!dragging) return; dragging = false; mask.classList.remove('is-drag'); busyUntil = performance.now() + 1500; }
    mask.addEventListener('pointerup', release);
    mask.addEventListener('pointercancel', release);
    mask.addEventListener('lostpointercapture', release);
    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    box.addEventListener('pointerleave', function () { hover = false; });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }).observe(sec);
    function frame(t) {
      requestAnimationFrame(frame);
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (calm || !SPEED || dragging || hover || !inView || document.hidden || t < busyUntil) { pos = mask.scrollLeft; return; }
      if (!copy()) return;
      pos += SPEED * dt;
      lastSet = pos;
      mask.scrollLeft = pos;
    }
    /* start in the middle copy once the strip has a width */
    requestAnimationFrame(function () { if (copy()) { mask.scrollLeft = W; pos = W; lastSet = W; } requestAnimationFrame(frame); });
  }

  function place() {
    if (document.getElementById('worked-with')) return true;
    var target = document.getElementById('contact') || document.querySelector('footer');
    if (!target || !target.parentNode) return false;
    if (!document.getElementById('ww-style')) {
      var st = document.createElement('style'); st.id = 'ww-style'; st.textContent = CSS; document.head.appendChild(st);
    }
    var sec = build();
    target.parentNode.insertBefore(sec, target);
    setupScroll(sec);
    return true;
  }

  // Wait for the page to finish hydrating, then add the section and keep it there.
  function start() {
    var tries = 0;
    (function tick() {
      if (place() || ++tries > 40) {
        new MutationObserver(function () { place(); }).observe(document.body, { childList: true });
        return;
      }
      setTimeout(tick, 250);
    })();
  }
  if (document.readyState === 'complete') setTimeout(start, 1200);
  else window.addEventListener('load', function () { setTimeout(start, 1200); });
})();
