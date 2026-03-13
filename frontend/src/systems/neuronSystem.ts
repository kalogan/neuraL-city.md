import * as THREE from 'three';
import type { LayerActivation } from '../types/model';

const MAX_PER_LAYER = 10_000;

export class NeuronSystem {
  private readonly baseMaterial = new THREE.MeshStandardMaterial({
    color: '#0ea5e9',
    emissive: '#1d4ed8',
    emissiveIntensity: 0.8,
    metalness: 0.35,
    roughness: 0.25,
    transparent: true,
    opacity: 0.92
  });
  private readonly geometry = new THREE.BoxGeometry(0.8, 1, 0.8);
  private readonly layerMeshes: THREE.InstancedMesh[] = [];
  private readonly layerData = new Map<number, LayerActivation>();
  private readonly selectedOverlays = new Map<string, THREE.Mesh>();

  build(layers: LayerActivation[]): THREE.Group {
    const group = new THREE.Group();
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    layers.forEach((layerData, layerIndex) => {
      this.layerData.set(layerData.layer, layerData);
      const count = Math.min(layerData.neurons.length, MAX_PER_LAYER);
      const mesh = new THREE.InstancedMesh(this.geometry, this.baseMaterial.clone(), count);
      mesh.frustumCulled = true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      for (let i = 0; i < count; i += 1) {
        const activation = layerData.neurons[i] ?? 0;
        const height = 1 + activation * 12;
        const x = (i % 100) - 50;
        const z = Math.floor(i / 100) - 50;
        const y = height / 2;
        matrix.compose(new THREE.Vector3(x + layerIndex * 130, y, z), new THREE.Quaternion(), new THREE.Vector3(1, height, 1));
        mesh.setMatrixAt(i, matrix);
        color.setHSL(0.57 - activation * 0.1, 0.85, 0.42 + activation * 0.25);
        mesh.setColorAt(i, color);
      }

      mesh.userData.layer = layerData.layer;
      mesh.userData.layerIndex = layerIndex;
      this.layerMeshes.push(mesh);
      group.add(mesh);
    });

    return group;
  }

  setLod(cameraDistance: number): void {
    this.layerMeshes.forEach((mesh) => {
      mesh.visible = cameraDistance < 700;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.wireframe = cameraDistance > 380;
      material.emissiveIntensity = cameraDistance > 420 ? 0.55 : 0.95;
    });
  }

  updateAnimation(elapsed: number): void {
    this.layerMeshes.forEach((mesh) => {
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.75 + 0.2 * Math.sin(elapsed * 1.3 + (mesh.userData.layerIndex ?? 0));
    });

    this.selectedOverlays.forEach((overlay) => {
      const material = overlay.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.abs(Math.sin(elapsed * 2.5)) * 0.35;
    });
  }

  highlightNeuron(layer: number, index: number, scene: THREE.Scene): void {
    const key = `${layer}:${index}`;
    this.selectedOverlays.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.selectedOverlays.clear();

    const target = this.layerMeshes.find((m) => m.userData.layer === layer);
    if (!target) return;
    const matrix = new THREE.Matrix4();
    target.getMatrixAt(index, matrix);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);

    const overlay = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.05, 0.95),
      new THREE.MeshBasicMaterial({ color: '#7dd3fc', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
    );
    overlay.position.copy(position);
    overlay.scale.copy(scale);
    overlay.quaternion.copy(quaternion);

    this.selectedOverlays.set(key, overlay);
    scene.add(overlay);
  }

  getNeuronPosition(layer: number, index: number): THREE.Vector3 | null {
    const target = this.layerMeshes.find((m) => m.userData.layer === layer);
    if (!target) return null;
    const matrix = new THREE.Matrix4();
    target.getMatrixAt(index, matrix);
    const position = new THREE.Vector3();
    matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
    return position;
  }

  dispose(): void {
    this.geometry.dispose();
    this.layerMeshes.forEach((mesh) => {
      (mesh.material as THREE.Material).dispose();
    });
    this.selectedOverlays.forEach((mesh) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.selectedOverlays.clear();
  }
}
