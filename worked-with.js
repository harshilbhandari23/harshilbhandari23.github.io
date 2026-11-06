/* "Worked With" logo carousel.
   Adds itself above the footer (homepage) or above the contact block (About).
   Edit the CLIENTS list to add, remove or reorder places. `logo` is optional: without it
   the name is shown as a text mark. */
(function () {
  var CLIENTS = [
    { name: 'Dhirubhai Ambani University', short: 'DAU', logo: '/images/mine/logos/dau-wide.png', wide: true },
    { name: 'UNICEF', short: 'UNICEF', logo: '/images/mine/logos/unicef.png', wide: true },
    { name: 'Smart Energy Learning Centre', short: 'SELC' },
    { name: 'IIT Gandhinagar', short: 'IITGN', logo: '/images/mine/logos/iitgn.jpg' },
    { name: 'Imperial English UK', short: 'Imperial English', logo: '/images/mine/logos/imperial.jpg' },
    { name: 'Indus University', short: 'Indus University', logo: '/images/mine/logos/indus.jpg' },
    { name: 'NIFT Jodhpur', short: 'NIFT', logo: '/images/mine/logos/nift.jpg' },
    { name: 'Zion Shipping', short: 'Zion Shipping' },
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
    '.ww-mask{-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}' +
    '.ww-track{display:flex;width:max-content;animation:wwScroll 48s linear infinite;will-change:transform}' +
    '.ww-box:hover .ww-track{animation-play-state:paused}' +
    '.ww-item{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:190px;height:132px;border-right:1px solid #f0f1f3;text-decoration:none;color:inherit}' +
    '.ww-item img.wide{height:62px;width:128px}' +
    '.ww-item img{height:58px;width:58px;object-fit:contain;mix-blend-mode:multiply;filter:grayscale(1);opacity:.62;transition:filter .45s,opacity .45s,transform .45s cubic-bezier(.2,.7,.2,1)}' +
    '.ww-item .mark{height:58px;display:flex;align-items:center;justify-content:center;max-width:150px;text-align:center;font-family:HBSerif,serif;font-size:19px;line-height:1.1;color:#9ca3af;transition:color .45s,transform .45s cubic-bezier(.2,.7,.2,1)}' +
    '.ww-item small{font-family:FunnelDisplay,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af;transition:color .45s;text-align:center;padding:0 10px}' +
    '.ww-item:hover img{filter:none;opacity:1;transform:scale(1.08)}' +
    '.ww-item:hover .mark{color:#111827;transform:scale(1.06)}' +
    '.ww-item:hover small{color:#111827}' +
    '@keyframes wwScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '@media (prefers-reduced-motion:reduce){.ww-track{animation:none}.ww-box{overflow-x:auto}.ww-mask{-webkit-mask-image:none;mask-image:none}}' +
    '@media (max-width:767px){.ww{margin-top:72px}.ww-item{width:150px;height:116px}.ww-item img,.ww-item .mark{height:48px;width:48px}.ww-item img.wide{height:50px;width:104px}.ww-item .mark{width:auto;font-size:16px}}';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function cell(c) {
    var top = c.logo
      ? '<img' + (c.wide ? ' class="wide"' : '') + ' src="' + esc(c.logo) + '" alt="' + esc(c.name) + ' logo" loading="eager" decoding="async">'
      : '<span class="mark">' + esc(c.name) + '</span>';
    return '<div class="ww-item" title="' + esc(c.name) + '">' + top + '<small>' + esc(c.short || c.name) + '</small></div>';
  }

  function build() {
    var sec = document.createElement('section');
    sec.id = 'worked-with';
    sec.className = 'ww';
    sec.setAttribute('aria-label', 'Places I have worked with');
    var cells = CLIENTS.map(cell).join('');
    sec.innerHTML =
      '<div class="ww-head"><div class="line"><h2>' +
      '<span><span style="font-family:HBSerif, sans-serif;font-size:1.5em">W</span><span style="font-family:HBSerif, sans-serif">orked</span></span>' +
      '<span><span style="font-family:HBSerif, sans-serif;font-size:1.5em">W</span><span style="font-family:HBSerif, sans-serif">ith</span></span>' +
      '</h2></div></div>' +
      '<p class="ww-cap">Universities, studios and teams I have designed, researched and taught with.</p>' +
      '<div class="ww-box">' +
      '<span class="ww-plus" style="left:0;top:0;transform:translate(-50%,-50%)">+</span><span class="ww-plus" style="right:0;top:0;transform:translate(50%,-50%)">+</span>' +
      '<span class="ww-plus" style="left:0;bottom:0;transform:translate(-50%,50%)">+</span><span class="ww-plus" style="right:0;bottom:0;transform:translate(50%,50%)">+</span>' +
      '<div class="ww-mask"><div class="ww-track">' + cells + cells + '</div></div></div>';
    return sec;
  }

  function place() {
    if (document.getElementById('worked-with')) return true;
    var target = document.getElementById('contact') || document.querySelector('footer');
    if (!target || !target.parentNode) return false;
    if (!document.getElementById('ww-style')) {
      var st = document.createElement('style'); st.id = 'ww-style'; st.textContent = CSS; document.head.appendChild(st);
    }
    target.parentNode.insertBefore(build(), target);
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
