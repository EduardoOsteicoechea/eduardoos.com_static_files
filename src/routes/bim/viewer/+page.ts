import type { PageLoad } from './$types';

/** Client-only page: Three.js / WebGL must never run during SSR for this route. */
export const ssr = false;

export const load: PageLoad = async () => {
	return {
		/** Placeholder until GLTF/GLB loading is implemented; safe to point at a future static asset. */
		modelUrl: '/sample-model-slab-only.glb',
		title: 'BIM · 3D Viewer',
	};
};
