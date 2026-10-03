# PeanutIQ disease model

A basic image classifier for peanut (groundnut) leaf problems, used by the Disease scan.

| Class | Meaning |
|---|---|
| `healthy` | No visible problem |
| `early_leaf_spot` | Early leaf spot (fungus) |
| `late_leaf_spot` | Late leaf spot (fungus) |
| `rust` | Rust (fungus); includes "early rust" |
| `nutrient_deficiency` | Yellowing from a missing nutrient |
| `caterpillar` | Red hairy caterpillar (pest) |

**Data**
- Groundnut leaf dataset, Mendeley Data `22p2vcbxfk` v3, CC BY 4.0 (Karnataka, India): 10,361 leaf photos.
- PeanutIQ's own field photos (Pothwar): 293 nutrient deficiency, 60 caterpillar.

**Model:** MobileNetV3-Large pre-trained on ImageNet, fine-tuned on CPU (1 head epoch + 2 full epochs),
exported to ONNX (`backend/app/ml/disease.onnx`, 17 MB). The backend runs it with ONNX Runtime.

**Results** on 2,498 test photos the model never saw (`backend/app/ml/disease_metrics.json`):
98.6% overall; healthy 99.5%, early leaf spot 95.4%, late leaf spot 96.8%, rust 100%,
nutrient deficiency 100%, caterpillar 100%. On PeanutIQ's own held-out photos: 47/47.

**Caveats**
- The public dataset's train and test sets come from the same fields and include augmented copies,
  so these figures are likely higher than real-world accuracy.
- Only 6 caterpillar photos were held out for testing: too few to trust that number.
- The model only knows these 6 classes. Below 50% confidence the backend lets Gemini diagnose instead
  (e.g. other diseases, or photos that aren't leaves).

**Retrain**
```bash
python3.12 -m venv .venv && .venv/bin/pip install torch torchvision onnx onnxruntime pillow "numpy<2"
.venv/bin/python ml/train_disease.py --data <folder with mendeley/ and own/>   # add --resume to continue
```
On a 4-core laptop CPU this takes about 35 minutes.
