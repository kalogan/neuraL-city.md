import * as THREE from 'three';
import type { LayerActivation } from '../types/model';

export class AttentionSystem {
  private lineSegments: THREE.LineSegments | null = null;
  private weights: number[] = [];

  build(layers: LayerActivation[]): THREE.LineSegments {
    const positions: number[] = [];
    const colors: number[] = [];
    this.weights = [];

    layers.forEach((layer, i) => {
      layer.attention.forEach((row, j) => {
        row.forEach((weight, k) => {
          const from = new THREE.Vector3(i * 130 + j * 1.2, 12 + weight * 7, -44);
          const to = new THREE.Vector3((i + 1) * 130 + k * 1.2, 12 + weight * 7, 44);
          positions.push(from.x, from.y, from.z, to.x, to.y, to.z);
          const intensity = 0.3 + weight * 0.7;
          colors.push(intensity * 0.6, 0.2, intensity, intensity * 0.6, 0.2, intensity);
          this.weights.push(weight);
        });
      });
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.lineSegments = new THREE.LineSegments(geometry, material);
    return this.lineSegments;
  }

  update(elapsed: number): void {
    if (!this.lineSegments) return;
    const material = this.lineSegments.material as THREE.LineBasicMaterial;
    material.opacity = 0.5 + 0.2 * Math.sin(elapsed * 0.9);

    const colorAttr = this.lineSegments.geometry.getAttribute('color') as THREE.BufferAttribute;
    for (let i = 0; i < this.weights.length; i += 1) {
      const weight = this.weights[i];
      const pulse = 0.65 + 0.35 * Math.sin(elapsed * 1.2 + i * 0.01 + weight * 4.0);
      const r = (0.35 + weight * 0.35) * pulse;
      const g = 0.12 * pulse;
      const b = (0.85 + weight * 0.15) * pulse;
      colorAttr.setXYZ(i * 2, r, g, b);
      colorAttr.setXYZ(i * 2 + 1, r, g, b);
    }
    colorAttr.needsUpdate = true;
  }

  setVisible(isVisible: boolean): void {
    if (this.lineSegments) this.lineSegments.visible = isVisible;
  }

  dispose(): void {
    if (!this.lineSegments) return;
    this.lineSegments.geometry.dispose();
    (this.lineSegments.material as THREE.Material).dispose();
  }
}
