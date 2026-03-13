import * as THREE from 'three';

export class CircuitSystem {
  private readonly group = new THREE.Group();

  build(layerCount: number): THREE.Group {
    const material = new THREE.LineDashedMaterial({ color: '#22d3ee', dashSize: 2, gapSize: 1 });
    for (let i = 0; i < layerCount; i += 1) {
      const points = [
        new THREE.Vector3(i * 130, 0.2, -60),
        new THREE.Vector3(i * 130, 0.2, 60)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material.clone());
      line.computeLineDistances();
      this.group.add(line);
    }
    return this.group;
  }

  dispose(): void {
    this.group.traverse((obj) => {
      const line = obj as THREE.Line;
      if (line.geometry) line.geometry.dispose();
      if (line.material) (line.material as THREE.Material).dispose();
    });
  }
}
