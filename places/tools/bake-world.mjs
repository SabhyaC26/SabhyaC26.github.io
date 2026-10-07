// node tools/bake-world.mjs <ne_50m_admin_0_countries.geojson> <out world.json> [tol] [ne_50m_admin_1_states_provinces.geojson]
// With the admin-1 file, the USA is replaced by its states. Outer rings only, coords rounded to 2dp, Douglas-Peucker simplified, Antarctica dropped.
import fs from 'node:fs';
import assert from 'node:assert';

const [src, out, tol = 0.05, states] = process.argv.slice(2);
const r2 = n => Math.round(n * 100) / 100;

function segDist2([x, y], [x1, y1], [x2, y2]) {
  let dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2)) : 0;
  dx = x - (x1 + t * dx); dy = y - (y1 + t * dy);
  return dx * dx + dy * dy;
}

function dp(pts, eps2) {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = segDist2(pts[i], pts[a], pts[b]);
      if (d > max) { max = d; idx = i; }
    }
    if (max > eps2) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

export function bakeRing(ring, t = 0.05) {
  const pts = [];
  for (const [x, y] of ring) {
    const p = [r2(x), r2(y)];
    const q = pts[pts.length - 1];
    if (!q || q[0] !== p[0] || q[1] !== p[1]) pts.push(p);
  }
  // closed ring: first == last, so DP endpoints anchor at the same point; split at farthest point to avoid collapse
  if (pts.length < 4) return null;
  let far = 1, fd = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2;
    if (d > fd) { fd = d; far = i; }
  }
  const e2 = t * t;
  const s = [...dp(pts.slice(0, far + 1), e2), ...dp(pts.slice(far), e2).slice(1)];
  return s.length >= 4 ? s : null;
}

if (src && out) {
  const gj = JSON.parse(fs.readFileSync(src, 'utf8'));
  let points = 0;
  const countries = [];
  const features = gj.features.filter(f => !(states && f.properties.ADM0_A3 === 'USA'));
  if (states) {
    for (const f of JSON.parse(fs.readFileSync(states, 'utf8')).features) {
      if (f.properties.adm0_a3 === 'USA') features.push({ ...f, properties: { NAME: f.properties.name, ISO_A3: 'USA' } });
    }
  }
  for (const f of features) {
    const p = f.properties, g = f.geometry;
    if (!g || p.NAME === 'Antarctica') continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    const rings = polys.map(poly => bakeRing(poly[0], +tol)).filter(Boolean);
    if (!rings.length) continue;
    points += rings.reduce((n, r) => n + r.length, 0);
    countries.push({ name: p.NAME, iso: p.ISO_A3 === '-99' ? p.ADM0_A3 : p.ISO_A3, rings });
  }
  fs.writeFileSync(out, JSON.stringify(countries));
  console.log(`${countries.length} countries, ${points} points, ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
} else {
  // self-check: square with redundant collinear points simplifies to 5 points, tiny ring dropped
  const sq = [[0, 0], [0.5, 0], [1, 0], [1, 1], [0, 1], [0, 0.5], [0, 0]];
  assert(bakeRing(sq).length === 5, 'square');
  assert(bakeRing([[0, 0], [0.001, 0], [0, 0.001], [0, 0]]) === null, 'tiny');
  console.log('self-check ok');
}
