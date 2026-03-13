import * as THREE from 'three';
import type { TokenInstance } from '../types/model';

export class TokenSystem {
  private readonly group = new THREE.Group();
  private readonly trailGeometry = new THREE.BufferGeometry();
  private readonly trailMaterial = new THREE.PointsMaterial({
    color: '#f59e0b',
    size: 0.34,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  private readonly trailPoints = new THREE.Points(this.trailGeometry, this.trailMaterial);
  private readonly instances = new Map<string, { mesh: THREE.Mesh; data: TokenInstance; index: number; trail: THREE.Vector3[] }>();

  constructor() {
    this.group.add(this.trailPoints);
  }

  upsert(tokens: TokenInstance[]): THREE.Group {
    tokens.forEach((token) => {
      const existing = this.instances.get(token.id);
      if (existing) {
        existing.data = token;
        return;
      }
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 12, 12),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#ea580c', emissiveIntensity: 1.4, metalness: 0.15, roughness: 0.25 })
      );
      mesh.position.set(...token.position);
      this.group.add(mesh);
      this.instances.set(token.id, { mesh, data: token, index: 0, trail: [mesh.position.clone()] });
    });

    return this.group;
  }

  update(delta: number, enabled: boolean): void {
    if (!enabled) return;
    const trailVerts: number[] = [];

    this.instances.forEach((entry) => {
      const { data, mesh, trail } = entry;
      const target = data.path[entry.index % data.path.length];
      const targetVector = new THREE.Vector3(...target);
      mesh.position.lerp(targetVector, Math.min(1, delta * data.speed));
      if (mesh.position.distanceTo(targetVector) < 0.4) {
        entry.index = (entry.index + 1) % data.path.length;
      }

      trail.push(mesh.position.clone());
      if (trail.length > 12) trail.shift();
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.0 + Math.abs(Math.sin(performance.now() * 0.003 + entry.index));

      for (let i = 0; i < trail.length; i += 1) {
        const p = trail[i];
        trailVerts.push(p.x, p.y, p.z);
      }
    });

    this.trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVerts, 3));
    this.trailGeometry.computeBoundingSphere();
  }

  dispose(): void {
    this.instances.forEach(({ mesh }) => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.trailGeometry.dispose();
    this.trailMaterial.dispose();
  }
}
