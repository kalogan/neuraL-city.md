import * as THREE from "three";
import { Renderer } from "./core/renderer";
import { SceneManager } from "./core/sceneManager";
import { CameraController } from "./core/cameraController";

import { SetupGlobalErrorHandling } from "./systems/errorHandler";
import { NeuronSystem } from "./systems/neuronSystem";
import { TokenSystem } from "./systems/tokenSystem";
import { AttentionSystem } from "./systems/attentionSystem";
import { CircuitSystem } from "./systems/circuitSystem";

import { createPromptPanel } from "./ui/promptPanel";
import { createMessagePanel } from "./ui/messagePanel";
import { createTimeTravelPanel } from "./ui/timeTravelPanel";

import { useAppState } from "./state/appState";
import { ApiClient } from "./data/apiClient";

SetupGlobalErrorHandling();

const root = document.getElementById("app");
if (!root) throw new Error("Missing app root");

root.className = "h-screen w-screen relative";

const canvas = document.createElement("canvas");
canvas.className = "absolute inset-0";
root.appendChild(canvas);

const renderer = new Renderer(canvas);
renderer.instance.domElement.classList.add("pointer-events-auto");

const sceneManager = new SceneManager();
const cameraController = new CameraController(renderer.instance.domElement);

const neuronSystem = new NeuronSystem();
const tokenSystem = new TokenSystem();
const attentionSystem = new AttentionSystem();
const circuitSystem = new CircuitSystem();

sceneManager.scene.add(neuronSystem.group);
sceneManager.scene.add(tokenSystem.group);
sceneManager.scene.add(attentionSystem.group);
sceneManager.scene.add(circuitSystem.group);

const client = new ApiClient("");

async function boot() {
  const response = await client.fetchActivation("initial prompt");

  const neurons = neuronSystem.build(response.layers);
  const attention = attentionSystem.build(response.layers);
  const circuits = circuitSystem.build(response.layers);

  sceneManager.scene.add(neurons, attention, circuits);

  useAppState.getState().setLayers(response.layers);
}

boot().catch(err => console.error("Boot failed", err));

root.appendChild(createPromptPanel());
root.appendChild(createMessagePanel());
root.appendChild(createTimeTravelPanel());

const clock = new THREE.Clock();

function render() {
  const delta = clock.getDelta();

  neuronSystem.update(delta);
  tokenSystem.update(delta);
  attentionSystem.update(delta);
  circuitSystem.update(delta);

  renderer.instance.render(sceneManager.scene, cameraController.camera);
  requestAnimationFrame(render);
}

render();