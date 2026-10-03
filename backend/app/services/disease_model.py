"""PeanutIQ's own trained disease/pest classifier (ml/train_disease.py), run with ONNX Runtime.

The model knows 6 classes: healthy, early/late leaf spot, rust, nutrient deficiency and
caterpillar. It is a basic model: see app/ml/disease_metrics.json for its measured accuracy.
"""
import io
import json
import threading
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

MODEL_DIR = Path(__file__).resolve().parent.parent / "ml"
SIZE = 224

# Display names (English) and the app's categories for each class.
CONDITIONS = {
    "healthy": ("Healthy", "healthy"),
    "early_leaf_spot": ("Early Leaf Spot", "disease"),
    "late_leaf_spot": ("Late Leaf Spot", "disease"),
    "rust": ("Rust", "disease"),
    "nutrient_deficiency": ("Nutrient Deficiency", "nutrient"),
    "caterpillar": ("Red Hairy Caterpillar", "pest"),
}

_lock = threading.Lock()
_session = None
_labels: list[str] | None = None


@dataclass
class Prediction:
    label: str  # e.g. "early_leaf_spot"
    confidence: float  # 0-1
    probabilities: dict[str, float]

    @property
    def condition_en(self) -> str:
        return CONDITIONS[self.label][0]

    @property
    def category(self) -> str:
        return CONDITIONS[self.label][1]


def available() -> bool:
    return (MODEL_DIR / "disease.onnx").exists()


def _load():
    global _session, _labels
    with _lock:
        if _session is None:
            import onnxruntime as ort  # imported lazily: only scans need it

            options = ort.SessionOptions()
            options.intra_op_num_threads = 1
            _session = ort.InferenceSession(str(MODEL_DIR / "disease.onnx"), options, providers=["CPUExecutionProvider"])
            _labels = json.loads((MODEL_DIR / "disease_labels.json").read_text())
    return _session, _labels


def preprocess(data: bytes) -> np.ndarray:
    """Same as training's evaluation transform: resize the short side to 256, centre-crop 224."""
    with Image.open(io.BytesIO(data)) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        w, h = im.size
        scale = (SIZE + 32) / min(w, h)
        im = im.resize((max(SIZE, round(w * scale)), max(SIZE, round(h * scale))), Image.BILINEAR)
        w, h = im.size
        left, top = (w - SIZE) // 2, (h - SIZE) // 2
        im = im.crop((left, top, left + SIZE, top + SIZE))
        x = np.asarray(im, dtype=np.float32) / 255.0
    return x.transpose(2, 0, 1)[None]


def predict(data: bytes) -> Prediction:
    """Raises ValueError if the bytes aren't a readable image."""
    try:
        x = preprocess(data)
    except Exception as e:  # noqa: BLE001 - any decoding problem means "not an image we can read"
        raise ValueError("Unreadable image") from e
    session, labels = _load()
    probs = session.run(None, {"image": x})[0][0]
    best = int(np.argmax(probs))
    return Prediction(labels[best], float(probs[best]), {labels[i]: round(float(p), 4) for i, p in enumerate(probs)})


def metrics() -> dict | None:
    path = MODEL_DIR / "disease_metrics.json"
    return json.loads(path.read_text()) if path.exists() else None
