/* Line-art 3D model of a Nikon Z6III for the Photography page.

   Modelled by hand in millimetres to the camera's real size (138.5 x 101.5 x 74 mm, plus the eyecup). Control
   positions are measured from Nikon's front, back, top and side product photos: fx/fy and bx/by below turn a
   position in the front or back photo into model coordinates. It is a drawing of the camera, not a scan of it.

   Three layers make the drawing:
   - an opaque surface the colour of the page, which hides whatever is behind it
   - thin lines for creases and details
   - a slightly heavier outline around every form (a copy of the surface, pushed outwards and turned inside
     out), which is what gives curved shapes such as the grip and dials a clean contour from any angle
   The lines draw themselves in when the model first scrolls into view.

   On the page the camera sits in a stage that stays pinned to the window while the visitor scrolls through its section.
   Scrolling turns the camera (it ends showing its back and screen), stirs a ring of particles around it, and carries
   rings of photographs up past it (see "the pinned stage" below). Drag to turn it by hand; a click or tap goes into the
   photos. Visitors who reduce motion get the finished drawing in an ordinary section, still and draggable. */
import {
  BackSide, BoxGeometry, BufferGeometry, CylinderGeometry, EdgesGeometry, ExtrudeGeometry, Float32BufferAttribute,
  Group, LatheGeometry, LineBasicMaterial, LineSegments, Matrix3, Matrix4, Euler, Mesh, MeshBasicMaterial, Path,
  PerspectiveCamera, Points, Scene, Shape, ShapeUtils, ShaderMaterial, TorusGeometry, Vector2, Vector3, WebGLRenderer
} from '/vendor/three.module.min.js';

const canvas = document.getElementById('camera-3d');
if (canvas) start();

function start() {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    return;   /* without WebGL the section stays as the plain list of the camera's details */
  }
  const section = canvas.closest('.pc-scroll');
  section.classList.add('is-live');
  renderer.setClearColor(0x000000, 0);
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- collecting the drawing ---------- */
  const surface = [], normals = [], lines = [];
  /* Heights and depths below are written in the camera's spec millimetres (101.5 mm tall, 74 mm deep), but widths
     follow the photos, where the body is 130 mm across. Nikon's photos from every side agree the body is 1.36 times
     as wide as it is tall, so heights and depths are scaled by SQ to match the widths. Round parts (the mount, dials,
     buttons and their markings) are placed with rigid(), which moves them without squashing them, so they stay round. */
  const SQ = 0.94;
  let RIG = null;
  function place(v) {
    if (RIG) { v.y = RIG[0] * SQ + (v.y - RIG[0]); v.z = RIG[1] * SQ + (v.z - RIG[1]); }
    else { v.y *= SQ; v.z *= SQ; }
    return v;
  }
  function rigid(y, z, fn) { const prev = RIG; RIG = [y, z]; fn(); RIG = prev; }

  /* add a solid. `angle` is how sharp a crease must be, in degrees, to get a line */
  function solid(geometry, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, angle = 28) {
    const m = new Matrix4().makeRotationFromEuler(new Euler(rx, ry, rz)).setPosition(x, y, z);
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    const pos = flat.attributes.position, v = new Vector3();
    /* average the normals where corners meet, so the outline stays closed around sharp edges */
    const key = (p) => p.x.toFixed(3) + ',' + p.y.toFixed(3) + ',' + p.z.toFixed(3), sum = new Map();
    const a = new Vector3(), b = new Vector3(), c = new Vector3(), n = new Vector3(), e = new Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
      n.copy(b).sub(a).cross(e.copy(c).sub(a));
      [a, b, c].forEach((p) => { const k = key(p); if (!sum.has(k)) sum.set(k, new Vector3()); sum.get(k).add(n); });
    }
    const nm = new Matrix3().setFromMatrix4(m);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const out = sum.get(key(v)).clone().applyMatrix3(nm);
      if (!RIG) { out.y /= SQ; out.z /= SQ; }
      out.normalize();
      place(v.applyMatrix4(m));
      surface.push(v.x, v.y, v.z);
      normals.push(out.x, out.y, out.z);
    }
    if (angle === null) return;   /* a sculpted form: only its outline and any lines drawn on it by hand */
    const edges = new EdgesGeometry(geometry, angle).attributes.position;
    for (let i = 0; i < edges.count; i++) {
      place(v.fromBufferAttribute(edges, i).applyMatrix4(m));
      lines.push(v.x, v.y, v.z);
    }
  }

  const _a = new Vector3(), _b = new Vector3();
  function seg(a, b) {
    place(_a.set(a[0], a[1], a[2])); place(_b.set(b[0], b[1], b[2]));
    lines.push(_a.x, _a.y, _a.z, _b.x, _b.y, _b.z);
  }
  function poly(list, closed = true) {
    for (let i = 0; i < list.length - (closed ? 0 : 1); i++) seg(list[i], list[(i + 1) % list.length]);
  }

  /* ---------- shape helpers ---------- */
  function rrect(x0, y0, x1, y1, r) {
    if (x0 > x1) { const t = x0; x0 = x1; x1 = t; }
    if (y0 > y1) { const t = y0; y0 = y1; y1 = t; }
    const s = new Shape();
    s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
    s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
    s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
    s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
    return s;
  }
  function slab(shape, z0, z1, chamfer = 0, angle = 28) {
    const geo = new ExtrudeGeometry(shape, {
      depth: z1 - z0 - chamfer * 2, curveSegments: 18, steps: 1, bevelEnabled: chamfer > 0,
      bevelThickness: chamfer, bevelSize: chamfer, bevelOffset: -chamfer, bevelSegments: 1
    });
    solid(geo, 0, 0, z0 + chamfer, 0, 0, 0, angle);
  }
  /* a solid between outlines at different depths. Every outline needs the same number of points */
  function loft(list, angle = 34, upright = false) {
    /* always build front-to-back from low z to high z, with outlines running anticlockwise, so faces point outwards */
    const sections = list.slice().sort((a, b) => a.z - b.z).map((S) => {
      const area = S.pts.reduce((sum, p, i) => { const q = S.pts[(i + 1) % S.pts.length]; return sum + p.x * q.y - q.x * p.y; }, 0);
      return { z: S.z, pts: area < 0 ? S.pts.slice().reverse() : S.pts };
    });
    const pos = [], n = sections[0].pts.length;
    const push = (p, z) => pos.push(p.x, p.y, z);
    for (let s = 0; s < sections.length - 1; s++) {
      const A = sections[s], B = sections[s + 1];
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        push(A.pts[i], A.z); push(B.pts[j], B.z); push(B.pts[i], B.z);
        push(A.pts[i], A.z); push(A.pts[j], A.z); push(B.pts[j], B.z);
      }
    }
    [[sections[0], true], [sections[sections.length - 1], false]].forEach(([S, first]) => {
      ShapeUtils.triangulateShape(S.pts, []).forEach(([a, b, c]) => {
        const A = S.pts[a], B = S.pts[b], C = S.pts[c];
        const up = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x) > 0;
        const [P, Q] = up === first ? [C, B] : [B, C];
        push(A, S.z); push(P, S.z); push(Q, S.z);
      });
    });
    if (upright) {
      /* slices were built as (x, plan z, height); stand them up as (x, height, z). That mirrors the solid, so flip each
         triangle to keep it facing outwards */
      for (let i = 0; i < pos.length; i += 3) { const t = pos[i + 1]; pos[i + 1] = pos[i + 2]; pos[i + 2] = t; }
      for (let i = 0; i < pos.length; i += 9) for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    solid(g, 0, 0, 0, 0, 0, 0, angle);
    return pos;
  }
  /* a line along a curved surface: where the plane nx*x + ny*y + nz*z = d cuts the triangles in `tris` */
  function contour(tris, nx, ny, nz, d, keep = () => true) {
    const at = (i) => nx * tris[i] + ny * tris[i + 1] + nz * tris[i + 2] - d;
    for (let i = 0; i < tris.length; i += 9) {
      const hits = [];
      [[0, 3], [3, 6], [6, 0]].forEach(([u, v]) => {
        const a = at(i + u), b = at(i + v);
        if ((a < 0) === (b < 0)) return;
        const t = a / (a - b);
        hits.push([0, 1, 2].map((k) => tris[i + u + k] + (tris[i + v + k] - tris[i + u + k]) * t));
      });
      if (hits.length !== 2) continue;
      const mid = { x: (hits[0][0] + hits[1][0]) / 2, y: (hits[0][1] + hits[1][1]) / 2, z: (hits[0][2] + hits[1][2]) / 2 };
      if (!keep(mid)) continue;
      const e1 = new Vector3(tris[i + 3] - tris[i], tris[i + 4] - tris[i + 1], tris[i + 5] - tris[i + 2]);
      const e2 = new Vector3(tris[i + 6] - tris[i], tris[i + 7] - tris[i + 1], tris[i + 8] - tris[i + 2]);
      const n = e1.cross(e2).normalize().multiplyScalar(0.06);
      seg(hits[0].map((c, k) => c + n.getComponent(k)), hits[1].map((c, k) => c + n.getComponent(k)));
    }
  }
  /* an outline's points, the same number along each of its segments, so outlines of one form line up */
  function ordered(shape, each = 7) {
    const out = [];
    shape.curves.forEach((curve) => { for (let k = 0; k < each; k++) out.push(curve.getPoint(k / each)); });
    return out;
  }
  /* a round part from a side profile of [radius, height] points, built around y, then laid along an axis */
  function turned(x, y, z, profile, axis = 'y', flip = false, segments = 56) {
    const geo = new LatheGeometry(profile.map(([r, h]) => new Vector2(r, h)), segments);
    const rx = axis === 'z' ? (flip ? -Math.PI / 2 : Math.PI / 2) : 0, rz = axis === 'x' ? (flip ? Math.PI / 2 : -Math.PI / 2) : 0;
    rigid(y, z, () => solid(geo, x, y, z, rx, 0, rz, 30));
  }
  /* a dial's ridges, as lines on its rim */
  function ridges(x, y, z, r, h, count, axis = 'y', from = 0, to = Math.PI * 2) {
    rigid(y, z, () => { for (let i = 0; i < count; i++) {
      const t = from + (to - from) * i / count, c = Math.cos(t) * (r + 0.02), s = Math.sin(t) * (r + 0.02);
      if (axis === 'y') seg([x + c, y, z + s], [x + c, y + h, z + s]);
      else if (axis === 'x') seg([x, y + c, z + s], [x + h, y + c, z + s]);
      else seg([x + c, y + s, z], [x + c, y + s, z + h]);
    } });
  }
  /* a push button on the back of the camera: a collar, then a domed cap. In axis z, -height is towards the back */
  function backButton(x, y, r, z = ZB, h = 1.6, collar = 0.9) {
    turned(x, y, z, [[0, 0], [r + collar, 0], [r + collar, 0.5], [r, 0.5], [r, h], [r * 0.82, h + 0.35], [0, h + 0.35]], 'z', true);
  }
  /* a small button on a top surface */
  function topButton(x, y, z, r, h = 1.1) {
    turned(x, y, z, [[0, 0], [r, 0], [r, h], [r * 0.8, h + 0.3], [0, h + 0.3]], 'y');
  }
  function circle(x, y, z, r, n = 26) {
    const pts = [];
    for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; pts.push([x + Math.cos(t) * r, y + Math.sin(t) * r, z]); }
    rigid(y, z, () => poly(pts));
  }
  function circleFlat(x, y, z, r) {
    const pts = [];
    for (let i = 0; i < 20; i++) { const t = i / 20 * Math.PI * 2; pts.push([x + Math.cos(t) * r, y, z + Math.sin(t) * r]); }
    rigid(y, z, () => poly(pts));
  }
  function circleSide(x, y, z, r) {
    const pts = [];
    for (let i = 0; i < 16; i++) { const t = i / 16 * Math.PI * 2; pts.push([x, y + Math.cos(t) * r, z + Math.sin(t) * r]); }
    poly(pts);
  }
  function box(x, y, z, w, h, d, rx = 0, ry = 0, rz = 0) { solid(new BoxGeometry(w, h, d), x, y, z, rx, ry, rz); }

  /* ---------- lettering and icons, drawn as thin lines laid onto a surface ----------
     A stroke is a list of [u, v] points. For letters v runs from 0 to 1, the height of a capital. `ink` places
     strokes on a surface (`engrave`): O is a point on it, R the direction the text reads, U the direction up the text, and
     s a size in mm. Every mark sits a fraction of a millimetre above its surface, so it is never buried. */
  const TAU = Math.PI * 2;
  const arc = (cx, cy, rx, ry, a0, a1, n = 18) => {
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
    return pts;
  };
  const GLYPH = {
    A: [[[0, 0], [0.3, 1], [0.6, 0]], [[0.12, 0.35], [0.48, 0.35]]],
    D: [[[0, 0], [0, 1], [0.3, 1], [0.5, 0.85], [0.6, 0.5], [0.5, 0.15], [0.3, 0], [0, 0]]],
    E: [[[0.55, 1], [0, 1], [0, 0], [0.55, 0]], [[0, 0.5], [0.4, 0.5]]],
    F: [[[0.55, 1], [0, 1], [0, 0]], [[0, 0.5], [0.4, 0.5]]],
    I: [[[0.15, 0], [0.15, 1]]],
    J: [[[0.15, 0], [0.15, 1]], [[0, 1], [0.3, 1]], [[0, 0], [0.3, 0]]],   /* an I with serifs, for the Roman numerals */
    K: [[[0, 0], [0, 1]], [[0.55, 1], [0, 0.4]], [[0.15, 0.55], [0.55, 0]]],
    M: [[[0, 0], [0, 1], [0.3, 0.4], [0.6, 1], [0.6, 0]]],
    N: [[[0, 0], [0, 1], [0.6, 0], [0.6, 1]]],
    O: [arc(0.3, 0.5, 0.3, 0.5, 0, TAU, 20)],
    P: [[[0, 0], [0, 1], [0.35, 1], [0.55, 0.9], [0.6, 0.72], [0.55, 0.55], [0.35, 0.45], [0, 0.45]]],
    S: [[[0.58, 0.85], [0.45, 0.98], [0.2, 1], [0.03, 0.88], [0.03, 0.68], [0.2, 0.52], [0.4, 0.45], [0.58, 0.32], [0.58, 0.12], [0.4, 0], [0.15, 0.02], [0.02, 0.15]]],
    U: [[[0, 1], [0, 0.25], [0.12, 0.04], [0.3, 0], [0.48, 0.04], [0.6, 0.25], [0.6, 1]]],
    Z: [[[0, 1], [0.6, 1], [0, 0], [0.6, 0]]],
    n: [[[0, 0], [0, 0.6]], [[0, 0.45], [0.15, 0.58], [0.3, 0.6], [0.45, 0.5], [0.45, 0]]],
    i: [[[0.1, 0], [0.1, 0.58]], arc(0.1, 0.82, 0.035, 0.035, 0, TAU, 6)],
    1: [[[0.05, 0.8], [0.25, 1], [0.25, 0]], [[0.05, 0], [0.45, 0]]],
    2: [[[0.02, 0.8], [0.12, 0.95], [0.3, 1], [0.48, 0.95], [0.58, 0.78], [0.5, 0.58], [0, 0], [0.6, 0]]],
    3: [[[0.02, 0.9], [0.2, 1], [0.45, 1], [0.58, 0.85], [0.45, 0.58], [0.25, 0.52], [0.45, 0.48], [0.6, 0.3], [0.5, 0.08], [0.3, 0], [0.08, 0.05], [0, 0.15]]],
    6: [[[0.5, 0.95], [0.3, 1], [0.1, 0.9], [0.02, 0.6], [0.02, 0.3], [0.1, 0.08], [0.3, 0], [0.5, 0.08], [0.58, 0.28], [0.5, 0.48], [0.3, 0.55], [0.1, 0.48], [0.02, 0.35]]],
    '-': [[[0.05, 0.5], [0.45, 0.5]]]
  };
  const NARROW = { I: 0.3, J: 0.3, i: 0.2, 1: 0.5, '-': 0.5, n: 0.45 };
  const advance = (c) => (NARROW[c] === undefined ? 0.6 : NARROW[c]) + 0.2;
  function engrave(strokes, O, R, U, s) {
    const at = (p) => [O[0] + (R[0] * p[0] + U[0] * p[1]) * s, O[1] + (R[1] * p[0] + U[1] * p[1]) * s, O[2] + (R[2] * p[0] + U[2] * p[1]) * s];
    strokes.forEach((st) => { for (let i = 0; i < st.length - 1; i++) seg(at(st[i]), at(st[i + 1])); });
  }
  /* a line of text centred on O, capitals h mm tall */
  function word(str, O, R, U, h) {
    let w = -0.2;
    for (const c of str) w += advance(c);
    let x = -w / 2;
    for (const c of str) {
      if (GLYPH[c]) engrave(GLYPH[c], [O[0] + (R[0] * x - U[0] * 0.5) * h, O[1] + (R[1] * x - U[1] * 0.5) * h, O[2] + (R[2] * x - U[2] * 0.5) * h], R, U, h);
      x += advance(c);
    }
  }
  /* icons, each inside a box from -1 to 1 */
  const lens = [arc(-0.15, 0.2, 0.55, 0.55, 0, TAU, 20), [[0.24, -0.2], [0.8, -0.8]]];
  const ICON = {
    trash: [[[-0.65, 0.45], [0.65, 0.45]], [[-0.22, 0.45], [-0.22, 0.7], [0.22, 0.7], [0.22, 0.45]], [[-0.5, 0.4], [-0.38, -0.7], [0.38, -0.7], [0.5, 0.4]], [[-0.15, 0.25], [-0.15, -0.5]], [[0.15, 0.25], [0.15, -0.5]]],
    frames: [[[-0.7, -0.5], [-0.7, 0.45], [0.25, 0.45], [0.25, -0.5], [-0.7, -0.5]], [[-0.3, 0.45], [-0.3, 0.8], [0.65, 0.8], [0.65, -0.15], [0.25, -0.15]]],
    play: [[[-0.85, -0.55], [-0.85, 0.55], [0.85, 0.55], [0.85, -0.55], [-0.85, -0.55]], [[-0.25, -0.3], [0.35, 0], [-0.25, 0.3], [-0.25, -0.3]]],
    zoomIn: lens.concat([[[-0.4, 0.2], [0.1, 0.2]], [[-0.15, -0.05], [-0.15, 0.45]]]),
    zoomOut: lens.concat([[[-0.4, 0.2], [0.1, 0.2]]]),
    key: [arc(-0.5, 0, 0.3, 0.3, 0, TAU, 14), [[-0.2, 0], [0.85, 0]], [[0.4, 0], [0.4, -0.35]], [[0.7, 0], [0.7, -0.35]]],
    camera: [[[-0.85, -0.5], [-0.85, 0.4], [-0.35, 0.4], [-0.2, 0.7], [0.2, 0.7], [0.35, 0.4], [0.85, 0.4], [0.85, -0.5], [-0.85, -0.5]], arc(0, -0.05, 0.3, 0.3, 0, TAU, 12)],
    video: [[[-0.85, -0.5], [-0.85, 0.5], [0.3, 0.5], [0.3, -0.5], [-0.85, -0.5]], [[0.3, 0.12], [0.85, 0.5], [0.85, -0.5], [0.3, -0.12]]],
    record: [arc(0, 0, 0.9, 0.9, 0, TAU, 20), arc(0, 0, 0.45, 0.45, 0, TAU, 14)],
    expo: [[[-0.85, -0.85], [-0.85, 0.85], [0.85, 0.85], [0.85, -0.85], [-0.85, -0.85]], [[-0.55, -0.55], [0.55, 0.55]], [[-0.62, 0.3], [-0.28, 0.3]], [[-0.45, 0.13], [-0.45, 0.47]], [[0.28, -0.3], [0.62, -0.3]]]
  };
  /* the Nikon wordmark: bold outlined letters, stretched wide and leaning slightly, as on the real camera */
  function nikonMark(O, R, U, h) {
    const letters = [
      [0, [[0, 0], [0.18, 0], [0.18, 0.6], [0.6, 0], [0.8, 0], [0.8, 1], [0.62, 1], [0.62, 0.4], [0.2, 1], [0, 1], [0, 0]]],
      [0.9, [[0, 0], [0.17, 0], [0.17, 0.7], [0, 0.7], [0, 0]]],
      [0.9, [[0, 0.82], [0.17, 0.82], [0.17, 1], [0, 1], [0, 0.82]]],
      [1.17, [[0, 0], [0.17, 0], [0.17, 1], [0, 1], [0, 0]]],
      [1.17, [[0.17, 0.3], [0.5, 0.7], [0.74, 0.7], [0.4, 0.32], [0.78, 0], [0.54, 0], [0.17, 0.24], [0.17, 0.3]]],
      [2.05, arc(0.38, 0.35, 0.38, 0.37, 0, TAU, 24)],
      [2.05, arc(0.38, 0.35, 0.2, 0.2, 0, TAU, 16)],
      [2.91, [[0, 0], [0.17, 0], [0.17, 0.4], [0.2, 0.5], [0.28, 0.56], [0.38, 0.58], [0.48, 0.54], [0.52, 0.44], [0.52, 0], [0.69, 0], [0.69, 0.46], [0.64, 0.6], [0.54, 0.69], [0.4, 0.72], [0.27, 0.69], [0.17, 0.62], [0.17, 0.7], [0, 0.7], [0, 0]]]
    ];
    const SX = 1.45, LEAN = 0.2, W = 3.6 * SX + LEAN;
    letters.forEach(([x0, pts]) => engrave([pts.map(([x, y]) => [(x0 + x) * SX + LEAN * y - W / 2, y - 0.5])], O, R, U, h));
  }

  /* ---------- where things are ---------- */
  /* from the front photo and the back photo (pixels) to model millimetres */
  const fx = (u) => (u - 405) * 0.2413, fy = (v) => -50.75 + (563 - v) * 0.255;
  const bx = (u) => -(u - 395) * 0.243, by = (v) => -50.75 + (560 - v) * 0.255;
  const tx = (u) => -(u - 400) * 0.30;                    /* from the top photo */
  const ZF = 10, ZB = -31, ZM = -37, ZG = 37, ZE = -52;   /* body front, body back, monitor, grip, eyecup */
  const MX = fx(468), MY = fy(397);                       /* centre of the lens mount */
  const HX = fx(468);                                     /* centre of the viewfinder hump */

  /* ---------- body ---------- */
  /* as on the real camera (Nikon's top and side photos): at the back corner a lower shoulder holds the main dial; in
     front of it one flat plate carries the top display and the model name right across to the grip's edge; then the
     plate rises in a gentle slope to the grip's raised head, which carries the shutter and buttons. Only true edges
     get lines, so no seams show between the parts */
  const DECK = fy(250), HEAD = 33.1, SHOULDER = 23.5, ZSH = -12;
  function bodyOutline(edge, H = HEAD) {
    const s = new Shape();
    s.moveTo(fx(150), fy(563));
    s.lineTo(fx(250), fy(563)); s.lineTo(fx(262), fy(560));
    s.lineTo(fx(652), fy(560)); s.quadraticCurveTo(fx(672), fy(558), fx(672), fy(530));
    s.lineTo(fx(672), fy(280)); s.quadraticCurveTo(fx(672), DECK, fx(642), DECK);
    s.lineTo(fx(edge), DECK); s.quadraticCurveTo(fx(edge - 6), H, fx(edge - 34), H);
    s.lineTo(fx(180), H); s.quadraticCurveTo(fx(140), H - 1.5, fx(135), fy(280));
    s.lineTo(fx(133), fy(535)); s.quadraticCurveTo(fx(133), fy(563), fx(150), fy(563));
    return s;
  }
  function rearOutline() {
    const s = new Shape();
    s.moveTo(fx(150), fy(563));
    s.lineTo(fx(250), fy(563)); s.lineTo(fx(262), fy(560));
    s.lineTo(fx(652), fy(560)); s.quadraticCurveTo(fx(672), fy(558), fx(672), fy(530));
    s.lineTo(fx(672), fy(280)); s.quadraticCurveTo(fx(672), DECK, fx(642), DECK);
    s.lineTo(-44, DECK); s.lineTo(-48, SHOULDER); s.lineTo(-60, SHOULDER); s.quadraticCurveTo(-65.6, SHOULDER - 0.5, -65.6, 14);
    s.lineTo(fx(133), fy(535)); s.quadraticCurveTo(fx(133), fy(563), fx(150), fy(563));
    return s;
  }
  const outlinePts = (s, z, n = 6) => s.getPoints(n).map((p) => [p.x, p.y, z]);
  slab(rearOutline(), ZB, ZSH, 0, null);
  /* the plate and its slope up to the grip's head */
  loft([[ZSH, DECK + 0.02], [-6.5, DECK + 0.3], [-4.5, DECK + 1.1], [-2.5, DECK + 2.4], [-1, HEAD - 0.5], [0, HEAD]]
    .map(([z, H]) => ({ z, pts: ordered(bodyOutline(262, H), 6) })), null);
  const frontPlate = bodyOutline(296);
  frontPlate.holes.push(new Path().absellipse(MX, MY, 27.5, 27.5 / SQ, 0, Math.PI * 2, true));   /* round once scaled */
  slab(frontPlate, 0, ZF, 0, null);
  poly(outlinePts(rearOutline(), ZB));
  const frontEdge = new Path();
  frontEdge.moveTo(fx(262), fy(560));
  frontEdge.lineTo(fx(652), fy(560)); frontEdge.quadraticCurveTo(fx(672), fy(558), fx(672), fy(530));
  frontEdge.lineTo(fx(672), fy(280)); frontEdge.quadraticCurveTo(fx(672), DECK, fx(642), DECK);
  frontEdge.lineTo(fx(296), DECK);
  poly(frontEdge.getPoints(6).map((p) => [p.x, p.y, ZF]), false);
  /* the dial's shoulder: its edges running front to back, and the step up to the plate in front of it */
  const shoulder = new Path();
  shoulder.moveTo(-44, DECK); shoulder.lineTo(-48, SHOULDER); shoulder.lineTo(-60, SHOULDER); shoulder.quadraticCurveTo(-65.6, SHOULDER - 0.5, -65.6, 14);
  poly(shoulder.getPoints(6).map((p) => [p.x, p.y, ZSH]), false);
  const plateEdge = new Path();
  plateEdge.moveTo(-44, DECK); plateEdge.lineTo(fx(180), DECK); plateEdge.quadraticCurveTo(fx(140), DECK - 1.5, fx(135), fy(280));
  poly(plateEdge.getPoints(6).map((p) => [p.x, p.y, ZSH]), false);
  seg([-44, DECK, ZB], [-44, DECK, ZSH]); seg([-48, SHOULDER, ZB], [-48, SHOULDER, ZSH]); seg([-60, SHOULDER, ZB], [-60, SHOULDER, ZSH]);
  const headFront = new Path();
  headFront.moveTo(fx(296), DECK); headFront.quadraticCurveTo(fx(290), HEAD, fx(262), HEAD);
  poly(headFront.getPoints(6).map((p) => [p.x, p.y, 0]), false);

  /* the grip, built as horizontal slices stacked from the base to the top. Seen from above (Nikon's top photo) it comes
     to a point at the front, set towards the lens: the outer side sweeps back in a long curve while the side facing the
     lens runs almost straight. PLAN is that outline, traced from the photo: [z, x of the side facing the lens, x of the
     outer side]. Higher up, the head is a dome that falls away to the front and the outer side; lower down, the hand grip
     is narrower on the side facing the lens, so the head overhangs it with a ledge below the sub-command dial */
  const lerpTable = (table, z) => {
    if (z <= table[0][0]) return table[0][1];
    for (let i = 1; i < table.length; i++) {
      if (z <= table[i][0]) { const a = table[i - 1], b = table[i]; return a[1] + (b[1] - a[1]) * (z - a[0]) / (b[0] - a[0]); }
    }
    return table[table.length - 1][1];
  };
  const PLAN = [[8, -26.4, -65.5], [10.3, -26.5, -65.4], [14.3, -27.2, -65.1], [18.2, -28.1, -64.5], [22.2, -29.2, -63.1],
    [26.1, -30.7, -61.1], [28.1, -31.7, -59.6], [30.1, -33, -57.5], [31.6, -34.3, -55.3], [32.6, -35.5, -53.4],
    [33.6, -36.9, -51], [34.4, -38.6, -48.4], [35, -40.6, -46.4]];
  const TIP = [35.4, -43.4], GRIP_BACK = 8;
  /* how far forward the grip reaches at each height: the dome falls away near the top */
  const REACH = [[-50.75, 32.5], [-50.2, 34], [-49, 34.9], [-47, 35.3], [-45, 35.4], [24, 35.4], [26.6, 33.2], [28.3, 30.4], [29.6, 26.6], [30.6, 23.5], [31.4, 20.5], [32.4, 15], [33.1, 10]];
  /* how far in from the plan each side is at each height: rounding at the base and over the dome */
  const IN_OUTER = [[-50.75, 3.5], [-50.2, 2], [-49, 0.8], [-47, 0.2], [-45, 0], [21, 0], [26, 1.3], [29, 3.6], [31, 6.4], [32.3, 9.4], [33.1, 13]];
  const IN_LENS = [[-50.75, 2.5], [-50.2, 1.4], [-49, 0.5], [-47, 0], [30, 0], [31.5, 1.2], [32.5, 3], [33.1, 5.5]];
  /* below the head the side facing the lens steps back to here; the head overhangs it */
  const NECK = [[-60, -35.6], [11.6, -35.6], [13.4, -26]];
  /* height of the grip's top at a point on its centre line, for seating the shutter and buttons */
  const gripTop = (z) => lerpTable(REACH.slice(5).map(([y, r]) => [r, y]).reverse(), z);
  function gripSlice(y) {
    const reach = lerpTable(REACH, y), k = (reach - GRIP_BACK) / (TIP[0] - GRIP_BACK);
    const io = lerpTable(IN_OUTER, y), il = lerpTable(IN_LENS, y), neck = lerpTable(NECK, y);
    const Z = (z) => GRIP_BACK + (z - GRIP_BACK) * k;
    /* each traced row, moved in where this height is narrower; the two sides never cross */
    const rows = PLAN.map(([z, xl, xo]) => {
      let a = xo + io, b = Math.min(xl, neck) - il;
      if (b - a < 0.8) { const m = (a + b) / 2; a = m - 0.4; b = m + 0.4; }
      return [Z(z), a, b];
    });
    const last = rows[rows.length - 1], tipX = Math.min(Math.max(TIP[1] + (io - il) * 0.15, last[1] + 0.2), last[2] - 0.2);
    /* the outer side from the back to the tip, then the side facing the lens from the tip back */
    const pts = rows.map(([z, a]) => new Vector2(a, z));
    pts.push(new Vector2(tipX, Z(TIP[0])));
    for (let i = rows.length - 1; i >= 0; i--) pts.push(new Vector2(rows[i][2], rows[i][0]));
    return { z: y, pts };
  }
  const gripTris = loft([-50.75, -50.2, -49.4, -48.4, -47, -45, -30, -10, 6, 11.6, 12.5, 13.4, 14.5, 18, 21, 24, 26, 27.6, 29, 30.1,
    30.9, 31.6, 32.2, 32.7, 33.1].map(gripSlice), null, true);
  /* lines drawn on the grip's curved surface: where the metal head meets the leatherette, the red stripe, the dial's slot, and the join with the body */
  contour(gripTris, 0, 1, 0.2, 20.3, (p) => p.z > 10.5);
  contour(gripTris, 0, 1, 0.2, 21, (p) => p.x < -60 && p.z > 11 && p.z < 30);
  contour(gripTris, 0, 1, 0, 21.2, (p) => p.z > 28 && Math.abs(p.x + 44.6) < 10.5);
  contour(gripTris, 0, 1, 0, 14.8, (p) => p.z > 28 && Math.abs(p.x + 44.6) < 10.5);
  contour(gripTris, 0, 0, 1, 10.25, (p) => p.x > -45 && p.y < 31);

  /* ---------- viewfinder hump ---------- */
  /* from the front it tapers to the top; from above it widens towards the back. Its lower edge sweeps around the mount */
  const HUMP_TOP = 47.6;
  function humpSection(z, topY, halfBase, halfTop) {
    const s = new Shape(), r = 3.5, R = 36 / SQ, yb = MY + Math.sqrt(R * R - halfBase * halfBase), mid = MY + R;
    s.moveTo(HX - halfBase, yb); s.quadraticCurveTo(HX, 2 * mid - yb, HX + halfBase, yb);
    s.lineTo(HX + halfTop + 1, topY - r); s.quadraticCurveTo(HX + halfTop, topY, HX + halfTop - r, topY);
    s.lineTo(HX - halfTop + r, topY); s.quadraticCurveTo(HX - halfTop, topY, HX - halfTop - 1, topY - r);
    s.lineTo(HX - halfBase, yb);
    return { z, pts: ordered(s, 8) };
  }
  loft([
    humpSection(ZF + 3.6, 34, 26, 23.5),
    humpSection(ZF, 38.1, 25.8, 20.5),
    humpSection(7, 41.6, 25.5, 18),
    humpSection(1.7, HUMP_TOP, 25, 13.5),
    humpSection(-8, HUMP_TOP, 24.5, 14.5),
    humpSection(-20, HUMP_TOP, 24, 16.5),
    humpSection(ZB + 0.3, HUMP_TOP - 0.5, 23.5, 17)
  ], 30);

  /* accessory shoe, on top of the hump */
  const SHOE_Z = -17, SHOE_Y = HUMP_TOP;
  box(HX, SHOE_Y + 0.35, SHOE_Z, 21, 0.7, 20);
  box(HX - 8.9, SHOE_Y + 1.9, SHOE_Z, 3.2, 2.4, 18.5);    /* rails */
  box(HX + 8.9, SHOE_Y + 1.9, SHOE_Z, 3.2, 2.4, 18.5);
  box(HX - 9.6, SHOE_Y + 3.3, SHOE_Z, 4.6, 0.5, 18.5);
  box(HX + 9.6, SHOE_Y + 3.3, SHOE_Z, 4.6, 0.5, 18.5);
  [[-2.6, 3], [2.6, 3], [0, -2.6], [-3.4, -4], [3.4, -4]].forEach(([dx, dz]) => circleFlat(HX + dx, SHOE_Y + 0.72, SHOE_Z + dz, 0.9));

  /* diopter wheel on one side of the hump, monitor-mode button on the other */
  turned(HX - 20.5, 32, -27, [[0, 0], [4.6, 0], [4.6, 4.2], [3.8, 4.8], [0, 4.8]], 'x', true);
  ridges(HX - 20.5 - 4.2, 32, -27, 4.6, 4.2, 26, 'x');
  turned(HX + 18.2, 41, -25, [[0, 0], [3.4, 0], [3.4, 1], [2.6, 1.4], [0, 1.4]], 'x', false);

  /* ---------- lens mount ---------- */
  const atMount = (fn) => rigid(MY, ZF, fn);
  function ring(r0, r1, z0, z1) {
    const s = new Shape();
    s.absarc(MX, MY, r1, 0, Math.PI * 2, false);
    s.holes.push(new Path().absarc(MX, MY, r0, 0, Math.PI * 2, true));
    atMount(() => slab(s, z0, z1));
  }
  ring(32.2, 35, ZF, ZF + 2.2);          /* black collar */
  ring(27.5, 32.2, ZF, ZF + 3.6);        /* polished bayonet ring */
  /* its four screws, with slots */
  atMount(() => [45, 135, 225, 315].forEach((deg) => {
    const a = deg * Math.PI / 180, x = MX + Math.cos(a) * 29.9, y = MY + Math.sin(a) * 29.9, z = ZF + 3.62;
    circle(x, y, z, 1.5, 16);
    seg([x - Math.cos(a + 0.8) * 1.1, y - Math.sin(a + 0.8) * 1.1, z], [x + Math.cos(a + 0.8) * 1.1, y + Math.sin(a + 0.8) * 1.1, z]);
  }));
  /* bayonet tabs inside the throat */
  [[0.25, 1.15], [2.0, 2.95], [3.75, 5.35]].forEach(([a, b]) => {
    const tab = new Shape();
    tab.absarc(MX, MY, 27.5, a, b, false);
    tab.absarc(MX, MY, 25.2, b, a, true);
    atMount(() => slab(tab, ZF - 3.4, ZF - 1.6));
  });
  /* the 11 electrical contacts, along the top of the throat */
  const contacts = new Shape();
  contacts.absarc(MX, MY, 25.2, Math.PI / 2 - 0.68, Math.PI / 2 + 0.68, false);
  contacts.absarc(MX, MY, 22.2, Math.PI / 2 + 0.68, Math.PI / 2 - 0.68, true);
  atMount(() => {
    slab(contacts, ZF - 7, ZF - 6.5);
    for (let i = 0; i < 11; i++) {
      const a = Math.PI / 2 + (i - 5) * 0.105;
      circle(MX + Math.cos(a) * 23.7, MY + Math.sin(a) * 23.7, ZF - 6.48, 0.65, 10);
    }
  });
  /* the sensor, with its housing behind the throat */
  box(MX, MY, 0.05, 47, 34, 0.5);
  box(MX, MY, 0.4, 40.5, 28.5, 0.4);
  box(MX, MY, 0.75, 35.9, 23.9, 0.3);
  /* index mark on the collar */
  atMount(() => circle(fx(559), fy(284), ZF + 2.23, 0.9, 12));

  /* ---------- front of the body ---------- */
  /* the raised strip that carries the two function buttons, hugging the mount */
  const strip = new Shape();
  strip.absarc(MX, MY, 40.5, Math.PI * 0.76, Math.PI * 1.27, false);
  strip.absarc(MX, MY, 35, Math.PI * 1.27, Math.PI * 0.76, true);
  atMount(() => slab(strip, ZF, ZF + 1.2));
  /* Fn1 and Fn2: tall rounded keys, following the curve of the mount */
  function fnKey(u, v, deg, w = 6.4, h = 11.5) {
    const k = rrect(-w / 2, -h / 2, w / 2, h / 2, 2.4);
    const geo = new ExtrudeGeometry(k, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelOffset: -0.5, bevelSegments: 1, curveSegments: 10 });
    const inner = rrect(-w / 2 + 1.1, -h / 2 + 1.1, w / 2 - 1.1, h / 2 - 1.1, 1.5).getSpacedPoints(30).slice(0, 30);
    const a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    atMount(() => {
      solid(geo, fx(u), fy(v), ZF + 1.1, 0, 0, deg * Math.PI / 180);
      poly(inner.map((p) => [fx(u) + p.x * ca - p.y * sa, fy(v) + p.x * sa + p.y * ca, ZF + 3.22]));
    });
  }
  fnKey(311, 386, 0);
  fnKey(331, 472, 28);
  /* lens release */
  fnKey(620, 397, 0, 5.6, 13);
  /* Z badge, moulded into the right shoulder */
  const zx = fx(632), zy = fy(316), zw = 3.2, zh = 2.4, zf = ZF + 0.03;
  poly([[zx - zw, zy + zh, zf], [zx + zw, zy + zh, zf], [zx - zw + 1.5, zy - zh + 0.8, zf], [zx + zw - 0.2, zy - zh + 0.8, zf], [zx + zw - 0.8, zy - zh, zf], [zx - zw - 0.8, zy - zh, zf], [zx + zw - 2.2, zy + zh - 0.9, zf], [zx - zw + 0.6, zy + zh - 0.9, zf]]);
  /* the Nikon wordmark, on the sloped front of the viewfinder hump. The slope climbs 0.755 mm for every mm along it
     and falls back 0.657 mm, so the lettering lies in that plane, a hair above the surface */
  const SLOPE_UP = [0, 0.755, -0.657], SLOPE_OUT = [0, 0.657, 0.755];
  nikonMark([HX + SLOPE_OUT[0] * 0.14, 38.1 + 0.755 * 4 + SLOPE_OUT[1] * 0.14, 10 - 0.657 * 4 + SLOPE_OUT[2] * 0.14], [1, 0, 0], SLOPE_UP, 4.6);
  /* Fn1 and Fn2, printed on the body beside their keys */
  atMount(() => {
    word('Fn1', [fx(312), fy(413), ZF + 1.24], [1, 0, 0], [0, 1, 0], 1.7);
    word('Fn2', [fx(321), fy(441), ZF + 1.24], [1, 0, 0], [0, 1, 0], 1.7);
  });
  /* round cover on the right shoulder */
  turned(fx(634), fy(277), ZF, [[0, 0], [3.2, 0], [3.2, 0.5], [2.6, 0.7], [0, 0.7]], 'z');
  /* panel seams, where the body's covering meets the metal top and base */
  poly([[fx(297), fy(296), ZF + 0.03], [fx(345), fy(296), ZF + 0.03]], false);
  poly([[fx(590), fy(296), ZF + 0.03], [fx(672), fy(296), ZF + 0.03]], false);
  poly([[fx(262), fy(548), ZF + 0.03], [fx(672), fy(548), ZF + 0.03]], false);

  /* ---------- top of the grip ---------- */
  /* shutter release in its power-switch collar, near the front of the grip and tilted to follow its slope */
  const SX_ = -44.6, SZ_ = 25.5, SY_ = gripTop(SZ_) - 0.9, TILT = 0.26;
  rigid(SY_, SZ_, () => {
    solid(new LatheGeometry([[0, 0], [8.3, 0], [8.3, 1.8], [7.5, 2.4], [5, 2.4], [0, 2.4]].map(([r, h]) => new Vector2(r, h)), 56), SX_, SY_, SZ_, TILT, 0, 0, 30);
    solid(new LatheGeometry([[0, 0], [4.8, 0], [4.8, 1.2], [4.1, 2.5], [2.2, 2.8], [0, 2.8]].map(([r, h]) => new Vector2(r, h)), 40), SX_, SY_ + 0.9, SZ_ + 0.24, TILT, 0, 0, 30);
    /* the power switch lever, sticking out at the front of the collar */
    box(SX_ - 1.2, SY_ + 0.2, SZ_ + 8.6, 4.2, 1.8, 3.6, TILT, 0, 0);
  });
  /* the sub-command dial, set into the front of the grip: a wide drum that only just breaks the surface */
  const drum = new CylinderGeometry(9.6, 9.6, 5.6, 64);
  drum.scale(1, 1, 0.47);
  rigid(18, 32.1, () => {
    solid(drum, -44.6, 18, 32.1, 0, 0, 0, 40);
    for (let i = 0; i <= 46; i++) {
      const t = -0.15 + (Math.PI + 0.3) * i / 46, x = -44.6 + Math.cos(t) * 9.63, z = 32.1 + Math.sin(t) * 4.53;
      seg([x, 15.2, z], [x, 20.8, z]);
    }
  });
  /* record, ISO and exposure buttons, in an arc behind the shutter. Each label is placed with its button */
  const RY = gripTop(12.2) - 0.4;
  rigid(RY, 12.2, () => { topButton(-35.1, RY, 12.2, 2.8); engrave(ICON.record, [-35.1, RY + 1.44, 12.2], [-1, 0, 0], [0, 0, 1], 1.5); });
  rigid(HEAD - 0.2, 7.5, () => { topButton(-55.1, HEAD - 0.2, 7.5, 2.6); engrave(ICON.expo, [-55.1, HEAD + 1.24, 7.5], [-1, 0, 0], [0, 0, 1], 1.35); });
  rigid(HEAD - 0.2, 8.1, () => { topButton(-45.1, HEAD - 0.2, 8.1, 2.6); word('ISO', [-45.1, HEAD + 1.24, 8.1], [-1, 0, 0], [0, 0, 1], 1.15); });
  /* OFF and ON, printed on the power-switch collar behind the shutter. The collar tilts forward by TILT */
  const collarU = [0, -Math.sin(TILT), Math.cos(TILT)];
  rigid(SY_, SZ_, () => [['OFF', 4.6], ['ON', -2.8]].forEach(([t, dx]) => {
    const dz = -6.3;
    word(t, [SX_ + dx, SY_ + 2.4 - Math.tan(TILT) * dz + 0.18, SZ_ + dz], [-1, 0, 0], collarU, 1.0);
  }));
  /* the model name, on the grip's top surface behind the exposure button */
  word('Z6III', [-52, DECK + 0.62, -6.6], [-1, 0, 0], [0, 0, 1], 2.6);
  /* top display, on the deck between the hump and the grip */
  const LX0 = -34, LX1 = -11.7, LZ0 = -1, LZ1 = -23;
  box((LX0 + LX1) / 2, DECK + 0.25, (LZ0 + LZ1) / 2, LX1 - LX0 + 1.2, 0.5, LZ0 - LZ1 + 1.2);
  box((LX0 + LX1) / 2, DECK + 0.55, (LZ0 + LZ1) / 2, LX1 - LX0 - 1, 0.3, LZ0 - LZ1 - 1);
  /* rear main command dial, standing on the shoulder above the thumb */
  turned(bx(620), SHOULDER - 0.5, -22.5, [[0, 0], [9.5, 0], [9.5, 6], [8.8, 6.5], [0, 6.5]], 'y');
  ridges(bx(620), SHOULDER - 0.5, -22.5, 9.5, 6, 58, 'y');

  /* ---------- top of the right shoulder: mode dial ---------- */
  const DX = fx(600), DY = DECK, DZ = -9;
  turned(DX, DY, DZ, [[0, 0], [14.2, 0], [14.2, 0.8], [13, 0.8], [13, 6.4], [12.2, 7], [6.2, 7], [6.2, 7.4], [5.6, 7.8], [0, 7.8]], 'y', false, 72);
  ridges(DX, DY + 0.8, DZ, 13, 5.6, 80, 'y');
  /* the modes, printed around the dial's top with each label's top pointing outwards */
  /* angles in degrees around the dial, as in Nikon's top photo: P towards the back on the shoulder side, AUTO towards the hump */
  rigid(DY, DZ, () => [['P', -45], ['S', -90], ['A', -135], ['M', 180], ['U3', 135], ['U2', 90], ['U1', 45]].forEach(([t, deg]) => {
    const a = deg * Math.PI / 180, dx = Math.cos(a), dz = Math.sin(a);
    word(t, [DX + dx * 9.3, DY + 7.04, DZ + dz * 9.3], [-dz, 0, dx], [dx, 0, dz], 1.9);
  }));
  rigid(DY, DZ, () => engrave([[[-0.7, -0.7], [-0.7, 0.7], [0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]], arc(0, 0, 0.35, 0.35, 0, TAU, 10)], [DX + 9.3, DY + 7.04, DZ], [-1, 0, 0], [0, 0, 1], 1.2));   /* the green AUTO mark */

  /* ---------- back: viewfinder and eyecup ---------- */
  /* the eyecup's outline, as seen from behind: narrow at the top, widest low down */
  function cupOutline(g) {
    const pts = [[268, 178], [398, 178], [404, 200], [420, 245], [420, 285], [398, 308], [268, 308], [245, 285], [245, 245], [262, 200]];
    const s = new Shape();
    const P = (i) => { const p = pts[i % pts.length], cu = 332, cv = 240; return new Vector2(bx(p[0] + (p[0] - cu) * g), by(p[1] + (p[1] - cv) * g)); };
    const mid = (a, b) => new Vector2((a.x + b.x) / 2, (a.y + b.y) / 2);
    const start = mid(P(pts.length - 1), P(0));
    s.moveTo(start.x, start.y);
    for (let i = 0; i < pts.length; i++) { const c = P(i), e = mid(c, P(i + 1)); s.quadraticCurveTo(c.x, c.y, e.x, e.y); }
    return s;
  }
  const cup = (z, g) => ({ z, pts: ordered(cupOutline(g)) });
  loft([cup(ZB, -0.2), cup(-37, -0.14), cup(-44, -0.02), cup(ZE + 2.2, 0)], null);
  /* the eyecup's opening */
  const lip = cupOutline(0);
  lip.holes.push(new Path(rrect(bx(372), by(282), bx(296), by(222), 3.2).getPoints(10).reverse()));
  slab(lip, ZE, ZE + 2.2);
  /* the eyepiece, set back inside */
  const eye = rrect(bx(372), by(282), bx(296), by(222), 3.2);
  eye.holes.push(new Path(rrect(bx(362), by(274), bx(306), by(230), 2).getPoints(10).reverse()));
  slab(eye, ZE + 6, ZE + 7);
  slab(rrect(bx(362), by(274), bx(306), by(230), 2), ZE + 8.5, ZE + 9);
  /* eye sensors, above the opening */
  poly([[bx(346), by(214), ZE - 0.02], [bx(318), by(214), ZE - 0.02], [bx(318), by(205), ZE - 0.02], [bx(346), by(205), ZE - 0.02]]);

  /* ---------- back: vari-angle monitor ---------- */
  slab(rrect(bx(498), by(547), bx(160), by(318), 3.2), ZM, ZB, 1);
  poly([[bx(175), by(345), ZM - 0.02], [bx(478), by(345), ZM - 0.02], [bx(478), by(523), ZM - 0.02], [bx(175), by(523), ZM - 0.02]]);
  /* the tab for pulling the screen out */
  slab(rrect(bx(520), by(465), bx(494), by(395), 2.4), -35.5, ZB, 0.6);
  /* the hinge block beside the screen */
  slab(rrect(bx(160), by(540), bx(123), by(348), 2.2), -33.5, ZB, 0.6);
  poly([[bx(142), by(346), -33.52], [bx(142), by(542), -33.52]], false);

  /* ---------- back: controls ---------- */
  /* playback lock and delete, grouped in a shallow pill */
  slab(rrect(bx(232), by(297), bx(158), by(269), 3.4), ZB - 0.5, ZB, 0.15);
  backButton(bx(172), by(283), 2.9, ZB - 0.5, 1.2, 0.2);
  backButton(bx(215), by(283), 2.9, ZB - 0.5, 1.2, 0.2);
  /* DISP, with the photo/video selector around it */
  turned(bx(475), by(280), ZB, [[0, 0], [5.8, 0], [5.8, 1.6], [5, 2], [0, 2]], 'z', true);
  backButton(bx(475), by(280), 3.2, ZB - 2, 1, 0.2);
  box(bx(475) - 6.8, by(291), ZB - 1, 5.5, 3.4, 2, 0, 0, 0.2);
  /* AF-ON */
  backButton(bx(555), by(280), 3.4, ZB, 1.8, 1.2);
  /* sub-selector joystick */
  turned(bx(556), by(333), ZB, [[0, 0], [5.8, 0], [5.8, 0.6], [3.6, 0.6], [3.4, 2.4], [2.6, 3.2], [0, 3.4]], 'z', true);
  const JX = bx(556), JY = by(333), JZ = ZB - 3.42;
  rigid(JY, ZB, () => { seg([JX - 2.2, JY, JZ], [JX + 2.2, JY, JZ]); seg([JX, JY - 2.2, JZ], [JX, JY + 2.2, JZ]); });
  /* info button */
  backButton(bx(550), by(380), 2.9, ZB, 1.5, 0.5);
  /* multi selector, OK in the centre */
  turned(bx(568), by(436), ZB, [[0, 0], [9.6, 0], [9.6, 1.1], [8.6, 1.6], [4.8, 1.6], [4.8, 0.9], [0, 0.9]], 'z', true, 72);
  backButton(bx(568), by(436), 4.1, ZB - 0.9, 1.4, 0);
  rigid(by(436), ZB, () => { for (let i = 0; i < 4; i++) {
    const t = i * Math.PI / 2, r0 = 7.2, r1 = 8.2, x = bx(568), y = by(436), z = ZB - 1.62;
    seg([x + Math.cos(t - 0.14) * r0, y + Math.sin(t - 0.14) * r0, z], [x + Math.cos(t) * r1, y + Math.sin(t) * r1, z]);
    seg([x + Math.cos(t + 0.14) * r0, y + Math.sin(t + 0.14) * r0, z], [x + Math.cos(t) * r1, y + Math.sin(t) * r1, z]);
  } });
  /* zoom, menu and playback */
  backButton(bx(548), by(492), 2.9, ZB, 1.4, 0.5);
  backButton(bx(590), by(492), 3, ZB, 1.4, 0.5);
  backButton(bx(546), by(528), 2.9, ZB, 1.4, 0.5);
  backButton(bx(591), by(528), 3, ZB, 1.4, 0.5);
  /* card access light */
  circle(bx(575), by(382), ZB - 0.01, 0.8, 12);

  /* the rubber thumb rest, wrapping round the grip side, and the plate below it */
  function thumbOutline(g) {
    const pts = [[592, 310], [640, 297], [668, 300], [672, 400], [664, 500], [622, 503], [616, 440], [592, 365]];
    const P = (i) => { const p = pts[i % pts.length]; return new Vector2(bx(p[0] + (p[0] - 630) * g), by(p[1] + (p[1] - 400) * g)); };
    const mid = (a, b) => new Vector2((a.x + b.x) / 2, (a.y + b.y) / 2);
    const s = new Shape(), start = mid(P(pts.length - 1), P(0));
    s.moveTo(start.x, start.y);
    for (let i = 0; i < pts.length; i++) { const c = P(i), e = mid(c, P(i + 1)); s.quadraticCurveTo(c.x, c.y, e.x, e.y); }
    return s;
  }
  const thumb = (z, g) => ({ z, pts: ordered(thumbOutline(g), 6) });
  loft([thumb(ZB + 0.2, 0), thumb(-34, -0.02), thumb(-36, -0.1), thumb(-36.8, -0.25)], null);
  poly(outlinePts(thumbOutline(0), ZB - 0.03));
  poly(outlinePts(thumbOutline(-0.1), -36.03));
  slab(rrect(bx(666), by(555), bx(615), by(510), 3), -32.4, ZB, 0.5);

  /* ---------- back: the icons and names printed on the buttons, as on Nikon's photo ----------
     Seen from behind, text reads towards -x. Each mark sits just behind its button's cap. */
  const BR = [-1, 0, 0], BU = [0, 1, 0], mark = (z) => z - 0.05;
  const engraveB = (icon, O, s) => rigid(O[1], ZB, () => engrave(icon, O, BR, BU, s));
  const wordB = (t, O, h) => rigid(O[1], ZB, () => word(t, O, BR, BU, h));
  engraveB(ICON.frames, [bx(172), by(283), mark(ZB - 2.05)], 1.6);          /* release mode */
  engraveB(ICON.trash, [bx(215), by(283), mark(ZB - 2.05)], 1.6);           /* delete */
  engraveB(ICON.key, [bx(172), by(306), mark(ZB - 0.5)], 1.3);              /* protect, printed below the pair */
  engraveB(ICON.camera, [bx(444), by(266), mark(ZB)], 1.1);                 /* still / video, either side of DISP's lever */
  engraveB(ICON.video, [bx(444), by(298), mark(ZB)], 1.1);
  wordB('DISP', [bx(475), by(280), mark(ZB - 3.35)], 1.5);
  wordB('AF-ON', [bx(555), by(280), mark(ZB - 2.15)], 1.25);
  wordB('i', [bx(550), by(380), mark(ZB - 1.85)], 2.8);
  wordB('OK', [bx(568), by(436), mark(ZB - 2.65)], 1.9);
  engraveB(ICON.zoomIn, [bx(548), by(492), mark(ZB - 1.75)], 1.6);
  wordB('MENU', [bx(590), by(492), mark(ZB - 1.75)], 1.05);
  engraveB(ICON.zoomOut, [bx(546), by(528), mark(ZB - 1.75)], 1.6);
  engraveB(ICON.play, [bx(591), by(528), mark(ZB - 1.75)], 1.5);

  /* ---------- sides ---------- */
  /* strap lugs: a post with a ring */
  [fx(672), fx(133)].forEach((x, i) => {
    const y = i === 0 ? fy(268) : 19, dir = i === 0 ? 1 : -1;
    rigid(y, -8, () => {
      box(x + dir * 0.6, y, -8, 3.2, 5, 5);
      solid(new TorusGeometry(2.9, 0.65, 8, 26), x + dir * 3.6, y, -8, 0, Math.PI / 2, 0, 48);
    });
  });
  const door = (x, z0, z1, y0, y1, r = 2.2) => poly(rrect(z0, y0, z1, y1, r).getPoints(4).map((p) => [x, p.y, p.x]));
  /* port covers on the mode-dial side: microphone and headphone, then USB and HDMI */
  const SX = fx(672) + 0.06;
  door(SX, 4.7, -9.5, 15.5, -24);
  door(SX, -11.2, -28.6, 15.5, -24);
  circleSide(SX, 21, -19, 0.8);     /* charge lamp */
  /* the memory card door on the grip side, with its hinge line, and the panel below it */
  const GX = fx(133) - 0.06;
  door(GX, -16, 1.4, 13, -36);
  seg([GX, 13, -6.8], [GX, -36, -6.8]);
  seg([GX, -37.5, ZB], [GX, -37.5, -16]);
  circleSide(GX, -40, -1.5, 1);     /* a screw */
  /* base: battery door, tripod socket, seams */
  const BY = fy(560) - 0.06, BG = fy(563) - 0.06;
  circleFlat(MX, BY, -4, 5.6);
  circleFlat(MX, BY, -4, 3.2);
  poly([[fx(146), BG, 8], [fx(248), BG, 8], [fx(248), BG, -22], [fx(146), BG, -22]]);
  circleFlat(fx(168), BG, -18, 1.6);
  poly([[fx(420), BY, 7], [fx(560), BY, 7]], false);
  poly([[fx(420), BY, -24], [fx(560), BY, -24]], false);

  /* ---------- turning it into one drawing ---------- */
  const scene = new Scene(), model = new Group();
  scene.add(model);
  /* centre the camera on its real middle, including the eyecup */
  const offsetZ = (ZG + ZE) * SQ / -2;
  function shifted(list) {
    const out = new Float32Array(list.length);
    for (let i = 0; i < list.length; i += 3) { out[i] = list[i]; out[i + 1] = list[i + 1]; out[i + 2] = list[i + 2] + offsetZ; }
    return new Float32BufferAttribute(out, 3);
  }

  const solidGeo = new BufferGeometry();
  solidGeo.setAttribute('position', shifted(surface));
  solidGeo.setAttribute('hullN', new Float32BufferAttribute(normals, 3));
  const fill = new Mesh(solidGeo, new MeshBasicMaterial({ color: 0xffffff, polygonOffset: true, polygonOffsetFactor: 1.5, polygonOffsetUnits: 2 }));
  fill.frustumCulled = false;

  const hullMat = new ShaderMaterial({
    side: BackSide,
    uniforms: { res: { value: new Vector2(1, 1) }, width: { value: 0 }, ink: { value: new Vector3(0x11 / 255, 0x18 / 255, 0x27 / 255) } },
    vertexShader: 'attribute vec3 hullN; uniform vec2 res; uniform float width;'
      + 'void main(){ vec4 c=projectionMatrix*modelViewMatrix*vec4(position,1.0);'
      + 'vec3 n=normalize(normalMatrix*hullN); vec2 d=(projectionMatrix*vec4(n,0.0)).xy;'
      + 'float l=length(d); if(l>0.00001) d/=l; c.xy+=d*width*2.0*c.w/res; c.z+=0.00002*c.w; gl_Position=c; }',
    fragmentShader: 'uniform vec3 ink; void main(){ gl_FragColor=vec4(ink,1.0); }'
  });
  const hull = new Mesh(solidGeo, hullMat);
  hull.frustumCulled = false;

  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute('position', shifted(lines));
  const ink = new LineSegments(lineGeo, new LineBasicMaterial({ color: 0x111827 }));
  ink.frustumCulled = false;
  const totalLines = lines.length / 3;
  lineGeo.setDrawRange(0, reduced ? totalLines : 0);

  model.add(hull, fill, ink);
  const camera = new PerspectiveCamera(22, 1, 10, 3000);

  /* ---------- particles: a ragged ring of specks around the camera, facing the viewer like a splash. It drifts round
     slowly by itself; scrolling stirs it (it turns faster and spreads a little) and it settles again. Each speck is
     [angle, radius, depth, a random number that sets its own pace, size and strength]. ---------- */
  const DUST = window.innerWidth < 768 ? 1100 : 1900;
  let seed = 20240607;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;
  const specks = new Float32Array(DUST * 4);
  for (let i = 0; i < DUST; i++) {
    let th, keep;
    /* thicker in some places than others, like the reference splash, never an even circle */
    do { th = rnd() * TAU; keep = 0.16 + 0.84 * Math.pow(0.5 + 0.5 * Math.sin(2 * th + 0.8), 1.6) * (0.55 + 0.45 * Math.sin(5 * th + 2.1)); } while (rnd() > keep);
    let r = 118 + 11 * Math.sin(3 * th + 1.3) + 6 * Math.sin(7 * th + 0.4) + gauss() * 9;
    const fling = rnd();
    if (fling < 0.16) r += 12 + rnd() * rnd() * 70;        /* drops thrown outwards */
    else if (fling < 0.22) r -= 8 + rnd() * 16;            /* and a few inside */
    specks.set([th, r, (rnd() - 0.5) * 46, rnd()], i * 4);
  }
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute('position', new Float32BufferAttribute(new Float32Array(DUST * 3), 3));
  dustGeo.setAttribute('speck', new Float32BufferAttribute(specks, 4));
  const dustMat = new ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { time: { value: 0 }, swirl: { value: 0 }, spread: { value: 1 }, dpr: { value: 1 }, fade: { value: reduced ? 1 : 0 }, ink: hullMat.uniforms.ink },
    vertexShader: 'attribute vec4 speck; uniform float time, swirl, spread, dpr, fade; varying float strength;'
      + 'void main(){ float s=speck.w;'
      + 'float a=speck.x+swirl*(0.45+s)+0.1*sin(time*0.5+s*37.0);'
      + 'float r=speck.y*spread*(1.0+0.045*sin(time*(0.6+s)+s*91.0));'
      + 'vec3 p=vec3(cos(a)*r, sin(a)*r*0.94, speck.z+6.0*sin(time*0.8+s*53.0));'
      + 'gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);'
      + 'gl_PointSize=(1.0+2.1*fract(s*7.31)*fract(s*7.31))*dpr;'
      + 'strength=(0.3+0.7*fract(s*3.17))*fade; }',
    fragmentShader: 'uniform vec3 ink; varying float strength;'
      + 'void main(){ vec2 c=gl_PointCoord-0.5; if(dot(c,c)>0.25) discard; gl_FragColor=vec4(ink,strength); }'
  });
  const dust = new Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);

  /* ---------- size, looking and turning ---------- */
  const OUTLINE = 1.15;   /* css pixels */
  let outlineNow = reduced ? 1 : 0;
  function setOutline() { hullMat.uniforms.width.value = OUTLINE * renderer.getPixelRatio() * outlineNow; }
  function resize() {
    const box_ = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(1, box_.width), h = Math.max(1, box_.height), dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    hullMat.uniforms.res.value.set(w * dpr, h * dpr);
    setOutline();
    camera.aspect = w / h;
    /* far enough back that the camera fits at any angle, whatever the canvas shape */
    const half = Math.tan((camera.fov / 2) * Math.PI / 180);
    camera.position.set(0, 0, 96 / Math.min(half, half * camera.aspect));
    camera.updateProjectionMatrix();
    cw = w; ch = h;
    dustMat.uniforms.dpr.value = dpr;
    /* the rings of photographs: a twelve-sided drum, sized to stand clear of the camera and the particles, and spaced
       so that the camera shows between one ring and the next */
    ringR = Math.round(Math.min(w * (w < 600 ? 0.45 : 0.36), h * 0.42, 340));
    const panelW = 2 * ringR * Math.tan(Math.PI / 12), panelH = panelW * 0.7, band = Math.max(11, panelW * 0.1);
    ringReach = panelH / 2 + band + 6;
    ringPitch = panelH * 2.5 + band * 2;
    grid.style.setProperty('--R', ringR + 'px');
    grid.style.setProperty('--W', panelW.toFixed(1) + 'px');
    grid.style.setProperty('--H', panelH.toFixed(1) + 'px');
    grid.style.setProperty('--B', band.toFixed(1) + 'px');
    if (entering) return;
    tNow = openTarget();
    setOffset();
    layoutRings();
    draw();
  }
  function draw() { renderer.render(scene, camera); }

  /* rotX and rotY are what the visitor has added by dragging. The rest of the pose comes from how far the page has
     scrolled through the section (pNow, 0 to 1): one and a half turns, ending on the camera's back, with a dip to show
     the top plate on the way, and a slow sway so it is never quite still */
  let rotY = 0, rotX = 0, pNow = 0;
  function pose(now) {
    const sway = reduced ? 0 : Math.sin(now / 2600) * 0.09;
    model.rotation.set(0.24 + rotX + Math.sin(pNow * Math.PI) * 0.26, (reduced ? 0.5 : 0.24) + rotY + pNow * Math.PI * 3 + sway, 0);
  }
  let lastFrame = 0;
  let dragging = false, lastX = 0, lastY = 0;
  let inView = false, started = false, startTime = 0, raf = 0;
  const DRAW_MS = 2600;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* the pointer has already gone */ }
    canvas.classList.add('is-drag');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.009;
    rotX = Math.max(-1.2, Math.min(1.2, rotX + (e.clientY - lastY) * 0.006));
    lastX = e.clientX; lastY = e.clientY;
    if (reduced) { pose(0); draw(); }
  });
  const release = () => { dragging = false; canvas.classList.remove('is-drag'); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  /* ---------- the specs: at rest the camera sits in the middle of the section. When the specs open (hover with a mouse,
     a tap on a touch screen, or keyboard focus) they slide in on the right and the camera glides left into the space
     beside them. It moves by shifting the view, not by resizing the canvas, so the drawing stays steady. Phones keep the
     specs below the camera, so nothing moves there. ---------- */
  const grid = canvas.closest('.pc-grid'), info = grid.querySelector('.pc-info');
  const wide = window.matchMedia ? matchMedia('(min-width:768px)') : { matches: true };
  let cw = 1, ch = 1, tNow = 0, shiftRaf = 0, closeTimer = 0, downX = 0, downY = 0;
  const BASE = 0.46;   /* how big the camera is in its stage: under half the full fit, leaving room for the particles and rings */
  let ringR = 300, ringReach = 120, ringPitch = 300, sidePanel = 0;
  const openTarget = () => (grid.classList.contains('is-open') && wide.matches ? 1 : 0);
  /* tNow runs 0 (centred) to 1 (beside the specs). Open, the camera moves left by half the panel's width and,
     where the space left is narrower than the canvas is tall (tablets), zooms out so all of it still shows. */
  function setOffset() {
    const pw = info.getBoundingClientRect().width || cw * 0.42;
    const fit = Math.min(1, (cw - pw) * 1.04 / Math.min(cw, ch));
    camera.zoom = BASE * (1 - tNow * (1 - fit));
    const shift = tNow * pw / 2;
    sidePanel = pw;
    if (shift < 0.5) camera.clearViewOffset();
    else camera.setViewOffset(cw, ch, shift, 0, cw, ch);
    camera.updateProjectionMatrix();
  }
  function glide() {
    shiftRaf = 0;
    if (entering) return;
    const target = openTarget();
    tNow += (target - tNow) * (reduced ? 1 : 0.14);
    if (Math.abs(target - tNow) < 0.002) tNow = target;
    setOffset();
    layoutRings();
    draw();
    if (tNow !== openTarget()) shiftRaf = requestAnimationFrame(glide);
  }
  const toggle = grid.querySelector('.pc-toggle'), closeBtn = grid.querySelector('.pc-close');
  function setOpen(open) {
    clearTimeout(closeTimer);
    if (grid.classList.contains('is-open') === open) return;
    grid.classList.toggle('is-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (!shiftRaf) shiftRaf = requestAnimationFrame(glide);
  }
  /* the "Nikon Z6 III" button under the camera opens and closes the details; so do the panel's close button and Escape */
  if (toggle) toggle.addEventListener('click', () => {
    if (entering) return;
    const open = !grid.classList.contains('is-open');
    setOpen(open);
    if (open && closeBtn) closeBtn.focus({ preventScroll: true });
  });
  if (closeBtn) closeBtn.addEventListener('click', () => { setOpen(false); if (toggle) toggle.focus({ preventScroll: true }); });
  /* a click or tap on the camera (not a drag) opens the photos */
  let downT = 0;
  canvas.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; downT = performance.now(); });
  canvas.addEventListener('pointerup', (e) => {
    const still = Math.abs(e.clientX - downX) < 7 && Math.abs(e.clientY - downY) < 7 && performance.now() - downT < 600;
    if (still) { enterPhotos(); return; }
  });
  /* keyboard: Enter or Space on the camera opens the photos; Escape closes the details */
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && grid.classList.contains('is-open')) { setOpen(false); if (toggle) toggle.focus({ preventScroll: true }); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target === canvas) { e.preventDefault(); enterPhotos(); }
  });

  /* ---------- into the photos: the camera turns round to show its back, the view closes in on its screen until the
     screen fills the window, and the photo sections come up behind it one after another ---------- */
  let entering = false;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeIn = (t) => t * t * t;
  function tween(ms, step) {
    return new Promise((done) => {
      const t0 = performance.now();
      (function tick(now) {
        const t = Math.min(1, (now - t0) / ms);
        step(t);
        if (t < 1) requestAnimationFrame(tick); else done();
      })(t0);
    });
  }
  /* a point of the model, in pixels within the canvas */
  function onCanvas(x, y, z) {
    model.updateMatrixWorld();
    const v = new Vector3(x, y * SQ, z * SQ + offsetZ).applyMatrix4(model.matrixWorld).project(camera);
    return [(v.x + 1) / 2 * cw, (1 - v.y) / 2 * ch];
  }
  const SCREEN = [[bx(175), by(345)], [bx(478), by(345)], [bx(478), by(523)], [bx(175), by(523)]];
  function photosIn() {
    /* the photo sections after the camera, each one revealed a beat after the one before */
    const secs = [].slice.call(document.querySelectorAll('.ph-sub')).filter((el) => el.id !== 'camera');
    const marks = [];
    secs.forEach((sec, i) => [].slice.call(sec.querySelectorAll('.cs-reveal')).forEach((el, j) => {
      el.classList.remove('in');
      el.style.transitionDelay = (i * 0.32 + Math.min(j, 8) * 0.07).toFixed(2) + 's';
      marks.push(el);
    }));
    return () => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const lim = window.innerHeight * 1.05, later = [];
        marks.forEach((el) => { if (el.getBoundingClientRect().top < lim) el.classList.add('in'); else { el.style.transitionDelay = ''; later.push(el); } });
        /* the rest come up as they are scrolled to */
        if (later.length && window.IntersectionObserver) {
          const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
          later.forEach((el) => io.observe(el));
        } else later.forEach((el) => el.classList.add('in'));
        setTimeout(() => marks.forEach((el) => { el.style.transitionDelay = ''; }), 2600);
      }));
    };
  }
  function goToPhotos() {
    const first = document.querySelector('.ph-sub:not(#camera)');
    if (!first) return;
    const top = first.getBoundingClientRect().top + window.scrollY - 76;   /* clear of the floating menu bar */
    window.scrollTo({ top, behavior: 'instant' });
    const h = first.querySelector('h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  async function enterPhotos(auto) {
    if (entering) return;
    if (reduced) { const show = photosIn(); goToPhotos(); show(); return; }
    entering = true;
    grid.classList.add('is-entering');
    clearTimeout(closeTimer);
    canvas.classList.remove('is-drag');
    /* bring the camera to the middle of the window first */
    const r = canvas.getBoundingClientRect(), off = r.top + r.height / 2 - window.innerHeight / 2;
    if (Math.abs(off) > 30) { window.scrollTo({ top: window.scrollY + off, behavior: 'smooth' }); await sleep(450); }
    /* the details slide away and the camera turns round to face its back */
    grid.classList.remove('is-open');
    const x0 = model.rotation.x, y0 = model.rotation.y, t0 = tNow;
    let turn = Math.PI - (((y0 % TAU) + TAU) % TAU);
    if (turn > Math.PI) turn -= TAU;
    if (turn < -Math.PI) turn += TAU;
    /* a tap on a camera that is already facing the right way adds a full flourish; arriving by scrolling does not, as the camera has just turned */
    if (!auto && Math.abs(turn) < 1.2) turn += turn < 0 ? -TAU : TAU;
    await tween(1150, (t) => {
      const k = ease(t);
      tNow = t0 * (1 - k); setOffset();
      dustMat.uniforms.swirl.value = swirl + k * 0.8;
      model.rotation.set(x0 * (1 - k), y0 + turn * k, 0); draw();
    });
    swirl += 0.8;
    /* close in on the screen, keeping it in the middle. z is how many times closer than the camera's usual size */
    camera.zoom = BASE; camera.clearViewOffset(); camera.updateProjectionMatrix();
    const pts = SCREEN.map(([x, y]) => onCanvas(x, y, ZM - 0.05));
    const cx = pts.reduce((a, p) => a + p[0], 0) / 4, cy = pts.reduce((a, p) => a + p[1], 0) / 4;
    const sw = Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0]));
    const sh = Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]));
    const zEnd = Math.min(0.92 * cw / sw, 0.92 * ch / sh);
    const view = (z) => {
      camera.zoom = BASE * z;
      camera.setViewOffset(cw, ch, (cx - cw / 2) * z, (cy - ch / 2) * z, cw, ch);
      camera.updateProjectionMatrix(); draw();
    };
    await tween(850, (t) => view(1 + (zEnd - 1) * easeIn(t)));
    /* the screen grows to fill the window, the camera disappears behind it, and the page moves on to the photos */
    const box = canvas.getBoundingClientRect();
    const sx0 = box.left + cw / 2 - sw * zEnd / 2, sy0 = box.top + ch / 2 - sh * zEnd / 2;
    const veil = document.createElement('div');
    veil.className = 'pc-veil';
    document.body.appendChild(veil);
    const vw = window.innerWidth, vh = window.innerHeight, w0 = sw * zEnd, h0 = sh * zEnd;
    const grow = (t) => {
      const k = ease(t);
      veil.style.left = (sx0 * (1 - k) - 2 * k) + 'px';
      veil.style.top = (sy0 * (1 - k) - 2 * k) + 'px';
      veil.style.width = (w0 + (vw + 4 - w0) * k) + 'px';
      veil.style.height = (h0 + (vh + 4 - h0) * k) + 'px';
      veil.style.borderRadius = (6 * (1 - k)) + 'px';
    };
    grow(0);
    await tween(560, grow);
    const show = photosIn();
    goToPhotos();
    canvas.style.visibility = 'hidden';
    await sleep(80);
    veil.style.transition = 'opacity .5s ease';
    veil.style.opacity = '0';
    show();
    await sleep(520);
    veil.remove();
    /* put the camera back as it was, ready for when the visitor scrolls back up */
    rotX = 0; rotY = 0; tNow = 0; pNow = progress();
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    grid.classList.remove('is-entering');
    setOffset();
    layoutRings();
    pose(performance.now()); draw();
    canvas.style.visibility = '';
    entering = false;
    wake();
  }

  /* ---------- the pinned stage ---------- */
  /* how far the page has scrolled through the section: 0 as the stage pins, 1 as it lets go */
  const pin = section.querySelector('.pc-pin');
  /* browsers too old for overflow:clip cannot pin the stage with CSS on this page, so there it is carried down by hand */
  const carry = !reduced && !(window.CSS && CSS.supports && CSS.supports('overflow-x', 'clip'));
  const END = 0.9;   /* the turning and the rings are done by this far through the scroll; the rest is held for the dive */
  function progress() {
    const r = section.getBoundingClientRect(), span = r.height - window.innerHeight;
    if (carry && span > 0) pin.style.transform = 'translateY(' + Math.min(span, Math.max(0, -r.top)).toFixed(1) + 'px)';
    return span > 0 ? Math.min(1, Math.max(0, -r.top / (span * END))) : 0;
  }
  /* the rings: the whole stack rides up through the stage as the page scrolls, from below the bottom edge to above the
     top one, while each ring turns on its own axis, neighbours in opposite directions. Both layers (behind and in front
     of the camera) are moved alike. When the details panel is open the rings move left with the camera. */
  const stacks = [].slice.call(grid.querySelectorAll('.pc-stack'));
  const rings = stacks.map((st) => [].slice.call(st.querySelectorAll('.pc-ring')));
  let clock = 0, swirl = 0, energy = 0, lastScroll = window.scrollY;
  function layoutRings() {
    if (!stacks.length || reduced) return;
    /* the far side of a ring shows nearer the middle of the stage than its near side, so start and end well clear */
    const n = rings[0].length, from = ch * 0.64 + ringReach, to = -ringPitch * (n - 1) - ch * 0.64 - ringReach;
    const k = Math.min(1, Math.max(0, (pNow - 0.03) / 0.94));
    const y = from + (to - from) * k, x = -tNow * sidePanel / 2;
    for (let l = 0; l < stacks.length; l++) {
      stacks[l].style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      for (let i = 0; i < n; i++) {
        const turn = (i % 2 ? -1 : 1) * (clock * 6 + pNow * 300) + i * 23;
        const away = Math.abs(y + i * ringPitch) > ch * 0.72 + ringReach;   /* out of sight: skip it */
        if (rings[l][i].hidden !== away) rings[l][i].hidden = away;
        if (!away) rings[l][i].style.transform = 'translateY(' + (i * ringPitch).toFixed(1) + 'px) rotateY(' + turn.toFixed(2) + 'deg)';
      }
    }
  }
  /* the dive: when the page has been scrolled to the end of the stage, the same zoom that a tap starts plays by itself, once.
     It only counts when the visitor scrolled up to it (a jump from a link or a search result, or scrolling back up, does not
     start it), and it is armed again only after they have scrolled back well away from the end. While it plays, the page does
     not scroll. */
  let armed = true, prevTarget = progress();
  const hold = (e) => { if (entering && e.cancelable) e.preventDefault(); };
  window.addEventListener('wheel', hold, { passive: false });
  window.addEventListener('touchmove', hold, { passive: false });
  function checkEnd(target) {
    if (target < 0.8) armed = true;
    if (armed && !entering && !reduced && prevTarget < 0.98 && target >= 0.98 && section.getBoundingClientRect().bottom > window.innerHeight * 0.15) {
      armed = false;
      enterPhotos(true);
    }
    prevTarget = target;
  }
  function frame(now) {
    raf = 0;
    if (!inView || document.hidden || entering) return;
    if (!started) { started = true; startTime = now; lastFrame = now; }
    if (!reduced) {
      const dt = Math.min(now - lastFrame, 50) / 1000;
      lastFrame = now;
      const p = Math.min(1, (now - startTime) / DRAW_MS);
      lineGeo.setDrawRange(0, Math.floor((1 - Math.pow(1 - p, 2.2)) * totalLines / 2) * 2);
      const o = Math.min(1, Math.max(0, (p - 0.55) / 0.45));
      if (o !== outlineNow) { outlineNow = o; setOutline(); }
      /* follow the scroll a little behind it, so the turning feels weighted */
      const target = progress();
      checkEnd(target);
      pNow += (target - pNow) * 0.1;
      if (Math.abs(target - pNow) < 0.0003) pNow = target;
      /* scrolling stirs the particles */
      const moved = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      energy += (Math.min(1, moved / 45) - energy) * 0.07;
      clock += dt;
      swirl += dt * (0.09 + energy * 1.5);
      const u = dustMat.uniforms;
      u.time.value = clock; u.swirl.value = swirl; u.spread.value = 1 + energy * 0.16;
      u.fade.value = Math.min(1, Math.max(0, (p - 0.3) / 0.6));
      layoutRings();
    }
    pose(now);
    draw();
    if (!reduced) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && inView && !document.hidden) raf = requestAnimationFrame(frame); }

  new IntersectionObserver((en) => { inView = en[0].isIntersecting; wake(); }, { threshold: 0.2 }).observe(canvas);
  document.addEventListener('visibilitychange', wake);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas.parentElement);
  else window.addEventListener('resize', resize);

  /* wait for the loading animation to open, so the lines don't draw behind it */
  (function holdForLoader() {
    if (document.documentElement.hasAttribute('data-hb-wait')) { setTimeout(holdForLoader, 100); return; }
    resize();
    pNow = progress();
    pose(performance.now());
    layoutRings();
    draw();
    wake();
  })();
}
