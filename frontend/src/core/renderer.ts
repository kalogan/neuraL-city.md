import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import type { GraphicsMode } from '../types/model';

export class Renderer {
  readonly instance: THREE.WebGLRenderer;
  readonly stats: Stats;

  constructor(private container: HTMLElement) {
    this.instance = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(container.clientWidth, container.clientHeight);
    this.instance.info.autoReset = true;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.2;
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.instance.domElement);

    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.top = '8px';
    this.stats.dom.style.right = '8px';
    container.appendChild(this.stats.dom);
  }

  resize(width: number, height: number): void {
    this.instance.setSize(width, height);
  }

  applyGraphicsMode(mode: GraphicsMode): void {
    const shadows = mode !== 'Low';
    this.instance.shadowMap.enabled = shadows;
    this.instance.setPixelRatio(mode === 'Ultra' ? Math.min(window.devicePixelRatio, 2) : mode === 'Low' ? 1 : 1.2);
    this.instance.toneMappingExposure = mode === 'Ultra' ? 1.25 : mode === 'Balanced' ? 1.15 : 1.05;
  }

  dispose(): void {
    this.instance.dispose();
    this.stats.dom.remove();
    this.instance.domElement.remove();
  }
}
