from __future__ import annotations

from dataclasses import dataclass
import random


@dataclass
class LayerPayload:
    layer: int
    neurons: list[float]
    attention: list[list[float]]
    logits: list[str]


def extract_mock_activations(layer_count: int = 8, neurons_per_layer: int = 512) -> list[LayerPayload]:
    layers: list[LayerPayload] = []
    for layer in range(1, layer_count + 1):
        neurons = [round(random.random(), 4) for _ in range(neurons_per_layer)]
        attention = [[round(random.random(), 3) for _ in range(8)] for _ in range(8)]
        logits = random.sample(["fall", "collapse", "decline", "rise", "expand", "stabilize"], 3)
        layers.append(LayerPayload(layer=layer, neurons=neurons, attention=attention, logits=logits))
    return layers
