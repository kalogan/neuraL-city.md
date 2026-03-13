import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useAppState } from '../state/appState';

export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private readonly movement = new Set<string>();
  private flyFrom: THREE.Vector3 | null = null;
  private flyTo: THREE.Vector3 | null = null;
  private flyLookAt: THREE.Vector3 | null = null;
  private flyProgress = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1400);
    this.camera.position.set(0, 35, 80);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.rotateSpeed = 0.9;
    this.controls.panSpeed = 0.9;
    this.controls.zoomSpeed = 0.9;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const k = event.key.toLowerCase();
    this.movement.add(k);
    if (k === 'l') useAppState.getState().toggleLayerView();
    if (k === 't') useAppState.getState().toggleTokens();
    if (k === 'escape') this.reset();
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.movement.delete(event.key.toLowerCase());
  };

  update(delta: number): void {
    const speed = 35 * delta;
    if (this.movement.has('w')) this.camera.position.z -= speed;
    if (this.movement.has('s')) this.camera.position.z += speed;
    if (this.movement.has('a')) this.camera.position.x -= speed;
    if (this.movement.has('d')) this.camera.position.x += speed;
    if (this.movement.has('q')) this.camera.position.y -= speed;
    if (this.movement.has('e')) this.camera.position.y += speed;

    if (this.flyFrom && this.flyTo && this.flyLookAt) {
      this.flyProgress = Math.min(1, this.flyProgress + delta * 1.5);
      const t = 1 - Math.pow(1 - this.flyProgress, 3);
      this.camera.position.lerpVectors(this.flyFrom, this.flyTo, t);
      this.controls.target.lerp(this.flyLookAt, Math.min(1, delta * 4));
      if (this.flyProgress >= 1) {
        this.flyFrom = null;
        this.flyTo = null;
      }
    }

    this.controls.update();
  }

  focus(position: THREE.Vector3): void {
    this.flyFrom = this.camera.position.clone();
    this.flyTo = position.clone().add(new THREE.Vector3(10, 12, 12));
    this.flyLookAt = position.clone();
    this.flyProgress = 0;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  reset(): void {
    this.flyFrom = null;
    this.flyTo = null;
    this.camera.position.set(0, 35, 80);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.controls.dispose();
  }
}
