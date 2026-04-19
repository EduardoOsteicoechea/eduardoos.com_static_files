import type { BufferGeometry, Mesh } from "three";
import type { ThreeModule } from "$lib/three/disposeObject3DSubtree";

/**
 * Builds a new geometry containing only triangles whose world-space normals align
 * with +Y or +Z (typical horizontal “top” faces in Y-up / Z-up BIM exports).
 */
export function extractTopFaceGeometry(
	targetMesh: Mesh,
	THREE: ThreeModule,
): BufferGeometry {
	const geom = targetMesh.geometry;
	const posAttr = geom.attributes.position;
	if (!posAttr) {
		return new THREE.BufferGeometry();
	}

	const position = posAttr.array as ArrayLike<number>;
	const index = geom.index;

	const upY = new THREE.Vector3(0, 1, 0);
	const upZ = new THREE.Vector3(0, 0, 1);
	const v0 = new THREE.Vector3();
	const v1 = new THREE.Vector3();
	const v2 = new THREE.Vector3();
	const faceNormal = new THREE.Vector3();
	const worldNormal = new THREE.Vector3();

	targetMesh.updateWorldMatrix(true, false);
	const normalMatrix = new THREE.Matrix3().getNormalMatrix(targetMesh.matrixWorld);

	const outPositions: number[] = [];

	if (index) {
		const idx = index;
		for (let i = 0; i < idx.count; i += 3) {
			const ai = idx.getX(i) * 3;
			const bi = idx.getX(i + 1) * 3;
			const ci = idx.getX(i + 2) * 3;
			v0.fromArray(position, ai);
			v1.fromArray(position, bi);
			v2.fromArray(position, ci);
			THREE.Triangle.getNormal(v0, v1, v2, faceNormal);
			worldNormal.copy(faceNormal).applyMatrix3(normalMatrix).normalize();
			if (worldNormal.dot(upY) > 0.99 || worldNormal.dot(upZ) > 0.99) {
				outPositions.push(
					v0.x,
					v0.y,
					v0.z,
					v1.x,
					v1.y,
					v1.z,
					v2.x,
					v2.y,
					v2.z,
				);
			}
		}
	} else {
		for (let i = 0; i < position.length; i += 9) {
			v0.fromArray(position, i);
			v1.fromArray(position, i + 3);
			v2.fromArray(position, i + 6);
			THREE.Triangle.getNormal(v0, v1, v2, faceNormal);
			worldNormal.copy(faceNormal).applyMatrix3(normalMatrix).normalize();
			if (worldNormal.dot(upY) > 0.99 || worldNormal.dot(upZ) > 0.99) {
				outPositions.push(
					v0.x,
					v0.y,
					v0.z,
					v1.x,
					v1.y,
					v1.z,
					v2.x,
					v2.y,
					v2.z,
				);
			}
		}
	}

	const out = new THREE.BufferGeometry();
	out.setAttribute(
		'position',
		new THREE.Float32BufferAttribute(new Float32Array(outPositions), 3),
	);
	if (outPositions.length > 0) {
		out.computeVertexNormals();
	}
	return out;
}

/**
 * Total surface area of a triangle mesh: sum of ½‖(v₁−v₀)×(v₂−v₀)‖ per triangle.
 */
export function calculateFaceArea(geometry: BufferGeometry, THREE: ThreeModule): number {
	const posAttr = geometry.attributes.position;
	if (!posAttr) return 0;

	const position = posAttr.array as ArrayLike<number>;
	const index = geometry.index;

	const v0 = new THREE.Vector3();
	const v1 = new THREE.Vector3();
	const v2 = new THREE.Vector3();
	const ab = new THREE.Vector3();
	const ac = new THREE.Vector3();
	const cross = new THREE.Vector3();

	let total = 0;

	if (index) {
		const idx = index;
		for (let i = 0; i < idx.count; i += 3) {
			const ai = idx.getX(i) * 3;
			const bi = idx.getX(i + 1) * 3;
			const ci = idx.getX(i + 2) * 3;
			v0.fromArray(position, ai);
			v1.fromArray(position, bi);
			v2.fromArray(position, ci);
			ab.subVectors(v1, v0);
			ac.subVectors(v2, v0);
			cross.crossVectors(ab, ac);
			total += 0.5 * cross.length();
		}
	} else {
		for (let i = 0; i < position.length; i += 9) {
			v0.fromArray(position, i);
			v1.fromArray(position, i + 3);
			v2.fromArray(position, i + 6);
			ab.subVectors(v1, v0);
			ac.subVectors(v2, v0);
			cross.crossVectors(ab, ac);
			total += 0.5 * cross.length();
		}
	}

	return total;
}


