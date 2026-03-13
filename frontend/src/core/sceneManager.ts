import * as THREE from 'three';

export class SceneManager {
  readonly scene = new THREE.Scene();
  private readonly clock = new THREE.Clock();
  private residualGrid: THREE.Mesh | null = null;

  constructor() {
    this.scene.background = new THREE.Color('#02030b');
    this.scene.fog = new THREE.FogExp2('#090a1a', 0.0032);

    const hemi = new THREE.HemisphereLight('#67e8f9', '#0b1120', 0.35);
    const ambient = new THREE.AmbientLight('#60a5fa', 0.25);
    const key = new THREE.DirectionalLight('#a78bfa', 1.1);
    key.position.set(35, 55, 25);
    const rim = new THREE.PointLight('#22d3ee', 2.2, 300, 2);
    rim.position.set(0, 35, -20);

    this.scene.add(hemi, ambient, key, rim);
    this.createResidualStreamGrid();
  }

  private createResidualStreamGrid(): void {
    const geometry = new THREE.PlaneGeometry(1400, 1400, 1, 1);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color('#0ea5e9') },
        uColorB: { value: new THREE.Color('#22d3ee') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec2 vUv;

        float grid(vec2 uv, float scale) {
          vec2 g = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
          float l = min(g.x, g.y);
          return 1.0 - min(l, 1.0);
        }

        void main() {
          vec2 uv = vUv * 6.0;
          float baseGrid = grid(uv, 16.0);
          float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + (vUv.x + vUv.y) * 22.0);
          vec3 color = mix(uColorA, uColorB, pulse);
          float alpha = baseGrid * (0.07 + 0.08 * pulse);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    this.residualGrid = new THREE.Mesh(geometry, material);
    this.residualGrid.rotation.x = -Math.PI / 2;
    this.residualGrid.position.y = 0.03;
    this.scene.add(this.residualGrid);
  }

  updateVisuals(): void {
    const t = this.clock.getElapsedTime();
    if (this.residualGrid) {
      const material = this.residualGrid.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = t;
    }
  }

  dispose(): void {
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
    });
  }
}
