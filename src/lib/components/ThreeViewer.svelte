<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type {
    Material,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
  } from "three";
  import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import {
    disposeObject3DSubtree,
    type ThreeModule,
  } from "$lib/three/disposeObject3DSubtree";
  import type {
    BimElementRef,
    BimElementSummary,
    FilterMode,
  } from "$lib/types/bim";
  import {
    calculateFaceArea,
    extractTopFaceGeometry,
  } from "$lib/three/geometry/slabOperations";
  import { processSlabTopFace } from "$lib/three/geometry/slabPlayground";

  type RunningState = {
    THREE: ThreeModule;
    animation: { id: number };
    resizeObserver: ResizeObserver;
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    controls: OrbitControls;
    modelRoot: Object3D | null;
    raycaster: import("three").Raycaster;
    pointer: import("three").Vector2;
    onPointerDown: (event: PointerEvent) => void;
    selected:
      | {
          mesh: Mesh;
          originalMaterial: Material | Material[];
          highlightMaterial: Material | Material[];
        }
      | null;
    /** Neon top-face extraction preview; removed when selection changes. */
    topFacePreviewMesh: Mesh | null;
  };

  function getCanonicalElementId(object: Object3D): string {
    const data = object.userData as Record<string, unknown> | undefined;
    if (data?.ifcGuid != null && String(data.ifcGuid).length > 0) {
      return String(data.ifcGuid);
    }
    if (data?.id != null && String(data.id).length > 0) {
      return String(data.id);
    }
    return object.uuid;
  }

  function buildBimElementRef(
    object: Object3D,
    computed?: Record<string, unknown>,
  ): BimElementRef {
    const data = object.userData as Record<string, unknown> | undefined;
    const base: BimElementRef = {
      id: getCanonicalElementId(object),
      uuid: object.uuid,
      name: object.name || undefined,
      userData: data && Object.keys(data).length > 0 ? data : undefined,
    };
    if (computed && Object.keys(computed).length > 0) {
      return { ...base, computed };
    }
    return base;
  }

  function disposeTopFacePreview(rv: RunningState) {
    if (!rv.topFacePreviewMesh) return;
    const prev = rv.topFacePreviewMesh;
    // Dispose any attached debug visuals (e.g. contour lines) before disposing the preview mesh.
    prev.traverse((child) => {
      if (child === prev) return;
      const maybeGeom = (child as unknown as { geometry?: { dispose?: () => void } })
        .geometry;
      maybeGeom?.dispose?.();

      const maybeMat = (child as unknown as { material?: unknown }).material;
      if (Array.isArray(maybeMat)) {
        for (const m of maybeMat as Array<{ dispose?: () => void }>) {
          m?.dispose?.();
        }
      } else if (maybeMat && typeof maybeMat === "object") {
        (maybeMat as { dispose?: () => void }).dispose?.();
      }
    });
    prev.removeFromParent();
    prev.geometry.dispose();
    const pm = prev.material;
    if (Array.isArray(pm)) {
      for (const m of pm) m.dispose();
    } else {
      pm.dispose();
    }
    rv.topFacePreviewMesh = null;
  }

  /**
   * Top-face extraction + area; attaches neon preview mesh to `targetMesh` when a face is found.
   */
  function buildRefWithTopFaceTelemetry(
    rv: RunningState,
    targetMesh: Mesh,
  ): BimElementRef {
    const THREE = rv.THREE;
    const extracted = extractTopFaceGeometry(targetMesh, THREE);
    const posAttr = extracted.getAttribute("position");
    console.log("[Viewer] Extracted top face vertices:", posAttr ? posAttr.count : 0);
    if (!posAttr || posAttr.count === 0) {
      extracted.dispose();
      return buildBimElementRef(targetMesh);
    }

    const topFaceArea = calculateFaceArea(extracted, THREE);
    const { metrics, visuals } = processSlabTopFace(extracted, THREE);

    const previewMat = new THREE.MeshStandardMaterial({
      color: 0x39ff14,
      emissive: 0x175022,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
      depthWrite: false,
      metalness: 0.15,
      roughness: 0.42,
    });

    const previewMesh = new THREE.Mesh(extracted, previewMat);
    previewMesh.name = "top-face-preview";
    previewMesh.renderOrder = 999;
    for (const visual of visuals) {
      previewMesh.add(visual);
    }
    targetMesh.add(previewMesh);
    rv.topFacePreviewMesh = previewMesh;

    return buildBimElementRef(targetMesh, { topFaceArea, ...metrics });
  }

  function buildMeshIdMap(
    root: Object3D,
    THREE: ThreeModule,
  ): { map: Map<string, Mesh>; catalog: BimElementSummary[] } {
    const map = new Map<string, Mesh>();
    const catalog: BimElementSummary[] = [];
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const id = getCanonicalElementId(object);
      if (!map.has(id)) {
        map.set(id, object);
        const rawName = object.name?.trim();
        catalog.push({
          id,
          displayName: rawName ? rawName : id,
        });
      }
    });
    return { map, catalog };
  }

  function clearSelectionState(rv: RunningState) {
    if (!rv.selected) return;
    rv.selected.mesh.material = rv.selected.originalMaterial;
    const highlights = Array.isArray(rv.selected.highlightMaterial)
      ? rv.selected.highlightMaterial
      : [rv.selected.highlightMaterial];
    for (const highlightMaterial of highlights) {
      highlightMaterial.dispose();
    }
    rv.selected = null;
  }

  function applyHighlight(rv: RunningState, mesh: Mesh) {
    const THREE = rv.THREE;
    const originalMaterial = mesh.material;
    const sourceMaterials = Array.isArray(originalMaterial)
      ? originalMaterial
      : [originalMaterial];

    const highlightMaterials = sourceMaterials.map((sourceMaterial) => {
      const cloned = sourceMaterial.clone();
      const maybeEmissive = (cloned as unknown as { emissive?: import("three").Color })
        .emissive;
      if (maybeEmissive) {
        maybeEmissive.set(new THREE.Color(0x0055ff));
      }
      // Diagnostic: make selected element see-through wireframe.
      (cloned as unknown as { wireframe?: boolean }).wireframe = true;
      (cloned as unknown as { transparent?: boolean }).transparent = true;
      (cloned as unknown as { opacity?: number }).opacity = 0.1;
      return cloned;
    });

    mesh.material = Array.isArray(originalMaterial)
      ? highlightMaterials
      : highlightMaterials[0];

    rv.selected = {
      mesh,
      originalMaterial,
      highlightMaterial: Array.isArray(originalMaterial)
        ? highlightMaterials
        : highlightMaterials[0],
    };
  }

  let {
    modelUrl,
    background = 0xf0f0f0,
    selectedId = null,
    filterMode = "none",
    onElementSelect,
    onCatalogReady,
  }: {
    modelUrl: string;
    background?: number;
    selectedId?: string | null;
    filterMode?: FilterMode;
    onElementSelect?: (data: BimElementRef | null) => void;
    onCatalogReady?: (catalog: BimElementSummary[]) => void;
  } = $props();

  /** Bound container for the canvas and `ResizeObserver` root. */
  let container = $state<HTMLDivElement | undefined>(undefined);

  let mounted = $state(true);

  /** Live viewer handles; assigned only after scene/renderer/controls are ready (model may still be loading). */
  let running = $state<RunningState | undefined>(undefined);

  /** Populated after GLTF load; drives `$effect` when the map becomes available. */
  let meshById = $state<Map<string, Mesh>>(new Map());

  /**
   * Bumps when the user picks on the canvas so telemetry re-runs even if `selectedId` is unchanged.
   */
  let selectionRevision = $state(0);

  $effect(() => {
    console.log(
      "[Effect] Triggered. selectedId:",
      selectedId,
      "Revision:",
      selectionRevision,
    );
    const id = selectedId ?? null;
    const mode = filterMode ?? "none";
    const rv = running;
    meshById;
    selectionRevision;
    if (!rv?.modelRoot) return;

    const targetMesh = id ? meshById.get(id) ?? null : null;
    console.log("[Effect] Target mesh found in map?", !!targetMesh);

    if (mode === "isolate" && id && targetMesh) {
      for (const mesh of meshById.values()) {
        mesh.visible = mesh.uuid === targetMesh.uuid;
      }
    } else {
      for (const mesh of meshById.values()) {
        mesh.visible = true;
      }
    }

    disposeTopFacePreview(rv);
    clearSelectionState(rv);

    if (!targetMesh) {
      onElementSelect?.(null);
      return;
    }

    applyHighlight(rv, targetMesh);
    const ref = buildRefWithTopFaceTelemetry(rv, targetMesh);
    onElementSelect?.(ref);
  });

  function disposeRunning(rv: RunningState, reason: "destroy" | "abort") {
    cancelAnimationFrame(rv.animation.id);
    rv.resizeObserver.disconnect();
    container?.removeEventListener("pointerdown", rv.onPointerDown);

    clearSelectionState(rv);

    disposeTopFacePreview(rv);

    rv.controls.dispose();

    disposeObject3DSubtree(rv.scene, rv.THREE);

    rv.renderer.dispose();
    rv.renderer.domElement.remove();

    if (reason === "destroy") {
      running = undefined;
      meshById = new Map();
    }
  }

  onMount(() => {
    mounted = true;

    void (async () => {
      const THREE = await import("three");
      const { OrbitControls: OrbitControlsCtor } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
      const { GLTFLoader: GLTFLoaderCtor } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );

      if (!mounted) return;
      if (!container) return;

      function frameObjectInView(
        root: Object3D,
        camera: PerspectiveCamera,
        controls: OrbitControls,
      ) {
        const box = new THREE.Box3().setFromObject(root);
        if (box.isEmpty()) {
          controls.target.set(0, 0, 0);
          camera.position.set(3, 2, 5);
          camera.near = 0.01;
          camera.far = 1000;
          camera.updateProjectionMatrix();
          controls.update();
          return;
        }

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 1e-6);

        const fitOffset = 1.35;
        const fovRad = (camera.fov * Math.PI) / 180;
        const halfFovTan = Math.tan(fovRad / 2);
        const fitHeightDistance = maxDim / (2 * halfFovTan);
        const fitWidthDistance =
          fitHeightDistance / Math.max(camera.aspect, 1e-6);
        const distance =
          Math.max(fitHeightDistance, fitWidthDistance) * fitOffset;

        const dir = new THREE.Vector3(1, 0.45, 1).normalize();
        camera.near = Math.max(distance / 1000, 0.001);
        camera.far = Math.max(distance * 100, maxDim * 10 + 100);
        camera.updateProjectionMatrix();

        camera.position.copy(center).addScaledVector(dir, distance);
        controls.target.copy(center);
        controls.update();
      }

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(background);
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100000);
      camera.position.set(3, 2, 6);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      const controls = new OrbitControlsCtor(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 0, 0);
      controls.update();

      const ambient = new THREE.AmbientLight(0xffffff, 0.55);
      const directional = new THREE.DirectionalLight(0xffffff, 1.15);
      directional.position.set(4.5, 9, 6);
      scene.add(ambient, directional);

      const animation = { id: 0 };

      const tick = () => {
        if (!mounted) return;
        animation.id = requestAnimationFrame(tick);
        controls.update();
        renderer.render(scene, camera);
      };

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !container) return;
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      });

      resizeObserver.observe(container);

      const rect = container.getBoundingClientRect();
      const initialW = Math.max(1, rect.width);
      const initialH = Math.max(1, rect.height);
      camera.aspect = initialW / initialH;
      camera.updateProjectionMatrix();
      renderer.setSize(initialW, initialH, false);

      const candidate: RunningState = {
        THREE,
        animation,
        resizeObserver,
        renderer,
        scene,
        camera,
        controls,
        modelRoot: null,
        raycaster,
        pointer,
        onPointerDown: (_event: PointerEvent) => {},
        selected: null,
        topFacePreviewMesh: null,
      };

      if (!mounted) {
        disposeRunning(candidate, "abort");
        return;
      }

      running = candidate;
      tick();

      candidate.onPointerDown = (event: PointerEvent) => {
        console.log("[Raycaster] Click detected at", event.clientX, event.clientY);
        if (!candidate.modelRoot) return;

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        pointer.y =
          -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(
          candidate.modelRoot.children,
          true,
        );
        console.log("[Raycaster] Intersections found:", intersections.length);
        const firstMeshHit = intersections.find(
          (intersection) => intersection.object instanceof THREE.Mesh,
        );

        if (!firstMeshHit || !(firstMeshHit.object instanceof THREE.Mesh)) {
          console.log("[Raycaster] Missed. Clicked on background.");
          selectionRevision++;
          onElementSelect?.(null);
          return;
        }

        const hitMesh = firstMeshHit.object;
        selectionRevision++;
        console.log("[Raycaster] Hit mesh! ID:", getCanonicalElementId(hitMesh));
        onElementSelect?.(buildBimElementRef(hitMesh));
      };

      container.addEventListener("pointerdown", candidate.onPointerDown);

      const url = modelUrl;
      if (!url) {
        console.error("[ThreeViewer] modelUrl is empty; nothing to load.");
        return;
      }

      try {
        const loader = new GLTFLoaderCtor();
        const gltf = await loader.loadAsync(url);

        if (!mounted || !running) {
          disposeObject3DSubtree(gltf.scene, THREE);
          return;
        }

        clearSelectionState(candidate);
        onElementSelect?.(null);
        candidate.modelRoot = gltf.scene;
        scene.add(gltf.scene);
        const { map: nextMap, catalog } = buildMeshIdMap(gltf.scene, THREE);
        meshById = nextMap;
        onCatalogReady?.(catalog);
        frameObjectInView(gltf.scene, camera, controls);
      } catch (err) {
        console.error("[ThreeViewer] Failed to load model:", url, err);
      }
    })();
  });

  onDestroy(() => {
    mounted = false;
    onElementSelect?.(null);
    if (running) {
      disposeRunning(running, "destroy");
    }
  });
</script>

<!--
  GLTF/GLB from `modelUrl`; `data-model-url` helps quick inspection in DevTools.
-->
<div class="three-viewer-root" bind:this={container} data-model-url={modelUrl}></div>

<style>
  .three-viewer-root {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: transparent;
  }

  .three-viewer-root :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
