import type { Material, Mesh, Object3D } from 'three';

/** Runtime module shape returned by `import('three')` — passed in so `instanceof` matches loaded meshes. */
export type ThreeModule = typeof import('three');

/**
 * Disposes GPU resources for every Mesh under `root` (geometries, materials, and embedded textures).
 * Safe to call before removing the WebGLRenderer; call `renderer.dispose()` after this.
 */
export function disposeObject3DSubtree(root: Object3D, THREE: ThreeModule): void {
	root.traverse((object) => {
		if (!(object instanceof THREE.Mesh)) return;
		const mesh = object as Mesh;
		mesh.geometry?.dispose();

		const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
		for (const material of materials) {
			if (!material) continue;
			disposeMaterialAndTextures(material, THREE);
		}
	});
}

function disposeMaterialAndTextures(material: Material, THREE: ThreeModule): void {
	// Walk own enumerable keys; dispose textures (and similar GPU resources) before the material itself.
	for (const key of Object.keys(material)) {
		if (key === 'dispose') continue;
		const value = (material as unknown as Record<string, unknown>)[key];
		if (value instanceof THREE.Texture) {
			value.dispose();
		}
	}
	material.dispose();
}
