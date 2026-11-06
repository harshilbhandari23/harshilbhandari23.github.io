/* Site navigation: "Menu | logo | Let's Connect" bar that expands into a menu, on every page and
   at every width. The box widens, then grows downward, while the page behind dims and blurs.
   - Menu view: Pages, Work (hover or tap a category to see its projects) and a project card.
   - Let's Connect view: a three-step form that opens as a ready-to-send email (there is no server).
   Shape and look follow the site: square corners, grey border, corner marks, site fonts, orange
   accent. Edit PAGES, WORK, SOCIAL, EMAIL and PERSON below to change the content.
   Loaded synchronously from <head> so the old nav is hidden before the first paint. */
(function () {
  var EMAIL = 'harshilbhandari22@gmail.com';
  var PERSON = { name: 'Harshil Bhandari', role: 'Communication Designer & Researcher', photo: '/images/mine/harshil.webp' };
  var PAGES = [
    { label: 'Home', href: '/', match: function (p) { return p === '/'; } },
    { label: 'Work', href: '/#work', match: function (p) { return p.indexOf('/works/') === 0; } },
    { label: 'Photography', href: '/photography', match: function (p) { return p === '/photography'; } },
    { label: 'Research', href: '/publications', match: function (p) { return p === '/publications'; } },
    { label: 'About', href: '/about', match: function (p) { return p === '/about'; } }
  ];
  var WORK = [
    { name: 'Design', short: 'Apps, brands, motion, 3D', items: [['Explore Design', '/design/']] },
    { name: 'Fine Arts', short: 'Painting, illustration, film', items: [['Explore Fine Arts', '/fine-arts/']] },
    { name: 'Photography', short: 'Birds, wildlife, astro, street', items: [['Explore Photography', '/photography/']] },
    { name: 'Research', short: 'Papers and visualization', items: [['Explore Research', '/publications/']] }
  ];
  var TOPICS = ['UI/UX & product', 'Brand identity', 'Research', 'Illustration', 'Motion & film', 'Something else'];

  function badge(t, s) { return '<rect width="24" height="24" rx="3" fill="currentColor"/><text x="12" y="16.4" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="' + s + '" font-weight="700" fill="#fff">' + t + '</text>'; }
  var ICONS = {
    linkedin: badge('in', 12.5),
    behance: badge('Bē', 10.5),
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7.5 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  var SOCIAL = [
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/harshilbhandari/' },
    { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/harshilbhandari' },
    { key: 'behance', label: 'Behance', href: 'https://www.behance.net/harshilbhandari22' }
  ];

  var CSS = '' +
    /* the original nav stays in the HTML as a no-script fallback */
    'nav[aria-label="Main"]:not(.hn-bar){display:none!important}' +
    /* the Unplugged section and the Lab are gone, so their footer links go too */
    'footer a[href="/#unplugged"],footer a[href="/lab"]{display:none!important}' +
    '.hn{--ease:cubic-bezier(.22,.8,.2,1);--hn-closed:505px;--hn-open:min(896px,calc(100vw - 24px));--line:#e5e7eb;position:fixed;top:0;left:0;right:0;z-index:10005;display:flex;justify-content:center;padding:16px 12px;pointer-events:none;box-sizing:border-box}' +
    '.hn *,.hn *:before,.hn *:after{box-sizing:border-box}' +
    '.hn-box{position:relative;pointer-events:auto;width:var(--hn-closed);max-width:100%;background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(10px) saturate(140%);backdrop-filter:blur(10px) saturate(140%);border:2px solid rgba(180,180,185,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 -1px 0 rgba(255,255,255,.1),0 8px 24px rgba(0,0,0,.1);transition:width .5s var(--ease) .2s,background-color .35s ease .2s,box-shadow .3s ease;animation:hnIn .7s var(--ease) both}' +
    '@keyframes hnIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}' +
    '.hn.is-open .hn-box{width:var(--hn-open);background:rgba(255,255,255,.97);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 24px 56px rgba(0,0,0,.18);transition:width .46s var(--ease),background-color .25s ease,box-shadow .3s ease}' +
    '.hn-c{position:absolute;width:8px;height:8px;background:rgba(212,212,216,.5);pointer-events:none;z-index:2}' +
    '.hn-c.hn-tl{top:-4px;left:-4px}.hn-c.hn-tr{top:-4px;right:-4px}.hn-c.hn-bl{bottom:-4px;left:-4px}.hn-c.hn-br{bottom:-4px;right:-4px}' +
    /* bar */
    '.hn-bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;height:40px;padding:0 16px;font-family:FunnelDisplay,sans-serif;font-size:14px;color:#3f3f46}' +
    ':where(.hn-bar button){all:unset;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.hn-bar button:focus-visible,.hn-logo:focus-visible,.hn-panel a:focus-visible,.hn-panel button:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}' +
    '.hn-toggle{display:inline-flex;align-items:center;gap:10px;justify-self:start;height:40px;transition:color .25s}' +
    '@media (hover:hover){.hn-toggle:hover,.hn-talk:hover{color:#f97316}}' +
    '.hn-bars{position:relative;display:block;width:20px;height:9px}' +
    '.hn-bars i{position:absolute;left:0;width:20px;height:1.6px;background:currentColor;transition:transform .45s var(--ease),top .45s var(--ease)}' +
    '.hn-bars i:first-child{top:0}.hn-bars i:last-child{top:7.4px}' +
    '.hn.is-open .hn-bars i:first-child{top:3.7px;transform:rotate(45deg)}.hn.is-open .hn-bars i:last-child{top:3.7px;transform:rotate(-45deg)}' +
    '.hn-words{display:block;height:20px;line-height:20px;overflow:hidden}' +
    '.hn-words span{display:block;transition:transform .45s var(--ease)}' +
    '.hn.is-open .hn-words span{transform:translateY(-100%)}' +
    '.hn-logo{display:flex;align-items:center;justify-content:center;transition:transform .35s var(--ease)}' +
    '@media (hover:hover){.hn-logo:hover{transform:scale(1.08)}}.hn-logo img{display:block;width:20px;height:26px}' +
    '.hn-talk{justify-self:end;height:28px;line-height:26px;padding:0;border:1px solid transparent;white-space:nowrap;transition:color .25s,border-color .3s,padding .4s var(--ease),background-color .25s}' +
    '.hn.is-open .hn-talk{padding:0 12px;border-color:#d4d4d8}' +
    '.hn[data-view="contact"].is-open .hn-talk{background:#111827;border-color:#111827;color:#fff}' +
    /* panel */
    '.hn-panel{position:relative;height:0;overflow:hidden;overscroll-behavior:contain;transition:height .36s var(--ease)}' +
    '.hn.is-open .hn-panel{height:var(--panel-h,0);transition:height .56s var(--ease) .3s}' +
    '.hn.is-settled .hn-panel{overflow-y:auto;transition:height .42s var(--ease)}' +
    '.hn-views{display:grid;width:calc(var(--hn-open) - 4px);margin-left:calc((100% - var(--hn-open) + 4px)/2);border-top:1px solid var(--line)}' +
    '.hn-view{grid-area:1/1;align-self:start;min-width:0;transition:opacity .22s ease,visibility 0s}' +
    '.hn-view:not(.on){opacity:0;visibility:hidden;pointer-events:none;transition:opacity .16s ease,visibility 0s .16s}' +
    '.hn-reveal{opacity:0;transform:translateY(10px);transition:opacity .16s ease,transform .16s ease}' +
    '.hn.is-open .hn-view.on .hn-reveal{opacity:1;transform:none;transition:opacity .5s ease calc(.44s + var(--d,0)*.06s),transform .65s var(--ease) calc(.44s + var(--d,0)*.06s)}' +
    '.hn.is-settled .hn-view.on .hn-reveal{transition-delay:calc(.1s + var(--d,0)*.035s)}' +
    '.hn-eyebrow{margin:0 0 12px;font-family:FunnelDisplay,sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af}' +
    /* menu view */
    '.hn-cols{display:grid;grid-template-columns:1fr 1.05fr 1.2fr;gap:28px;padding:22px 26px 26px;align-items:stretch}' +
    '.hn-col{display:flex;flex-direction:column;min-width:0}' +
    '.hn-list{list-style:none;margin:0;padding:0}' +
    '.hn-page{position:relative;display:inline-flex;align-items:center;gap:10px;padding:2px 0;font-family:HBSerif,serif;font-weight:300;font-size:30px;line-height:1.26;letter-spacing:-.01em;color:#111827;text-decoration:none;transition:color .2s,transform .35s var(--ease)}' +
    '@media (hover:hover){.hn-page:hover{color:#f97316;transform:translateX(4px)}}' +
    '.hn-page.cur:after{content:"";width:6px;height:6px;background:#f97316}' +
    '.hn-cat{all:unset;box-sizing:border-box;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;width:100%;padding:0 0 13px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:opacity .25s}' +
    '.hn-cat b{display:block;font-family:HBSerif,serif;font-weight:300;font-size:23px;line-height:1.2;color:#111827;transition:color .2s}' +
    '.hn-cat small{display:block;margin-top:3px;font-family:FunnelDisplay,sans-serif;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af}' +
    '.hn-cat em{font-style:normal;font-family:FunnelDisplay,sans-serif;font-size:14px;line-height:28px;color:#f97316;opacity:0;transform:translateX(-6px);transition:opacity .25s,transform .35s var(--ease)}' +
    '.hn-cats.has-active .hn-cat{opacity:.34}' +
    '.hn-cats.has-active .hn-cat.on{opacity:1}.hn-cat.on b{color:#f97316}.hn-cat.on em{opacity:1;transform:none}' +
    '.hn-foot{margin-top:auto;padding-top:16px}' +
    '.hn-all{font-family:FunnelDisplay,sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;text-decoration:none;transition:color .2s}@media (hover:hover){.hn-all:hover{color:#f97316}}' +
    '.hn-soc{display:flex;gap:8px}' +
    '.hn-soc a{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--line);color:#4b5563;transition:color .2s,border-color .2s}' +
    '@media (hover:hover){.hn-soc a:hover{color:#f97316;border-color:#f97316}}.hn-soc svg{width:16px;height:16px;display:block}' +
    '.hn-theme{display:none;align-items:center;justify-content:space-between;grid-column:1/-1;padding-top:14px;border-top:1px solid var(--line);font-family:FunnelDisplay,sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af}' +
    /* card */
    '.hn-card{position:relative;min-height:290px;border:1px solid var(--line);overflow:hidden;background:#fff}' +
    '.hn-face{position:absolute;inset:0;display:flex;flex-direction:column;padding:16px;opacity:0;visibility:hidden;overflow:auto;transition:opacity .22s ease,visibility 0s .22s}' +
    '.hn-face.on{opacity:1;visibility:visible;transition:opacity .28s ease .04s,visibility 0s}' +
    '.hn-pitch{background:linear-gradient(180deg,#fff 0%,#fff 36%,#fff4ea 58%,#fdba74 86%,#f97316 112%)}' +
    '.hn-pitch .plus{position:absolute;top:12px;right:14px;font-family:monospace;font-size:18px;line-height:1;color:#f97316}' +
    '.hn-pitch h3{margin:0;font-family:HBSerif,serif;font-weight:300;font-size:28px;line-height:1.14;color:#111827}' +
    '.hn-btn{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 18px;cursor:pointer;font-family:FunnelDisplay,sans-serif;font-size:13px;border:1px solid #111827;color:#111827;transition:background-color .2s,color .2s,opacity .2s}' +
    '@media (hover:hover){.hn-btn:hover{background:#111827;color:#fff}}' +
    '.hn-btn.solid{background:#fff;color:#111827}@media (hover:hover){.hn-btn.solid:hover{background:#111827;color:#fff}}' +
    '.hn-pitch .hn-btn{margin-top:auto;width:100%}' +
    '.hn-face ul{list-style:none;margin:0;padding:0}' +
    '.hn-svc{display:flex;align-items:center;gap:8px;padding:3px 0;font-family:FunnelDisplay,sans-serif;font-size:13px;line-height:1.3;color:#374151;text-decoration:none;transition:color .2s,transform .3s var(--ease)}' +
    '@media (hover:hover){.hn-svc:hover{color:#f97316;transform:translateX(3px)}}' +
    '.hn-tag{font-size:8px;letter-spacing:.1em;text-transform:uppercase;padding:2px 5px;border:1px solid var(--line);color:#6b7280}' +
    /* contact view */
    '.hn-talkv{display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;padding:22px 26px 26px}' +
    '.hn-talkv h2{margin:0 0 10px;font-family:HBSerif,serif;font-weight:300;font-size:32px;line-height:1.12;color:#111827}' +
    '.hn-talkv p.lede{margin:0 0 20px;font-family:FunnelDisplay,sans-serif;font-size:13px;line-height:1.55;color:#6b7280;max-width:20rem}' +
    '.hn-me{display:flex;align-items:center;gap:12px;margin-bottom:12px}' +
    '.hn-me img{width:64px;height:64px;object-fit:cover;object-position:50% 12%;border:1px solid var(--line);display:block}' +
    '.hn-me b{display:block;font-family:HBSerif,serif;font-weight:400;font-size:17px;color:#111827}' +
    '.hn-me small{display:block;margin-top:2px;font-family:FunnelDisplay,sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af}' +
    '.hn-steps{border:1px solid var(--line);align-self:start}' +
    '.hn-step{border-top:1px solid var(--line)}.hn-step:first-child{border-top:0}' +
    '.hn-step-h{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;font-family:FunnelDisplay,sans-serif;font-size:13px;color:#9ca3af;cursor:default}' +
    '.hn-step-h i{font-style:normal;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border:1px solid var(--line);font-size:10px}' +
    '.hn-step.on .hn-step-h{color:#111827}.hn-step.on .hn-step-h i{background:#111827;border-color:#111827;color:#fff}' +
    '.hn-step.done .hn-step-h{color:#4b5563;cursor:pointer}.hn-step.done .hn-step-h i{border-color:#f97316;color:#f97316}' +
    '.hn-step-b{display:none;padding:0 14px 14px}.hn-step.on .hn-step-b{display:block}' +
    '.hn-field{display:block;width:100%;margin:0 0 8px;padding:10px 12px;border:1px solid var(--line);border-radius:0;background:#fafafa;font-family:FunnelDisplay,sans-serif;font-size:13px;color:#111827;outline:none;transition:border-color .2s,background-color .2s;-webkit-appearance:none;appearance:none}' +
    '.hn-field:focus{border-color:#111827;background:#fff}.hn-field.bad{border-color:#ef4444}' +
    'textarea.hn-field{min-height:92px;resize:vertical;line-height:1.5}' +
    '.hn-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:8px}' +
    '.hn-chip{all:unset;box-sizing:border-box;padding:7px 11px;border:1px solid var(--line);background:#fafafa;cursor:pointer;font-family:FunnelDisplay,sans-serif;font-size:12px;color:#374151;transition:background-color .2s,color .2s,border-color .2s}' +
    '@media (hover:hover){.hn-chip:not([aria-pressed="true"]):hover{background:#111827;border-color:#111827;color:#fff}}.hn-chip[aria-pressed="true"]{background:#111827;border-color:#111827;color:#fff}' +
    '.hn-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:8px;margin-top:4px}' +
    '.hn-note{margin:10px 0 0;font-family:FunnelDisplay,sans-serif;font-size:12px;line-height:1.5;color:#6b7280}.hn-note a{color:#111827}' +
    '.hn-err{min-height:0;margin:0 0 8px;font-family:FunnelDisplay,sans-serif;font-size:11px;color:#dc2626}.hn-err:empty{display:none}' +
    /* scrim */
    '.hn-scrim{position:fixed;inset:0;z-index:10003;background:rgba(10,10,14,.42);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);opacity:0;visibility:hidden;transition:opacity .4s ease,visibility 0s .4s}' +
    '.hn-scrim.on{opacity:1;visibility:visible;transition:opacity .4s ease,visibility 0s}' +
    /* dark mode inverts the whole page, so the scrim is lightened before the inversion */
    'html[data-theme="dark"] .hn-scrim{background:rgba(255,255,255,.5)}' +
    'html.hn-lock{overflow:hidden}' +
    '@media (max-width:767px){' +
    '.hn{--hn-closed:calc(100vw - 24px)}' +
    '.hn-bar{padding:0 12px;font-size:13px}' +
    'html.hn-lock .tm-btn{opacity:0;pointer-events:none}' +
    '.hn-cols{grid-template-columns:1fr 1fr;gap:20px 14px;padding:18px 16px 18px}' +
    '.hn-page{font-size:26px}.hn-cat{padding-bottom:11px}.hn-cat b{font-size:18px}.hn-cat small{font-size:8.5px;letter-spacing:.05em}.hn-cat em{display:none}' +
    '.hn-col.card{grid-column:1/-1}' +
    '.hn-card{min-height:0}' +
    '.hn-face{position:static;display:none;opacity:1;visibility:visible;overflow:visible}.hn-face.on{display:flex}' +
    '.hn-pitch{gap:16px;padding-bottom:14px}.hn-pitch h3{font-size:24px;padding-right:20px}' +
    '.hn-foot{padding-top:12px}' +
    '.hn-theme{display:flex}' +
    '.hn-talkv{grid-template-columns:1fr;gap:18px;padding:18px 16px}.hn-talkv h2{font-size:27px}.hn-talkv p.lede{margin-bottom:14px;max-width:none}' +
    '.hn-field{font-size:16px}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){.hn-box,.hn-panel,.hn-reveal,.hn-view,.hn-scrim,.hn-bars i,.hn-words span,.hn-face{transition:none!important;animation:none!important}}';

  var st = document.createElement('style');
  st.id = 'hn-style';
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var root = document.documentElement, wrap, box, panel, scrim, toggle, talk, viewsEl, lastFocus, settleTimer, ro;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function icon(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>'; }
  function currentPath() { return location.pathname.replace(/\/+$/, '') || '/'; }

  function markup() {
    var cur = currentPath();
    var pages = PAGES.map(function (p, i) {
      var on = p.match && p.match(cur);
      return '<li class="hn-reveal" style="--d:' + i + '"><a class="hn-page' + (on ? ' cur' : '') + '" href="' + esc(p.href) + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(p.label) + '</a></li>';
    }).join('');
    var cats = WORK.map(function (w, i) {
      return '<li class="hn-reveal" style="--d:' + (i + 1) + '"><button type="button" class="hn-cat" data-cat="' + i + '" aria-expanded="false" aria-controls="hn-face-' + i + '"><span><b>' + esc(w.name) + '</b><small>' + esc(w.short) + '</small></span><em aria-hidden="true">→</em></button></li>';
    }).join('');
    var faces = WORK.map(function (w, i) {
      return '<div class="hn-face" id="hn-face-' + i + '" data-face="' + i + '"><p class="hn-eyebrow">' + esc(w.name) + '</p><ul>' + w.items.map(function (it) {
        return '<li><a class="hn-svc" href="' + esc(it[1]) + '">' + esc(it[0]) + (it[2] ? '<span class="hn-tag">' + esc(it[2]) + '</span>' : '') + '</a></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var soc = SOCIAL.map(function (s) { return '<a href="' + esc(s.href) + '" target="_blank" rel="noopener" aria-label="' + esc(s.label) + '">' + icon(s.key) + '</a>'; }).join('');
    var chips = TOPICS.map(function (t) { return '<button type="button" class="hn-chip" aria-pressed="false">' + esc(t) + '</button>'; }).join('');

    return '' +
      '<div class="hn-box">' +
      '<span class="hn-c hn-tl"></span><span class="hn-c hn-tr"></span><span class="hn-c hn-bl"></span><span class="hn-c hn-br"></span>' +
      '<nav class="hn-bar" aria-label="Site">' +
      '<button type="button" class="hn-toggle" aria-expanded="false" aria-controls="hn-panel" aria-label="Open menu"><span class="hn-bars" aria-hidden="true"><i></i><i></i></span><span class="hn-words" aria-hidden="true"><span>Menu</span><span>Close</span></span></button>' +
      '<a class="hn-logo" href="/" aria-label="Home"><img src="/images/mine/hb-filled.svg" alt="" width="20" height="26"></a>' +
      '<button type="button" class="hn-talk" aria-haspopup="dialog">Let’s Connect</button>' +
      '</nav>' +
      '<div class="hn-panel" id="hn-panel" role="dialog" aria-modal="true" aria-label="Menu" inert>' +
      '<div class="hn-views">' +
      /* menu view */
      '<div class="hn-view on" data-pane="menu"><div class="hn-cols">' +
      '<nav class="hn-col" aria-label="Pages"><p class="hn-eyebrow hn-reveal">Pages</p><ul class="hn-list">' + pages + '</ul>' +
      '<div class="hn-foot hn-reveal" style="--d:6"><div class="hn-soc">' + soc + '</div></div></nav>' +
      '<div class="hn-col"><p class="hn-eyebrow hn-reveal" style="--d:1">Work</p><ul class="hn-list hn-cats">' + cats + '</ul>' +
      '<div class="hn-foot hn-reveal" style="--d:6"><a class="hn-all" href="/#work">See all projects →</a></div></div>' +
      '<div class="hn-col card hn-reveal" style="--d:3"><div class="hn-card">' +
      '<div class="hn-face hn-pitch on" data-face="-1"><span class="plus" aria-hidden="true">+</span><p class="hn-eyebrow">Start a project</p><h3>Have a project in mind?</h3><button type="button" class="hn-btn solid" data-go="contact">Let’s connect <span aria-hidden="true">→</span></button></div>' +
      faces + '</div></div>' +
      '<div class="hn-theme hn-reveal" style="--d:7"><span>Dark mode</span><button type="button" class="tm-switch" role="switch" aria-checked="false" aria-label="Dark mode"><span class="tm-track"><span class="tm-knob"></span></span></button></div>' +
      '</div></div>' +
      /* contact view */
      '<div class="hn-view" data-pane="contact"><div class="hn-talkv">' +
      '<div class="hn-reveal"><h2>Let’s start with your idea.</h2><p class="lede">Fill this in and it opens as an email to me, ready to send. The more you tell me, the more useful my first reply.</p>' +
      '<div class="hn-me"><img src="' + esc(PERSON.photo) + '" alt="' + esc(PERSON.name) + '" loading="lazy"><span><b>' + esc(PERSON.name) + '</b><small>' + esc(PERSON.role) + '</small></span></div>' +
      '<div class="hn-soc">' + soc + '<a href="mailto:' + esc(EMAIL) + '" aria-label="Email">' + icon('mail') + '</a></div></div>' +
      '<form class="hn-steps hn-reveal" style="--d:2" novalidate>' +
      '<div class="hn-step on" data-step="0"><button type="button" class="hn-step-h"><i>1</i>Your details</button><div class="hn-step-b">' +
      '<input class="hn-field" name="name" type="text" placeholder="Your name" autocomplete="name" aria-label="Your name">' +
      '<input class="hn-field" name="email" type="email" placeholder="your@email.com" autocomplete="email" aria-label="Your email">' +
      '<p class="hn-err" role="alert"></p><div class="hn-actions"><button type="button" class="hn-btn" data-go="menu">Cancel</button><button type="button" class="hn-btn solid" data-next>Next</button></div></div></div>' +
      '<div class="hn-step" data-step="1"><button type="button" class="hn-step-h"><i>2</i>What it is about</button><div class="hn-step-b"><div class="hn-chips">' + chips + '</div>' +
      '<p class="hn-err" role="alert"></p><div class="hn-actions"><button type="button" class="hn-btn" data-back>Back</button><button type="button" class="hn-btn solid" data-next>Next</button></div></div></div>' +
      '<div class="hn-step" data-step="2"><button type="button" class="hn-step-h"><i>3</i>A little more</button><div class="hn-step-b">' +
      '<textarea class="hn-field" name="message" placeholder="What are you making, and when do you need it?" aria-label="Your message"></textarea>' +
      '<p class="hn-err" role="alert"></p><div class="hn-actions"><button type="button" class="hn-btn" data-back>Back</button><button type="submit" class="hn-btn solid">Open email <span aria-hidden="true">→</span></button></div>' +
      '<p class="hn-note" hidden>Your email app should have opened with this filled in. If it didn’t, write to <a href="mailto:' + esc(EMAIL) + '">' + esc(EMAIL) + '</a>.</p></div></div>' +
      '</form></div></div>' +
      '</div></div></div>';
  }

  /* ---------- open / close / views ---------- */
  function isOpen() { return wrap.classList.contains('is-open'); }
  function pane() { return wrap.getAttribute('data-view') === 'contact' ? 'contact' : 'menu'; }
  function activeView() { return panel.querySelector('.hn-view[data-pane="' + pane() + '"]'); }

  function measure() {
    if (!isOpen()) return;
    var view = activeView();
    var room = window.innerHeight - box.getBoundingClientRect().top - 40 - 22;
    var h = Math.min(view.offsetHeight + 1, Math.max(220, room));
    panel.style.setProperty('--panel-h', h + 'px');
  }

  function setView(v) {
    wrap.setAttribute('data-view', v);
    var views = panel.querySelectorAll('.hn-view');
    for (var i = 0; i < views.length; i++) views[i].classList.toggle('on', views[i].getAttribute('data-pane') === v);
    panel.setAttribute('aria-label', v === 'contact' ? 'Let’s connect' : 'Menu');
    talk.setAttribute('aria-pressed', v === 'contact' ? 'true' : 'false');
    panel.scrollTop = 0;
    if (ro) { ro.disconnect(); ro.observe(activeView()); }
    measure();
  }

  function open(v) {
    if (isOpen()) { setView(v || 'menu'); return; }
    lastFocus = document.activeElement;
    setView(v || 'menu');
    wrap.classList.add('is-open');
    scrim.classList.add('on');
    root.classList.add('hn-lock');
    panel.removeAttribute('inert');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    measure();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () { if (isOpen()) { wrap.classList.add('is-settled'); measure(); } }, 950);
  }

  function close(returnFocus) {
    if (!isOpen()) return;
    clearTimeout(settleTimer);
    wrap.classList.remove('is-open', 'is-settled');
    scrim.classList.remove('on');
    root.classList.remove('hn-lock');
    panel.setAttribute('inert', '');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    setActive(-1);
    if (returnFocus && toggle) { try { toggle.focus({ preventScroll: true }); } catch (e) {} }
  }

  /* ---------- work categories ---------- */
  function setActive(i) {
    var list = panel.querySelector('.hn-cats');
    list.classList.toggle('has-active', i >= 0);
    var cats = panel.querySelectorAll('.hn-cat'), faces = panel.querySelectorAll('.hn-face');
    for (var c = 0; c < cats.length; c++) {
      var on = +cats[c].getAttribute('data-cat') === i;
      cats[c].classList.toggle('on', on);
      cats[c].setAttribute('aria-expanded', on ? 'true' : 'false');
    }
    for (var f = 0; f < faces.length; f++) faces[f].classList.toggle('on', +faces[f].getAttribute('data-face') === i);
  }
  function activeCat() { var a = panel.querySelector('.hn-cat.on'); return a ? +a.getAttribute('data-cat') : -1; }

  /* ---------- contact form ---------- */
  function goStep(n) {
    var steps = panel.querySelectorAll('.hn-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('on', i === n);
      steps[i].classList.toggle('done', i < n);
    }
    var first = steps[n].querySelector('input,textarea,.hn-chip');
    if (first && isOpen() && pane() === 'contact') { try { first.focus({ preventScroll: true }); } catch (e) {} }
  }
  function checkStep(n) {
    var form = panel.querySelector('form'), step = panel.querySelectorAll('.hn-step')[n], err = step.querySelector('.hn-err'), msg = '';
    if (n === 0) {
      var name = form.elements.name, mail = form.elements.email;
      var nameOk = name.value.trim().length > 0, mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim());
      name.classList.toggle('bad', !nameOk); mail.classList.toggle('bad', !mailOk);
      if (!nameOk) msg = 'Please add your name.'; else if (!mailOk) msg = 'Please add a valid email.';
    } else if (n === 1) {
      if (!panel.querySelector('.hn-chip[aria-pressed="true"]')) msg = 'Pick at least one.';
    }
    err.textContent = msg;
    return !msg;
  }
  function sendMail(form) {
    var topics = [].map.call(panel.querySelectorAll('.hn-chip[aria-pressed="true"]'), function (b) { return b.textContent; });
    var name = form.elements.name.value.trim();
    var body = 'Name: ' + name + '\nEmail: ' + form.elements.email.value.trim() + '\nAbout: ' + topics.join(', ') + '\n\n' + form.elements.message.value.trim();
    var link = document.createElement('a');
    link.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Project enquiry from ' + name) + '&body=' + encodeURIComponent(body);
    form.appendChild(link);
    link.click();
    form.removeChild(link);
    panel.querySelector('.hn-note').hidden = false;
  }

  /* ---------- wiring ---------- */
  function build() {
    wrap = document.createElement('div');
    wrap.className = 'hn';
    wrap.setAttribute('data-view', 'menu');
    wrap.innerHTML = markup();
    scrim = document.createElement('div');
    scrim.className = 'hn-scrim';
    box = wrap.querySelector('.hn-box');
    panel = wrap.querySelector('.hn-panel');
    toggle = wrap.querySelector('.hn-toggle');
    talk = wrap.querySelector('.hn-talk');
    viewsEl = wrap.querySelector('.hn-views');

    toggle.addEventListener('click', function () { isOpen() ? close(true) : open('menu'); });
    talk.addEventListener('click', function () {
      if (isOpen() && pane() === 'contact') setView('menu'); else open('contact');
    });
    /* a mouse/touch close: don't move focus to the toggle, or a blue focus ring stays on it */
    scrim.addEventListener('click', function () { close(false); });

    panel.addEventListener('click', function (e) {
      var t = e.target;
      var go = t.closest('[data-go]');
      if (go) { setView(go.getAttribute('data-go')); return; }
      if (t.closest('.hn-next,[data-next]')) {
        var n = +t.closest('.hn-step').getAttribute('data-step');
        if (checkStep(n)) goStep(n + 1);
        return;
      }
      if (t.closest('[data-back]')) { goStep(+t.closest('.hn-step').getAttribute('data-step') - 1); return; }
      var head = t.closest('.hn-step.done .hn-step-h');
      if (head) { goStep(+head.parentNode.getAttribute('data-step')); return; }
      var chip = t.closest('.hn-chip');
      if (chip) { chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }
      var sw = t.closest('.tm-switch');
      if (sw) { if (window.setTheme) window.setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); return; }
      if (t.closest('a') && !t.closest('a[target],a[href^="mailto:"]')) close(false);
    });

    /* hover shows a category's projects on desktop; tap toggles it on touch */
    var lastPointer = 'mouse';
    panel.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; }, true);
    var cats = panel.querySelectorAll('.hn-cat');
    for (var i = 0; i < cats.length; i++) (function (cat) {
      var idx = +cat.getAttribute('data-cat');
      cat.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setActive(idx); });
      cat.addEventListener('click', function () {
        if (lastPointer === 'mouse') setActive(idx); else setActive(activeCat() === idx ? -1 : idx);
      });
      cat.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'Enter') { setActive(idx); } });
    })(cats[i]);
    var cols = panel.querySelector('.hn-cols');
    cols.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') setActive(-1); });
    panel.querySelector('.hn-col').addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setActive(-1); });

    var form = panel.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (checkStep(0) && checkStep(1)) sendMail(form);
    });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        var n = +e.target.closest('.hn-step').getAttribute('data-step');
        if (checkStep(n)) goStep(n + 1);
      }
    });

    /* keep the page behind still, including smooth-scroll libraries listening on window */
    [scrim, wrap].forEach(function (el) {
      ['wheel', 'touchmove'].forEach(function (ev) {
        el.addEventListener(ev, function (e) {
          if (!isOpen()) return;
          e.stopPropagation();
          if (el === scrim) e.preventDefault();
        }, { passive: false });
      });
    });
    panel.setAttribute('data-lenis-prevent', '');

    box.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !isOpen()) return;
      var f = [].filter.call(box.querySelectorAll('a[href],button,input,textarea'), function (x) { return x.offsetParent !== null && getComputedStyle(x).visibility !== 'hidden'; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    if (window.ResizeObserver) { ro = new ResizeObserver(measure); ro.observe(activeView()); }
    var sw = panel.querySelector('.tm-switch');
    sw.setAttribute('aria-checked', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && wrap && isOpen()) close(true); });
  window.addEventListener('resize', function () { if (wrap) measure(); });
  window.addEventListener('pageshow', function (e) { if (wrap && e.persisted) close(false); });

  function place() {
    if (!wrap) build();
    if (!wrap.parentNode) document.body.appendChild(wrap);
    if (!scrim.parentNode) document.body.appendChild(scrim);
  }

  /* Pages rendered by React must finish hydrating before anything is added to <body>;
     the static pages can add the nav straight away. */
  function hydrated() {
    var m = document.querySelector('main');
    if (!m) return false;
    for (var k in m) if (k.indexOf('__reactFiber') === 0) return true;
    return false;
  }
  /* the footers are prebuilt, so these links are added here, modelled on the hidden Lab link */
  function footerLink() {
    var lab = document.querySelector('footer a[href="/lab"]');
    if (!lab) return;
    [['/publications', 'Research'], ['/photography', 'Photography']].forEach(function (l) {
      if (lab.parentNode.querySelector('a[href="' + l[0] + '"]')) return;
      var a = lab.cloneNode(false);
      a.setAttribute('href', l[0]);
      a.textContent = l[1];
      lab.parentNode.insertBefore(a, lab.nextSibling);
    });
  }

  function start() {
    var isReact = !!window.__next_f, n = 0;
    (function wait() {
      if (!document.body) { setTimeout(wait, 30); return; }
      if (isReact && !hydrated() && ++n < 60) { setTimeout(wait, 50); return; }
      place();
      footerLink();
      new MutationObserver(function () { if (!wrap.parentNode || !scrim.parentNode) place(); footerLink(); }).observe(document.body, { childList: true });
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
