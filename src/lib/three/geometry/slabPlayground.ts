import type { BufferGeometry, Object3D } from "three";
import type { ThreeModule } from "$lib/three/disposeObject3DSubtree";

export function processSlabTopFace(
  geometry: BufferGeometry,
  THREE: any,
): { metrics: Record<string, unknown>; visuals: Object3D[] } {
  const offsetDistance = 0.5;
  const lift = 0.01;

  const posAttr = geometry.getAttribute("position");
  if (!posAttr) {
    return {
      metrics: { vertexCount: 0, offsetDistance },
      visuals: [],
    };
  }

  const position = posAttr.array as ArrayLike<number>;
  const bb = new THREE.Box3().setFromBufferAttribute(posAttr);
  const size = bb.getSize(new THREE.Vector3());
  const ext = [size.x, size.y, size.z];
  let upIndex = 0;
  if (ext[1] < ext[upIndex]) upIndex = 1;
  if (ext[2] < ext[upIndex]) upIndex = 2;

  const quant = 1e-4; // floating point hashing resolution (world units in extracted geometry space)
  const quantize = (v: number) => Math.round(v / quant);

  const vertexKeyFromXYZ = (x: number, y: number, z: number) =>
    `${quantize(x)},${quantize(y)},${quantize(z)}`;

  const readVertex = (base: number, out: import("three").Vector3) => {
    out.set(position[base], position[base + 1], position[base + 2]);
    return out;
  };

  // --- 1) Build edge counts to find boundary edges (edges used by only 1 triangle) ---
  type EdgeInfo = { aKey: string; bKey: string; count: number };
  const edges = new Map<string, EdgeInfo>();
  const vertexByKey = new Map<string, import("three").Vector3>();

  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();

  const pushVertexKey = (v: import("three").Vector3) => {
    const key = vertexKeyFromXYZ(v.x, v.y, v.z);
    if (!vertexByKey.has(key)) vertexByKey.set(key, v.clone());
    return key;
  };

  const addUndirectedEdge = (aKey: string, bKey: string) => {
    const k = aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
    const existing = edges.get(k);
    if (existing) {
      existing.count += 1;
    } else {
      edges.set(k, { aKey: aKey < bKey ? aKey : bKey, bKey: aKey < bKey ? bKey : aKey, count: 1 });
    }
  };

  // Unindexed triangles: iterate position in steps of 9.
  for (let i = 0; i < position.length; i += 9) {
    readVertex(i, v0);
    readVertex(i + 3, v1);
    readVertex(i + 6, v2);

    const k0 = pushVertexKey(v0);
    const k1 = pushVertexKey(v1);
    const k2 = pushVertexKey(v2);

    addUndirectedEdge(k0, k1);
    addUndirectedEdge(k1, k2);
    addUndirectedEdge(k2, k0);
  }

  console.log(
    "[SlabPlayground] Total vertices:",
    vertexByKey.size,
    "Total edges:",
    edges.size,
  );

  // Boundary edges are those with count == 1.
  const adjacency = new Map<string, string[]>();
  const addAdj = (a: string, b: string) => {
    const arr = adjacency.get(a);
    if (arr) arr.push(b);
    else adjacency.set(a, [b]);
  };

  const rawBoundaryPoints: import("three").Vector3[] = [];
  for (const e of edges.values()) {
    if (e.count !== 1) continue;
    addAdj(e.aKey, e.bKey);
    addAdj(e.bKey, e.aKey);

    const a = vertexByKey.get(e.aKey);
    const b = vertexByKey.get(e.bKey);
    if (a && b) {
      rawBoundaryPoints.push(a.clone(), b.clone());
    }
  }

  console.log(
    "[SlabPlayground] Boundary edges found:",
    rawBoundaryPoints.length / 2,
  );

  for (const p of rawBoundaryPoints) {
    if (upIndex === 0) p.x += lift;
    else if (upIndex === 1) p.y += lift;
    else p.z += lift;
  }

  const rawBoundaryGeom = new THREE.BufferGeometry().setFromPoints(rawBoundaryPoints);
  const rawBoundary = new THREE.LineSegments(
    rawBoundaryGeom,
    new THREE.LineBasicMaterial({
      color: 0x00ffff,
      depthTest: false,
      depthWrite: false,
    }),
  );
  rawBoundary.name = "slab-raw-boundary";
  rawBoundary.renderOrder = 1001;

  // --- 2) Chain boundary edges into an ordered loop of points ---
  const startKey = adjacency.keys().next().value as string | undefined;
  if (!startKey) {
    return {
      metrics: {
        vertexCount: 0,
        rawBoundaryEdgeCount: rawBoundaryPoints.length / 2,
        offsetDistance,
      },
      visuals: [rawBoundary],
    };
  }

  const loopKeys: string[] = [];
  let current = startKey;
  let prev: string | null = null;

  // Guard to avoid infinite loops in degenerate graphs.
  const maxSteps = adjacency.size + 5;
  for (let step = 0; step < maxSteps; step++) {
    loopKeys.push(current);
    const neighbors = adjacency.get(current) ?? [];
    const next =
      neighbors.length === 0
        ? null
        : neighbors.length === 1
          ? neighbors[0]
          : neighbors[0] === prev
            ? neighbors[1]
            : neighbors[0];
    if (!next) break;
    prev = current;
    current = next;
    if (current === startKey) break;
  }

  const loop = loopKeys
    .map((k) => vertexByKey.get(k))
    .filter(Boolean) as import("three").Vector3[];

  if (loop.length < 3) {
    console.warn(
      "[SlabPlayground] Loop chaining failed or found tiny hole. Loop length:",
      loop.length,
    );
    return {
      metrics: {
        vertexCount: loop.length,
        rawBoundaryEdgeCount: rawBoundaryPoints.length / 2,
        offsetDistance,
      },
      visuals: [rawBoundary],
    };
  }

  // --- 3) Determine "up axis" for 2D projection (use smallest bbox extent) ---
  const axes: [number, number] =
    upIndex === 0 ? [1, 2] : upIndex === 1 ? [0, 2] : [0, 1];

  const get2 = (p: import("three").Vector3) => {
    const arr = [p.x, p.y, p.z];
    return { u: arr[axes[0]], v: arr[axes[1]] };
  };

  const signedArea2D = () => {
    let a = 0;
    for (let i = 0; i < loop.length; i++) {
      const p = get2(loop[i]);
      const q = get2(loop[(i + 1) % loop.length]);
      a += p.u * q.v - q.u * p.v;
    }
    return 0.5 * a;
  };

  const ccw = signedArea2D() > 0;
  const rightNormal2D = (du: number, dv: number) => ({ nu: dv, nv: -du });
  const leftNormal2D = (du: number, dv: number) => ({ nu: -dv, nv: du });
  const outwardNormal2D = (du: number, dv: number) =>
    ccw ? rightNormal2D(du, dv) : leftNormal2D(du, dv);

  const offsetLoop: import("three").Vector3[] = [];
  const eps = 1e-8;

  for (let i = 0; i < loop.length; i++) {
    const pPrev = loop[(i - 1 + loop.length) % loop.length];
    const pCur = loop[i];
    const pNext = loop[(i + 1) % loop.length];

    const a2 = get2(pPrev);
    const b2 = get2(pCur);
    const c2 = get2(pNext);

    let d1u = b2.u - a2.u;
    let d1v = b2.v - a2.v;
    let d2u = c2.u - b2.u;
    let d2v = c2.v - b2.v;

    const d1Len = Math.hypot(d1u, d1v);
    const d2Len = Math.hypot(d2u, d2v);
    if (d1Len < eps || d2Len < eps) {
      offsetLoop.push(pCur.clone());
      continue;
    }
    d1u /= d1Len;
    d1v /= d1Len;
    d2u /= d2Len;
    d2v /= d2Len;

    const n1 = outwardNormal2D(d1u, d1v);
    const n2 = outwardNormal2D(d2u, d2v);

    let bisU = n1.nu + n2.nu;
    let bisV = n1.nv + n2.nv;
    const bisLen = Math.hypot(bisU, bisV);
    if (bisLen < eps) {
      // Straight angle: just use one outward normal.
      bisU = n1.nu;
      bisV = n1.nv;
    } else {
      bisU /= bisLen;
      bisV /= bisLen;
    }

    // Miter length correction: offsetDistance / dot(bisector, n1)
    const denom = Math.max(eps, bisU * n1.nu + bisV * n1.nv);
    const miter = offsetDistance / denom;

    const arr = [pCur.x, pCur.y, pCur.z];
    arr[axes[0]] += bisU * miter;
    arr[axes[1]] += bisV * miter;
    offsetLoop.push(new THREE.Vector3(arr[0], arr[1], arr[2]));
  }

  // Close the loops for rendering
  const originalPoints = [...loop, loop[0]].map((p) => p.clone());
  const offsetPoints = [...offsetLoop, offsetLoop[0]].map((p) => p.clone());

  // Lift the contour lines slightly along the detected up axis to avoid z-fighting.
  for (const p of originalPoints) {
    if (upIndex === 0) p.x += lift;
    else if (upIndex === 1) p.y += lift;
    else p.z += lift;
  }
  for (const p of offsetPoints) {
    if (upIndex === 0) p.x += lift;
    else if (upIndex === 1) p.y += lift;
    else p.z += lift;
  }

  const originalGeom = new THREE.BufferGeometry().setFromPoints(originalPoints);
  const offsetGeom = new THREE.BufferGeometry().setFromPoints(offsetPoints);

  const originalLine = new THREE.LineLoop(
    originalGeom,
    new THREE.LineBasicMaterial({
      color: 0xffff00,
      depthTest: false,
      depthWrite: false,
    }),
  );
  originalLine.name = "slab-contour-original";
  originalLine.renderOrder = 1000;

  const offsetLine = new THREE.LineLoop(
    offsetGeom,
    new THREE.LineBasicMaterial({
      color: 0xff00ff,
      depthTest: false,
      depthWrite: false,
    }),
  );
  offsetLine.name = "slab-contour-offset";
  offsetLine.renderOrder = 1000;

  return {
    metrics: {
      vertexCount: loop.length,
      rawBoundaryEdgeCount: rawBoundaryPoints.length / 2,
      offsetDistance,
    },
    visuals: [rawBoundary, originalLine, offsetLine],
  };
}

