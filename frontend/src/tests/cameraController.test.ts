import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    target = new THREE.Vector3();
    enableDamping = false;
    mouseButtons = {};
    update = vi.fn();
    dispose = vi.fn();
  }
}));

import { CameraController } from '../core/cameraController';

describe('CameraController', () => {
  it('moves camera with WASD controls', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 800 });
    Object.defineProperty(canvas, 'clientHeight', { value: 600 });

    const controller = new CameraController(canvas);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    controller.update(0.1);

    expect(controller.camera.position.z).toBeLessThan(80);
    controller.dispose();
  });
});
