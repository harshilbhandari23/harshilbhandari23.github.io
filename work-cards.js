/* Homepage work section, in two parts:
   1. bordered project cards (text on the left, image on the right) in a carousel
   2. below it, a hairline overview: a statement, then numbered columns listing the work by category
   Both play a line-by-line reveal when they first scroll into view (format from thestart.com.au).
   - Edit PROJECTS to add, remove, reorder or reword work. `img` is the card image; `pos` sets which
     part of it stays in view when it is cropped to a square.
   - Edit FILTERS to rename categories or change their intros. Keep them in step with WORK in site-nav.js.
   - Edit INTRO for the statement above the columns.
   The carousel plays by itself every AUTOPLAY_MS and restarts from the first card after the last. It
   waits while the mouse is over it, while it is being used or is off screen, and has a pause button.
   Move with the arrows, by dragging, swiping, a sideways trackpad scroll or the arrow keys.
   Loaded from <head> so the old cards never flash; the carousel is added after the page hydrates. */
(function () {
  var FILTERS = [
    { id: 'all', name: 'All' },
    { id: 'design', name: 'Design', href: '/design/', intro: 'App case studies, brand identity, advertising and motion graphics, and interactive 3D and AR keepsakes.' },
    { id: 'fine', name: 'Fine Arts', href: '/fine-arts/', intro: 'Painting, illustration, digital art and film, from canvas and watercolour to a short film.' },
    { id: 'photo', name: 'Photography', href: '/photography/', overviewOnly: true, intro: 'Birds, wildlife, night skies, streets and landscapes, with a profile of the Nikon Z6III I shoot with.' },
    { id: 'research', name: 'Research', href: '/publications/', intro: 'Papers, conference talks, data visualization and 3D models that give research a visible form.' }
  ];




  var AUTOPLAY_MS = 4500;

  var INTRO = {
    statement: 'Work across four areas: design, fine arts, photography and research.',
    text: 'I am a doctoral scholar at Dhirubhai Ambani University and a Junior Research Fellow at its Smart Energy Learning Centre. I work across UI/UX, interaction design, digital heritage and XR/AR, with a focus on sustainability and inclusive design.',
    allWork: { label: 'View all my work', href: '/#work' },
    about: { label: 'About me', href: '/about' }
  };

  function cover(id) { return '/images/mine/projects/' + id + '/cover.webp'; }

  var PROJECTS = [
    { name: 'Ecoverse', cat: 'design', year: '2026', slug: 'ecoverse-turn-everyday-actions-into-climate-impact', img: '/images/mine/ecoverse.webp',
      text: 'An AI-powered app that turns everyday actions into climate impact. Built with the Double Diamond process and aligned with UN SDGs 7, 12 and 13.' },
    { name: 'Silver Jubilee Memento', cat: 'design', year: '2026', slug: 'silver-jubilee-memento', img: '/images/mine/projects/silver-jubilee-memento/cover.jpg',
      text: 'An interactive 3D model of a layered memento for the Dhirubhai Ambani University Silver Jubilee, viewable in your room in AR.' },
    { name: 'Bird Flip Calendar', cat: 'design', year: '2026', slug: 'bird-flip-calendar', img: '/images/mine/projects/bird-flip-calendar/cover.jpg',
      text: 'An interactive 3D flip calendar of bird illustrations for the Silver Jubilee. Turn the pages, or view it in your room in AR.' },
    { name: 'Keeper', cat: 'design', year: '2025', slug: 'keeper-subscription-management-app', img: '/images/mine/keeper.webp', pos: '100% 50%',
      text: 'UI/UX design for a subscription management app, designed in Figma.' },
    { name: 'Railway Accident Data', cat: 'research', year: '2025', slug: 'data-visualization-of-railway-network-with-accidents', img: '/images/mine/railway.webp', pos: '0% 50%',
      text: 'Data visualization and infographic design that maps a railway network alongside its accident records.' },
    { name: 'The Plague Story', cat: 'fine', year: '2023', slug: 'the-plague-story-folktale', img: '/images/mine/plague.webp',
      text: 'A Bengali folktale retold in Patachitra art blended with Phad, through illustration, character design and motion.' },
    { name: 'Rent The Runway', cat: 'design', year: '2025', slug: 'brand-identity-redesign-rtr', img: cover('217455067'), pos: '0% 50%',
      text: 'Brand identity redesign and brand guidelines for Rent The Runway: logo, typography, colour palette and brand applications.' },
    { name: 'Data Manifestation Model', cat: 'research', year: '2024', slug: 'data-manifestation-model', img: '/images/mine/data-manifestation.webp',
      text: 'A 3D data-visualization model that gives a dataset a physical form.' },
    { name: 'Ethnographic Visualization', cat: 'research', year: '2024', slug: 'ethnographic-visualization', img: '/images/mine/ethnographic.webp',
      text: 'An infographic built from ethnographic research at a fruit market.' },
    { name: 'Canvas Painting', cat: 'fine', year: '2024', slug: 'canvas-painting', img: '/images/mine/canvas-painting.jpeg',
      text: 'Paintings on canvas: hands-on fine-art practice away from the screen.' },
    { name: 'Spotify Album Cover Art', cat: 'fine', year: '2024', slug: 'spotify-album-cover-art', img: '/images/mine/spotify.webp',
      text: 'Concept covers and canvas art for albums.' },
    { name: "Intellect's Dilemma", cat: 'fine', year: '2024', slug: 'intellects-dilemma', img: '/images/mine/intellects-dilemma.webp',
      text: 'A 3D-modelled fine-art piece.' },
    { name: 'A Non-Fiction Short Film', cat: 'fine', year: '2025', slug: 'a-non-fiction-short-film', img: '/images/mine/short-film.webp',
      text: 'An interview-led short film, shot and edited.' },
    { name: 'Digital Art', cat: 'fine', year: '2024', slug: 'digital-art', img: cover('196615609'),
      text: 'Digital illustration and painting, made in Illustrator, Photoshop and Procreate.' },
    { name: 'Watercolour Birds Series', cat: 'fine', year: '2024', slug: 'watercolour-birds-series', img: cover('196743767'),
      text: 'Hand-painted watercolour birds from the Dhirubhai Ambani University campus, selected for the Birds of DAU Calendar.' },
    { name: 'Photo Replication', cat: 'fine', year: '2024', slug: 'photo-replication', img: cover('200126039'),
      text: 'A portrait photography and styling study.' },
    { name: 'Caricature Calendar', cat: 'fine', year: '2024', slug: 'caricature-calendar', img: cover('200104523'),
      text: 'A calendar of caricatures, digitally painted in Photoshop and Procreate.' },
    { name: 'Festival Social Posts', cat: 'design', year: '2024', slug: 'social-media-post-for-festivals', img: cover('200105551'),
      text: 'Illustrated social media posts for festivals, designed in Illustrator.' },
    { name: 'Event Graphic Design', cat: 'design', year: '2024', slug: 'event-graphic-design', img: cover('200114995'),
      text: 'Event branding and graphics, designed in Illustrator.' },
    { name: 'Marketing Poster & Standee', cat: 'design', year: '2024', slug: 'marketing-poster-standee', img: cover('200115135'),
      text: 'Advertising posters and standees for an English-language course, designed in Illustrator.' },
    { name: 'Imperial English Flashcards', cat: 'design', year: '2024', slug: 'flashcards-for-imperial-english-uk', img: cover('197288719'),
      text: 'Alphabet flashcards and packaging for Imperial English UK.' },
    { name: 'Digital Recreation', cat: 'fine', year: '2024', slug: 'digital-recreation', img: cover('198450509'),
      text: 'Digital restoration of an old photograph, painted in Photoshop.' },
    { name: 'Testimonial Video', cat: 'design', year: '2024', slug: 'testimonial-video', img: cover('200063135'),
      text: 'A testimonial video with motion graphics, made in After Effects.' },
    { name: 'App Demo Video', cat: 'design', year: '2024', slug: 'app-demo-video', img: cover('200063959'),
      text: 'An app demo video with motion graphics, made in After Effects.' },
    { name: 'Instagram Story Video', cat: 'design', year: '2024', slug: 'instagram-story-video', img: cover('200114637'),
      text: 'Instagram story video ads with motion graphics, made in After Effects.' },
    { name: 'Reel Ads', cat: 'design', year: '2024', slug: 'reel-ads', img: cover('200114847'),
      text: 'Short reel ads with motion graphics, made in After Effects.' }
  ];

  var ARROW = '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="M251.77-254.23 210-296l393.62-394H245.77v-60h460v460h-60v-357.85l-394 393.62Z"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  var PAUSE = '<svg class="ic-pause" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  var PLAY = '<svg class="ic-play" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>';

  var CSS = '' +
    /* the app's original cards stay in the page for React, just hidden */
    '#work .relative>.flex.flex-col.gap-10{display:none!important}' +
    /* hold the section's space from the start, so a /#work link can scroll down before the cards are added */
    '' +
    /* homepage sections whose projects are all in the carousel. Delete this line to bring them back */
    '[data-section="visual-identity"],[data-section="proposals"],[data-section="unplugged"],[data-section="lab"]{display:none!important}' +
    '.wc{--card:min(944px,calc(100vw - 80px));--line:#e5e7eb;position:relative;z-index:1}' +
    /* waiting for its reveal, and the masks that lines of text rise out of */
    '.hb-pre{opacity:0!important}' +
    '.hb-mask{display:block;overflow:hidden;overflow:clip;padding-bottom:.14em;margin-bottom:-.14em}' +
    '.hb-line{display:block}' +
    /* filters */
    '.wc-filters{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 26px}' +
    '.wc-f{appearance:none;margin:0;background:#fff;border:1px solid var(--line);padding:9px 14px;font-family:FunnelDisplay,sans-serif;font-size:11px;line-height:1;letter-spacing:.1em;text-transform:uppercase;color:#374151;cursor:pointer;white-space:nowrap;transition:background-color .2s,border-color .2s,color .2s}' +
    '.wc-f[aria-pressed="true"]{background:#111827;border-color:#111827;color:#fff}' +
    '@media (hover:hover){.wc-f:not([aria-pressed="true"]):hover{background:#111827;border-color:#111827;color:#fff}}' +
    /* track: runs the full page width so the neighbouring cards show at the sides */
    '.wc-track{position:relative;display:flex;gap:28px;width:100vw;margin-left:calc(50% - 50vw);box-sizing:border-box;padding:10px calc((100vw - var(--card))/2);overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;outline:0;cursor:grab}' +
    '.wc-track::-webkit-scrollbar{display:none}' +
    '.wc-track.is-drag{scroll-snap-type:none;cursor:grabbing;user-select:none;-webkit-user-select:none}' +
    '.wc-track.is-drag a{pointer-events:none}' +
    '.wc-track:focus-visible .wc-card.on{outline:2px solid #f97316;outline-offset:3px}' +
    /* card */
    '.wc-card{position:relative;flex:0 0 var(--card);width:var(--card);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));box-sizing:border-box;border:1px solid var(--line);background:#fff;scroll-snap-align:center;scroll-snap-stop:always;opacity:.38;transition:opacity .45s ease}' +
    '.wc-card[hidden]{display:none}' +
    '.wc-card.on{opacity:1}' +
    '.wc-card:not(.on){cursor:pointer}' +
    '.wc-card>b{position:absolute;z-index:2;font:400 13px/1 monospace;color:#9ca3af;user-select:none;pointer-events:none}' +
    '.wc-card>b.a{left:0;top:0;transform:translate(-50%,-50%)}.wc-card>b.c{right:0;top:0;transform:translate(50%,-50%)}' +
    '.wc-card>b.d{left:0;bottom:0;transform:translate(-50%,50%)}.wc-card>b.e{right:0;bottom:0;transform:translate(50%,50%)}' +
    '.wc-text{display:flex;flex-direction:column;justify-content:space-between;padding:40px;min-width:0;cursor:default}' +
    '.wc-text h3{margin:0 0 16px;font-family:HBSerif,serif;font-weight:300;font-size:30px;line-height:1.15;color:#000}' +
    '.wc-text p{margin:0;max-width:24rem;font-family:FunnelDisplay,sans-serif;font-size:14px;line-height:1.625;color:#6b7280}' +
    '.wc-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-top:32px}' +
    '.wc-year{font-family:FunnelDisplay,sans-serif;font-size:12px;color:#9ca3af}' +
    '.wc-go{display:inline-flex;align-items:center;gap:8px;flex:none;padding:8px 16px;border:1px solid #111827;font-family:FunnelDisplay,sans-serif;font-size:12px;line-height:1.35;color:#111827;text-decoration:none;transition:background-color .2s,color .2s}' +
    '@media (hover:hover){.wc-go:hover{background:#111827;color:#fff}.wc-card.on .wc-pic:hover img{transform:scale(1.04)}}' +
    '.wc-pic{position:relative;display:block;aspect-ratio:1/1;overflow:hidden;background:#f3f4f6}' +
    '.wc-pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform 1s cubic-bezier(.2,.7,.2,1);-webkit-user-drag:none}' +
    '.wc-f:focus-visible,.wc-go:focus-visible,.wc-nav:focus-visible{outline:2px solid #f97316;outline-offset:2px}' +
    /* controls */
    '.wc-ctrl{display:flex;align-items:center;gap:20px;margin-top:20px}' +
    '.wc-count{font-family:FunnelDisplay,sans-serif;font-size:12px;letter-spacing:.08em;color:#6b7280;font-variant-numeric:tabular-nums;white-space:nowrap}' +
    '.wc-count em{font-style:normal;color:#111827}' +
    '.wc-bar{position:relative;flex:1;height:1px;background:#d1d5db}' +
    '.wc-bar i{position:absolute;left:0;top:-.5px;height:2px;width:100%;background:#f97316;transform-origin:0 50%;transform:scaleX(0);transition:transform .45s cubic-bezier(.2,.7,.2,1)}' +
    '.wc-navs{display:flex;gap:8px}' +
    '.wc-nav{appearance:none;display:flex;align-items:center;justify-content:center;width:42px;height:42px;padding:0;background:#fff;border:1px solid #111827;color:#111827;cursor:pointer;transition:background-color .2s,color .2s,opacity .2s,border-color .2s}' +
    '.wc-nav.prev svg{transform:rotate(180deg)}' +
    '.wc-nav .ic-play{display:none}.wc-nav.is-paused .ic-play{display:block}.wc-nav.is-paused .ic-pause{display:none}' +
    '.wc-nav:disabled{opacity:.35;border-color:#d1d5db;cursor:default}' +
    '@media (hover:hover){.wc-nav:not(:disabled):hover{background:#111827;color:#fff}}' +
    /* phone: image on top */
    '@media (max-width:767px){' +
      '.wc{--card:calc(100vw - 48px)}' +
      '.wc-track{gap:14px}' +
      '.wc-filters{justify-content:center;gap:6px;margin-bottom:18px}' +
      '.wc-f{padding:9px 11px}' +
      '.wc-card{grid-template-columns:minmax(0,1fr)}' +
      '.wc-pic{order:1}.wc-text{order:2;padding:24px}' +
      '.wc-text h3{font-size:24px;margin-bottom:12px}' +
      '.wc-foot{margin-top:24px}' +
    '}' +
    /* overview: statement and numbered columns */
    '.wi{--line:#e5e7eb;position:relative;z-index:1;width:100vw;margin:88px 0 0 calc(50% - 50vw);background:#fff}' +
    '.wi-in{max-width:1520px;margin:0 auto;padding:0 36px;box-sizing:border-box}' +
    '.wi-frame{border:1px solid var(--line)}' +
    '.wi-top{display:flex;justify-content:flex-end;border-bottom:1px solid var(--line)}' +
    '.wi-top .wi-link{padding:24px 28px;border-left:1px solid var(--line)}' +
    '.wi-link{display:inline-flex;align-items:center;gap:10px;font-family:FunnelDisplay,sans-serif;font-size:12px;line-height:1.3;letter-spacing:.1em;text-transform:uppercase;color:#111827;text-decoration:none;transition:color .2s}' +
    '.wi-link>i{flex:none;width:8px;height:8px;background:#f97316}' +
    '.wi-link svg{flex:none}' +
    '@media (hover:hover){.wi-link:hover{color:#f97316}}' +
    '.wi-intro{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-bottom:1px solid var(--line)}' +
    '.wi-state{position:relative;padding:32px 40px 56px 28px;border-right:1px solid var(--line)}' +
    '.wi-state i{position:absolute;left:28px;top:47px;width:10px;height:10px;background:#f97316}' +
    '.wi-state h2{margin:0;max-width:36rem;text-indent:24px;font-family:HBSerif,serif;font-weight:300;font-size:clamp(26px,2.6vw,36px);line-height:1.2;color:#000}' +
    '.wi-state h2 .hb-mask:not(:first-child){text-indent:0}' +
    '.wi-side{display:flex;flex-direction:column}' +
    '.wi-side p{margin:0;padding:32px 28px;font-family:FunnelDisplay,sans-serif;font-size:15px;line-height:1.65;color:#374151;flex:1}' +
    '.wi-side .wi-link{padding:24px 28px;border-top:1px solid var(--line)}' +
    '.wi-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:auto auto 1fr}' +
    '.wi-col{display:grid;grid-template-rows:subgrid;grid-row:span 3;border-right:1px solid var(--line);min-width:0}' +
    '.wi-col:last-child{border-right:0}' +
    '.wi-n{padding:24px 28px 0;font-family:FunnelDisplay,sans-serif;font-size:14px;color:#bdbdbd}' +
    '.wi-tx{padding:24px 28px 32px;border-bottom:1px solid var(--line)}' +
    '.wi-tx h3{margin:0 0 14px;font-family:HBSerif,serif;font-weight:300;font-size:24px;line-height:1.2;color:#000}' +
    '.wi-tx p{margin:0;font-family:FunnelDisplay,sans-serif;font-size:14px;line-height:1.65;color:#6b7280}' +
    '.wi-rows{display:flex;flex-direction:column}' +
    '.wi-row{position:relative;display:block;padding:15px 28px;border-bottom:1px solid var(--line);font-family:FunnelDisplay,sans-serif;font-size:14px;line-height:1.35;color:#111827;text-decoration:none;overflow:hidden}' +
    '.wi-row:last-child{border-bottom:0}' +
    '.wi-go{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 28px}' +
    '.wi-go svg{position:relative;z-index:1;flex:none;transition:color .3s}' +
    '@media (hover:hover){.wi-go:hover svg{color:#fff}}' +
    '.wi-row span{position:relative;z-index:1;display:inline-block;max-width:100%;transition:color .3s}' +
    '.wi-row:after{content:"";position:absolute;left:0;right:0;bottom:0;height:0;background:#111827;transition:height .3s cubic-bezier(.7,0,.2,1)}' +
    '@media (hover:hover){.wi-row:hover span{color:#fff}.wi-row:hover:after{height:100%}}' +
    '.wi-link:focus-visible,.wi-row:focus-visible{outline:2px solid #f97316;outline-offset:-2px}' +
    '[data-busy]{white-space:nowrap;overflow:hidden}' +
    '@media (max-width:1099px){' +
      '.wi-in{padding:0 24px}' +
      '.wi-cols{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none}' +
      '.wi-col:nth-child(2n){border-right:0}' +
      '.wi-col:nth-child(n+3){border-top:1px solid var(--line)}' +
    '}' +
    '@media (max-width:767px){' +
      '.wi{margin-top:64px}' +
      '.wi-in{padding:0 16px}' +
      '.wi-top .wi-link{padding:18px 20px}' +
      '.wi-intro{grid-template-columns:minmax(0,1fr)}' +
      '.wi-state{padding:24px 20px 32px;border-right:0;border-bottom:1px solid var(--line)}' +
      '.wi-state i{left:20px;top:36px;width:9px;height:9px}' +
      '.wi-side p{padding:24px 20px}.wi-side .wi-link{padding:18px 20px}' +
      '.wi-cols{grid-template-columns:minmax(0,1fr)}' +
      '.wi-col{border-right:0}' +
      '.wi-col:nth-child(n+2){border-top:1px solid var(--line)}' +
      '.wi-n{padding:20px 20px 0}.wi-tx{padding:18px 20px 24px}.wi-row{padding:14px 20px}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){.wc-pic img,.wc-bar i,.wc-card,.wi-row:after,.wi-row span{transition:none}}';

  var st = document.createElement('style');
  st.id = 'wc-style';
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var sec, track, cards, buttons, prev, next, countNow, countAll, bar, overview;
  var vis = [], active = 0, current = 'all', runId = 0, ticking = false, justDragged = false;
  var playBtn, userPaused = reduced, hovering = false, inView = false, holdUntil = 0, elapsed = 0, lastTick = 0, wrapping = false, gliding = false, glideTimer = 0;

  function markup() {
    var filters = FILTERS.filter(function (f) { return !f.overviewOnly; }).map(function (f) {
      return '<button type="button" class="wc-f" data-filter="' + f.id + '" aria-pressed="' + (f.id === current ? 'true' : 'false') + '">' + esc(f.name) + '</button>';
    }).join('');
    var slides = PROJECTS.map(function (p, i) {
      var href = '/works/' + esc(p.slug);
      return '<article class="wc-card" data-i="' + i + '" role="group" aria-roledescription="slide">' +
        '<b class="a" aria-hidden="true">+</b><b class="c" aria-hidden="true">+</b><b class="d" aria-hidden="true">+</b><b class="e" aria-hidden="true">+</b>' +
        '<div class="wc-text"><div><h3>' + esc(p.name) + '</h3><p>' + esc(p.text) + '</p></div>' +
          '<div class="wc-foot"><span class="wc-year">' + esc(p.year) + '</span><a class="wc-go" href="' + href + '" draggable="false" aria-label="View work: ' + esc(p.name) + '">View Work' + ARROW + '</a></div></div>' +
        '<a class="wc-pic" href="' + href + '" draggable="false" tabindex="-1" aria-hidden="true"><img src="' + esc(p.img) + '" alt="" draggable="false"' + (i < 2 ? '' : ' loading="lazy"') + ' decoding="async"' + (p.pos ? ' style="object-position:' + esc(p.pos) + '"' : '') + '></a>' +
      '</article>';
    }).join('');
    return '<div class="wc-filters" role="group" aria-label="Filter projects">' + filters + '</div>' +
      '<div class="wc-track" tabindex="0" aria-label="Project cards. Use the left and right arrow keys to move.">' + slides + '</div>' +
      '<div class="wc-ctrl"><span class="wc-count" aria-live="polite"><em></em> / <span></span></span><div class="wc-bar" aria-hidden="true"><i></i></div>' +
        '<div class="wc-navs"><button type="button" class="wc-nav play" aria-label="Pause autoplay">' + PAUSE + PLAY + '</button><button type="button" class="wc-nav prev" aria-label="Previous project">' + CHEV + '</button><button type="button" class="wc-nav next" aria-label="Next project">' + CHEV + '</button></div></div>';
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function targetLeft(card) { return card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2; }

  function setActive(i) {
    i = Math.max(0, Math.min(vis.length - 1, i));
    if (i !== active) elapsed = 0;
    active = i;
    cards.forEach(function (c) { c.classList.toggle('on', c === vis[active]); });
    countNow.textContent = pad(active + 1);
    countAll.textContent = pad(vis.length);
    bar.style.transform = 'scaleX(' + (vis.length ? (active + 1) / vis.length : 0) + ')';
    prev.disabled = active <= 0;
    next.disabled = active >= vis.length - 1;
  }

  function nearest() {
    var mid = track.scrollLeft + track.clientWidth / 2, best = 0, gap = Infinity;
    vis.forEach(function (c, i) {
      var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < gap) { gap = d; best = i; }
    });
    return best;
  }

  function go(i, instant) {
    i = Math.max(0, Math.min(vis.length - 1, i));
    setActive(i);
    /* the glide starts nearer the old card, so the scroll listener waits or the counter would flicker back */
    clearTimeout(glideTimer);
    gliding = !(instant || reduced);
    if (gliding) glideTimer = setTimeout(function () { gliding = false; }, 900);
    track.scrollTo({ left: targetLeft(vis[i]), behavior: gliding ? 'smooth' : 'auto' });
  }

  function applyFilter(id) {
    cards.forEach(function (c) {
      var p = PROJECTS[+c.getAttribute('data-i')];
      c.hidden = !(id === 'all' || p.cat === id);
      c.setAttribute('aria-label', '');
    });
    vis = cards.filter(function (c) { return !c.hidden; });
    vis.forEach(function (c, i) { c.setAttribute('aria-label', (i + 1) + ' of ' + vis.length + ': ' + PROJECTS[+c.getAttribute('data-i')].name); });
    track.scrollLeft = 0;
    setActive(0);
    elapsed = 0;
  }

  function setFilter(id) {
    if (id === current) return;
    current = id;
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === id ? 'true' : 'false'); });
    var run = ++runId;
    if (reduced || !track.animate) { applyFilter(id); return; }
    var out = track.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
    setTimeout(function () {
      out.cancel();
      if (run !== runId) { track.style.opacity = '0'; return; }
      track.style.opacity = '';
      applyFilter(id);
      track.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }, 180);
  }

  /* text scrambles briefly on hover */
  function scramble(btn) {
    if (reduced || btn.getAttribute('data-busy')) return;
    var text = btn.textContent, frame = 0, total = 12;
    var chars = getComputedStyle(btn).textTransform === 'uppercase' ? 'ABCDEFGHKLMNOPRSTUXZ' : 'abcdefghklmnoprstuxz';
    btn.style.width = btn.offsetWidth + 'px';
    btn.style.height = btn.offsetHeight + 'px';
    btn.setAttribute('data-busy', '1');
    var timer = setInterval(function () {
      frame++;
      var shown = Math.floor(text.length * frame / total), out = text.slice(0, shown);
      for (var i = shown; i < text.length; i++) out += text.charAt(i) === ' ' ? ' ' : chars.charAt(Math.floor(Math.random() * chars.length));
      btn.textContent = out;
      if (frame >= total) { clearInterval(timer); btn.textContent = text; btn.style.width = ''; btn.style.height = ''; btn.removeAttribute('data-busy'); }
    }, 28);
  }

  /* ---------- autoplay ---------- */
  function canPlay() {
    if (userPaused || hovering || !inView || wrapping || document.hidden || vis.length < 2) return false;
    if (Date.now() < holdUntil || track.classList.contains('is-drag')) return false;
    if (document.documentElement.classList.contains('hn-lock')) return false; /* the nav menu is open */
    var f = document.activeElement;
    return !(f && sec.contains(f) && f.matches(':focus-visible')); /* someone is tabbing through it */
  }

  /* after the last card, fade back to the first instead of racing across all of them */
  function backToStart() {
    if (!track.animate || reduced) { go(0, true); return; }
    wrapping = true;
    var out = track.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' });
    setTimeout(function () {
      go(0, true);
      out.cancel();
      track.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)' });
      wrapping = false;
    }, 230);
  }

  function wireAutoplay() {
    function show() {
      playBtn.classList.toggle('is-paused', userPaused);
      playBtn.setAttribute('aria-label', userPaused ? 'Play autoplay' : 'Pause autoplay');
    }
    show();
    playBtn.addEventListener('click', function () { userPaused = !userPaused; elapsed = 0; show(); });
    sec.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    sec.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hovering = false; });
    ['touchstart', 'touchend'].forEach(function (ev) {
      track.addEventListener(ev, function () { holdUntil = Date.now() + 5000; gliding = false; }, { passive: true });
    });
    track.addEventListener('wheel', function () { gliding = false; }, { passive: true });
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: 0.4 }).observe(track);
    } else inView = true;
    lastTick = Date.now();
    setInterval(function () {
      var now = Date.now(), step = now - lastTick;
      lastTick = now;
      if (!canPlay()) return;
      elapsed += step;
      if (elapsed < AUTOPLAY_MS) return;
      elapsed = 0;
      if (active >= vis.length - 1) backToStart(); else go(active + 1);
    }, 100);
  }

  /* drag with the mouse. Touch and trackpads use the browser's own scrolling */
  function wireDrag() {
    var down = false, startX = 0, startLeft = 0, lastX = 0, lastT = 0, speed = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = lastX = e.clientX; startLeft = track.scrollLeft; lastT = e.timeStamp; speed = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 6) return;
      if (!moved) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = startLeft - dx;
      if (e.timeStamp > lastT) speed = (e.clientX - lastX) / (e.timeStamp - lastT);
      lastX = e.clientX; lastT = e.timeStamp;
    });
    function up() {
      if (!down) return;
      down = false;
      if (!moved) return;
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 60);
      var i = nearest();
      /* a quick flick moves on even if the card has not passed the middle yet */
      if (i === active && Math.abs(speed) > 0.45) i = active + (speed < 0 ? 1 : -1);
      go(i);
      /* snapping comes back once the glide has finished, or it would cut the glide short */
      setTimeout(function () { track.classList.remove('is-drag'); }, reduced ? 0 : 520);
    }
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function build() {
    sec = document.createElement('section');
    sec.className = 'wc';
    sec.setAttribute('aria-roledescription', 'carousel');
    sec.setAttribute('aria-label', 'Selected works');
    sec.innerHTML = markup();
    track = sec.querySelector('.wc-track');
    cards = [].slice.call(sec.querySelectorAll('.wc-card'));
    buttons = [].slice.call(sec.querySelectorAll('.wc-f'));
    prev = sec.querySelector('.wc-nav.prev');
    next = sec.querySelector('.wc-nav.next');
    countNow = sec.querySelector('.wc-count em');
    countAll = sec.querySelector('.wc-count span');
    bar = sec.querySelector('.wc-bar i');
    playBtn = sec.querySelector('.wc-nav.play');

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { setFilter(b.getAttribute('data-filter')); });
      b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') scramble(b); });
    });
    prev.addEventListener('click', function () { go(active - 1); });
    next.addEventListener('click', function () { go(active + 1); });

    track.addEventListener('scroll', function () {
      if (gliding || ticking || track.classList.contains('is-drag')) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; setActive(nearest()); });
    }, { passive: true });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    });

    /* after a drag, stay put. A click on a side card brings it to the middle instead of opening it */
    track.addEventListener('click', function (e) {
      if (justDragged) { e.preventDefault(); e.stopPropagation(); return; }
      var card = e.target.closest('.wc-card');
      if (card && !card.classList.contains('on')) {
        e.preventDefault();
        go(vis.indexOf(card));
      }
    }, true);

    wireDrag();
    wireAutoplay();
    window.addEventListener('resize', function () { if (vis[active]) track.scrollLeft = targetLeft(vis[active]); });

  }

  /* ---------- overview: statement and numbered columns ---------- */
  function linkHTML(l) {
    return '<a class="wi-link" href="' + esc(l.href) + '"><i></i><span>' + esc(l.label) + '</span>' + ARROW + '</a>';
  }
  function overviewHTML() {
    var cols = FILTERS.filter(function (f) { return f.id !== 'all'; }).map(function (f, n) {
      return '<div class="wi-col"><span class="wi-n">' + pad(n + 1) + '</span>' +
        '<div class="wi-tx"><h3>' + esc(f.name) + '</h3><p>' + esc(f.intro) + '</p></div>' +
        '<div class="wi-rows"><a class="wi-row wi-go" href="' + esc(f.href) + '"><span>Explore ' + esc(f.name) + '</span>' + ARROW + '</a></div></div>';
    }).join('');
    return '<div class="wi-in"><div class="wi-frame">' +
      '<div class="wi-top">' + linkHTML(INTRO.allWork) + '</div>' +
      '<div class="wi-intro"><div class="wi-state"><i aria-hidden="true"></i><h2>' + esc(INTRO.statement) + '</h2></div>' +
        '<div class="wi-side"><p>' + esc(INTRO.text) + '</p>' + linkHTML(INTRO.about) + '</div></div>' +
      '<div class="wi-cols">' + cols + '</div>' +
    '</div></div>';
  }
  function buildOverview() {
    overview = document.createElement('section');
    overview.className = 'wi';
    overview.setAttribute('aria-label', 'Work by category');
    overview.innerHTML = overviewHTML();
    /* "view all" goes back up to the carousel, with every project showing */
    overview.querySelector('.wi-top .wi-link').addEventListener('click', function () { setFilter('all'); });
    [].forEach.call(overview.querySelectorAll('.wi-link,.wi-row'), function (a) {
      a.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') scramble(a.querySelector('span')); });
    });
  }

  /* ---------- reveal: text rises line by line out of a mask, everything else fades up ---------- */
  var EASE = 'cubic-bezier(.22,.8,.24,1)';

  /* wrap each rendered line of a plain-text element in a mask */
  function splitLines(el) {
    var text = el.textContent;
    el.innerHTML = text.split(' ').map(function (w) { return '<span>' + esc(w) + '</span>'; }).join(' ');
    var lines = [], top = null;
    [].forEach.call(el.children, function (w) {
      if (top === null || Math.abs(w.offsetTop - top) > 4) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.innerHTML = lines.map(function (l) { return '<span class="hb-mask"><span class="hb-line">' + esc(l.join(' ')) + '</span></span>'; }).join('');
    return { lines: [].slice.call(el.querySelectorAll('.hb-line')), restore: function () { el.textContent = text; } };
  }

  /* lines of an element rise in turn. Afterwards it goes back to plain text, so it can rewrap on resize */
  function riseLines(el, delay) {
    var s = splitLines(el), last;
    el.classList.remove('hb-pre');
    s.lines.forEach(function (line, i) {
      last = line.animate([{ opacity: 0, transform: 'translateY(100%)' }, { opacity: 1, transform: 'none' }],
        { duration: 760, delay: delay + i * 90, easing: EASE, fill: 'backwards' });
    });
    if (last) last.onfinish = s.restore; else s.restore();
    return delay + s.lines.length * 90;
  }

  function riseIn(el, delay, to) {
    el.classList.remove('hb-pre');
    el.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: to === undefined ? 1 : to, transform: 'none' }],
      { duration: 700, delay: delay, easing: EASE, fill: 'backwards' });
  }

  /* run once when the element reaches the viewport and the loading animation has opened */
  function whenSeen(el, play) {
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var tries = 0;
      (function wait() {
        if (document.documentElement.hasAttribute('data-hb-wait') && ++tries < 100) { setTimeout(wait, 100); return; }
        var fonts = document.fonts && document.fonts.ready;
        if (fonts) fonts.then(play); else play();
      })();
    }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(el);
  }

  function hide(list) { list.forEach(function (e) { if (e) e.classList.add('hb-pre'); }); }

  function setupCardsReveal() {
    var card = vis[0], side = vis[1];
    var filters = [].slice.call(sec.querySelectorAll('.wc-f'));
    var h3 = card.querySelector('h3'), p = card.querySelector('p'), foot = card.querySelector('.wc-foot');
    var pic = card.querySelector('.wc-pic img'), ctrl = sec.querySelector('.wc-ctrl');
    hide(filters.concat([h3, p, foot, pic, ctrl, side]));
    whenSeen(sec, function () {
      filters.forEach(function (f, i) { riseIn(f, i * 50); });
      pic.classList.remove('hb-pre');
      pic.animate([{ opacity: 0, clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.08)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'none' }],
        { duration: 1100, delay: 120, easing: EASE, fill: 'backwards' });
      var d = riseLines(h3, 220);
      d = riseLines(p, d + 60);
      riseIn(foot, d + 60);
      if (side) riseIn(side, 320, 0.38);
      riseIn(ctrl, d + 120);
    });
  }

  function setupOverviewReveal() {
    var q = function (s) { return [].slice.call(overview.querySelectorAll(s)); };
    var dot = overview.querySelector('.wi-state i'), h2 = overview.querySelector('.wi-state h2');
    var side = overview.querySelector('.wi-side p'), links = q('.wi-link');
    hide([dot, h2, side].concat(links));
    whenSeen(overview.querySelector('.wi-top'), function () { riseIn(links[0], 0); });
    whenSeen(overview.querySelector('.wi-intro'), function () {
      riseIn(dot, 0);
      var d = riseLines(h2, 60);
      var e = riseLines(side, 300);
      riseIn(links[1], Math.max(d, e) + 40);
    });
    q('.wi-col').forEach(function (col) {
      var h3 = col.querySelector('h3'), p = col.querySelector('.wi-tx p'), n = col.querySelector('.wi-n');
      var rows = [].slice.call(col.querySelectorAll('.wi-row span'));
      hide([n, h3, p].concat(rows));
      whenSeen(col, function () {
        var offset = 120 * [].indexOf.call(col.parentNode.children, col);
        riseIn(n, offset);
        var d = riseLines(h3, offset + 60);
        d = riseLines(p, d + 40);
        rows.forEach(function (r, i) { riseIn(r, d + 40 + i * 45); });
      });
    });
  }

  function setupReveal() {
    if (reduced || !window.IntersectionObserver || !track.animate) return;
    setupCardsReveal();
    setupOverviewReveal();
  }

  function host() {
    return document.getElementById('work');
  }

  function place() {
    var h = host();
    if (!h) return false;
    var fresh = !sec;
    if (fresh) { build(); buildOverview(); }
    if (sec.parentNode !== h) h.appendChild(sec);
    var w = document.getElementById('work');
    if (overview.parentNode !== w) w.appendChild(overview);
    if (fresh) { applyFilter(current); setupReveal(); }
    return true;
  }

  function hydrated() { return !!document.getElementById('work'); }

  function start() {
    var n = 0;
    (function wait() {
      if ((hydrated() || ++n > 60) && place()) {
        /* put it back if the page ever re-renders the section */
        new MutationObserver(function () { place(); }).observe(document.getElementById('work'), { childList: true, subtree: true });
        return;
      }
      setTimeout(wait, 100);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
