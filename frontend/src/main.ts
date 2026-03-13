import * as THREE from 'three';
import { Renderer } from './core/renderer';
import { SceneManager } from './core/sceneManager';
import { CameraController } from './core/cameraController';
import { setupGlobalErrorHandling, withRenderGuard } from './core/errorHandler';
import { NeuronSystem } from './systems/neuronSystem';
import { TokenSystem } from './systems/tokenSystem';
import { AttentionSystem } from './systems/attentionSystem';
import { CircuitSystem } from './systems/circuitSystem';
import { createPromptPanel } from './ui/promptPanel';
import { createInspectorPanel } from './ui/inspectorPanel';
import { createTimelinePanel } from './ui/timelinePanel';
import { useAppState } from './state/appState';
import { ApiClient } from './data/apiClient';

const app = document.getElementById('app');
if (!app) throw new Error('Missing app root');

app.className = 'h-screen w-screen relative';
const canvasHost = document.createElement('div');
canvasHost.className = 'absolute inset-0 z-0 pointer-events-none';
app.appendChild(canvasHost);

const hud = document.createElement('div');
hud.className = 'absolute bottom-0 left-0 right-0 z-20 p-3 flex gap-3 transition-all duration-300';
app.appendChild(hud);

const message = document.createElement('div');
message.className = 'absolute top-16 right-3 z-30 bg-red-500/90 px-3 py-2 rounded hidden';
app.appendChild(message);

setupGlobalErrorHandling((text) => {
  message.textContent = text;
  message.classList.remove('hidden');
});

const renderer = new Renderer(canvasHost);
renderer.instance.domElement.classList.add('pointer-events-auto');
const sceneManager = new SceneManager();
const cameraController = new CameraController(renderer.instance.domElement);
const neuronSystem = new NeuronSystem();
const tokenSystem = new TokenSystem();
const attentionSystem = new AttentionSystem();
const circuitSystem = new CircuitSystem();

sceneManager.scene.add(neuronSystem.build([]));
sceneManager.scene.add(tokenSystem.upsert([]));

const hoverMarker = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#22d3ee', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
);
hoverMarker.visible = false;
sceneManager.scene.add(hoverMarker);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const client = new ApiClient('/api');
const boot = async (): Promise<void> => {
  const response = await client.fetchActivation('initial prompt');
  const neurons = neuronSystem.build(response.layers);
  const attention = attentionSystem.build(response.layers);
  const circuits = circuitSystem.build(response.layers.length);
  const tokens = tokenSystem.upsert(
    response.layers.slice(0, 12).map((layer, i) => ({
      id: `token-${i}`,
      text: layer.logits[0] ?? 'token',
      position: [i * 3, 2, 0],
      path: [[i * 130, 2, -35], [i * 130, 2, 35]],
      speed: 1 + (i % 4)
    }))
  );

  sceneManager.scene.add(neurons, attention, circuits, tokens);
  useAppState.getState().setLayers(response.layers);
};

boot().catch((error) => console.error('Boot failed', error));

const updatePointer = (event: MouseEvent): void => {
  const rect = renderer.instance.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
};

renderer.instance.domElement.addEventListener('pointermove', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, cameraController.camera);
  const hits = raycaster.intersectObjects(sceneManager.scene.children, true);
  const first = hits.find((hit) => hit.instanceId !== undefined);
  if (!first) {
    hoverMarker.visible = false;
    renderer.instance.domElement.style.cursor = 'default';
    return;
  }

  hoverMarker.visible = true;
  hoverMarker.position.copy(first.point);
  renderer.instance.domElement.style.cursor = 'pointer';
});

renderer.instance.domElement.addEventListener('click', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, cameraController.camera);

  const hits = raycaster.intersectObjects(sceneManager.scene.children, true);
  const first = hits.find((hit) => hit.instanceId !== undefined);
  if (first?.instanceId !== undefined) {
    const layer = first.object.userData.layer ?? 0;
    const layers = useAppState.getState().layers;
    const activation = layers[layer - 1]?.neurons[first.instanceId] ?? 0;
    useAppState.getState().selectNeuron({ layer, index: first.instanceId, activation });
    neuronSystem.highlightNeuron(layer, first.instanceId, sceneManager.scene);
    cameraController.focus(first.point.clone());
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'f') {
    const selected = useAppState.getState().selectedNeuron;
    if (selected) {
      const position = neuronSystem.getNeuronPosition(selected.layer, selected.index);
      if (position) cameraController.focus(position);
    }
  }
  if (event.key.toLowerCase() === 'g') {
    const modes = ['Ultra', 'High', 'Balanced', 'Low'] as const;
    const current = useAppState.getState().graphicsMode;
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    useAppState.getState().setGraphicsMode(next);
    renderer.applyGraphicsMode(next);
  }
});

app.appendChild(createPromptPanel(() => message.classList.add('hidden')));
hud.append(createInspectorPanel(), createTimelinePanel());

const clock = new THREE.Clock();
let frame = 0;
const render = (): void => {
  renderer.stats.begin();
  withRenderGuard(() => {
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;
    cameraController.update(delta);
    sceneManager.updateVisuals();
    neuronSystem.updateAnimation(elapsed);
    tokenSystem.update(delta, useAppState.getState().showTokens && useAppState.getState().graphicsMode !== 'Low');
    attentionSystem.update(elapsed);
    attentionSystem.setVisible(useAppState.getState().showAttention);
    neuronSystem.setLod(cameraController.camera.position.length());

    frame += 1;
    const adaptiveSkip = useAppState.getState().graphicsMode === 'Low' ? 2 : 1;
    if (frame % adaptiveSkip === 0) {
      renderer.instance.render(sceneManager.scene, cameraController.camera);
    }
  }, (text) => {
    message.textContent = text;
    message.classList.remove('hidden');
  });
  renderer.stats.end();
  requestAnimationFrame(render);
};
render();

window.addEventListener('resize', () => {
  renderer.resize(canvasHost.clientWidth, canvasHost.clientHeight);
  cameraController.resize(canvasHost.clientWidth, canvasHost.clientHeight);
});

window.addEventListener('beforeunload', () => {
  tokenSystem.dispose();
  neuronSystem.dispose();
  attentionSystem.dispose();
  circuitSystem.dispose();
  cameraController.dispose();
  sceneManager.dispose();
  renderer.dispose();
});
