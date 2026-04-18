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

  let {
    modelUrl,
    background = 0xf0f0f0,
    onElementSelect,
  }: {
    modelUrl: string;
    background?: number;
    onElementSelect?: (data: Record<string, any> | null) => void;
  } = $props();

  /** Bound container for the canvas and `ResizeObserver` root. */
  let container = $state<HTMLDivElement | undefined>(undefined);

  /**
   * Tracks whether the component is still mounted. Async init checks this after `await import('three')`
   * so we never assign `running` or leak WebGL if the user navigates away mid-setup.
   */
  let mounted = $state(true);

  /** Live viewer handles; assigned only after scene/renderer/controls are ready (model may still be loading). */
  let running:
    | {
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
      }
    | undefined;
  type RunningState = NonNullable<typeof running>;

  function disposeRunning(
    rv: RunningState,
    reason: "destroy" | "abort",
  ) {
    cancelAnimationFrame(rv.animation.id);
    rv.resizeObserver.disconnect();
    container?.removeEventListener("pointerdown", rv.onPointerDown);

    if (rv.selected) {
      rv.selected.mesh.material = rv.selected.originalMaterial;
      const highlights = Array.isArray(rv.selected.highlightMaterial)
        ? rv.selected.highlightMaterial
        : [rv.selected.highlightMaterial];
      for (const highlightMaterial of highlights) {
        highlightMaterial.dispose();
      }
      rv.selected = null;
    }

    rv.controls.dispose();

    // Meshes under `scene` (including loaded GLTF content) release GPU buffers here.
    disposeObject3DSubtree(rv.scene, rv.THREE);

    rv.renderer.dispose();
    rv.renderer.domElement.remove();

    if (reason === "destroy") {
      running = undefined;
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

      /**
       * Frames `root` in view using its world-space bounding box.
       * Keeps near/far sensible for the fitted distance so large/small assets do not clip.
       */
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
      };

      if (!mounted) {
        disposeRunning(candidate, "abort");
        return;
      }

      running = candidate;
      tick();

      function buildSelectionPayload(object: Object3D): Record<string, any> {
        const data = object.userData as Record<string, any> | undefined;
        if (data && Object.keys(data).length > 0) {
          return data;
        }
        return {
          name: object.name || "(unnamed)",
          uuid: object.uuid,
        };
      }

      function clearSelectionState() {
        if (!candidate.selected) return;
        candidate.selected.mesh.material = candidate.selected.originalMaterial;
        const highlights = Array.isArray(candidate.selected.highlightMaterial)
          ? candidate.selected.highlightMaterial
          : [candidate.selected.highlightMaterial];
        for (const highlightMaterial of highlights) {
          highlightMaterial.dispose();
        }
        candidate.selected = null;
      }

      function applyHighlight(mesh: Mesh) {
        const originalMaterial = mesh.material;
        const sourceMaterials = Array.isArray(originalMaterial)
          ? originalMaterial
          : [originalMaterial];

        const highlightMaterials = sourceMaterials.map((sourceMaterial) => {
          const cloned = sourceMaterial.clone();
          const maybeEmissive = (cloned as unknown as { emissive?: import("three").Color }).emissive;
          if (maybeEmissive) {
            maybeEmissive.set(new THREE.Color(0x0055ff));
          }
          return cloned;
        });

        mesh.material = Array.isArray(originalMaterial)
          ? highlightMaterials
          : highlightMaterials[0];

        candidate.selected = {
          mesh,
          originalMaterial,
          highlightMaterial: Array.isArray(originalMaterial)
            ? highlightMaterials
            : highlightMaterials[0],
        };
      }

      candidate.onPointerDown = (event: PointerEvent) => {
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
        const firstMeshHit = intersections.find(
          (intersection) => intersection.object instanceof THREE.Mesh,
        );

        if (!firstMeshHit || !(firstMeshHit.object instanceof THREE.Mesh)) {
          clearSelectionState();
          onElementSelect?.(null);
          return;
        }

        const hitMesh = firstMeshHit.object;
        if (candidate.selected?.mesh !== hitMesh) {
          clearSelectionState();
          applyHighlight(hitMesh);
        }

        onElementSelect?.(buildSelectionPayload(firstMeshHit.object));
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
          // Loaded after teardown: release GPU data for a scene that was never attached.
          disposeObject3DSubtree(gltf.scene, THREE);
          return;
        }

        clearSelectionState();
        onElementSelect?.(null);
        candidate.modelRoot = gltf.scene;
        scene.add(gltf.scene);
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
