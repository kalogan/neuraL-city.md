from __future__ import annotations

from activation_extractor import extract_mock_activations


class ModelRunner:
    """Mock runner that can be swapped with real torch model execution."""

    def run_prompt(self, prompt: str) -> dict:
        _ = prompt
        layers = extract_mock_activations(layer_count=12, neurons_per_layer=1500)
        return {
            "layers": [
                {
                    "layer": layer.layer,
                    "neurons": layer.neurons,
                    "attention": layer.attention,
                    "logits": layer.logits,
                }
                for layer in layers
            ]
        }
