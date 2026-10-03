"""Train PeanutIQ's basic peanut disease/pest classifier and export it to ONNX.

Data (not in the repo):
  <data>/mendeley/Groundnut_Leaf_dataset/{train,test}/<class>_1/*.jpg
      Groundnut leaf dataset, Mendeley Data 22p2vcbxfk v3 (CC BY 4.0), Karnataka, India.
  <data>/own/{nutrient_deficiency,caterpillar}/*.jpg
      PeanutIQ's own field photos (Pothwar), converted from HEIC.

Model: MobileNetV3-Large pre-trained on ImageNet, fine-tuned (head first, then the whole net).
Output: backend/app/ml/disease.onnx (+ disease_labels.json, disease_metrics.json).

Usage: python ml/train_disease.py --data ~/Documents/PeanutIQ-ML/data
"""
import argparse
import hashlib
import json
import random
import time
from collections import Counter
from pathlib import Path

import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler
from torchvision import models, transforms

CLASSES = ["healthy", "early_leaf_spot", "late_leaf_spot", "rust", "nutrient_deficiency", "caterpillar"]
MENDELEY = {
    "healthy_leaf_1": "healthy",
    "early_leaf_spot_1": "early_leaf_spot",
    "late_leaf_spot_1": "late_leaf_spot",
    "rust_1": "rust",
    "early_rust_1": "rust",  # one "rust" class is enough for advice
    "nutrition_deficiency_1": "nutrient_deficiency",
}
MEAN, STD = [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]
SIZE = 224


def _bucket(name: str) -> float:
    """Stable 0-1 value per file, so splits don't change between runs."""
    return int(hashlib.md5(name.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF


def collect(data: Path):
    split = {"train": [], "val": [], "test": []}
    root = data / "mendeley" / "Groundnut_Leaf_dataset"
    for folder, label in MENDELEY.items():
        y = CLASSES.index(label)
        for f in sorted((root / "train" / folder).glob("*")):
            split["val" if _bucket(f.name) < 0.1 else "train"].append((f, y, "mendeley"))
        for f in sorted((root / "test" / folder).glob("*")):
            split["test"].append((f, y, "mendeley"))
    for label in ("nutrient_deficiency", "caterpillar"):
        y = CLASSES.index(label)
        for f in sorted((data / "own" / label).glob("*.jpg")):
            b = _bucket(f.name)
            split["test" if b < 0.15 else "val" if b < 0.3 else "train"].append((f, y, "own"))
    return split


class Images(Dataset):
    def __init__(self, items, tf):
        self.items, self.tf = items, tf

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        path, y, _ = self.items[i]
        with Image.open(path) as im:
            return self.tf(im.convert("RGB")), y


TRAIN_TF = transforms.Compose([
    transforms.RandomResizedCrop(SIZE, scale=(0.55, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(0.25, 0.25, 0.2, 0.03),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])
EVAL_TF = transforms.Compose([
    transforms.Resize(SIZE + 32),
    transforms.CenterCrop(SIZE),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])


def evaluate(model, loader):
    model.eval()
    preds, ys = [], []
    with torch.no_grad():
        for x, y in loader:
            preds += model(x).argmax(1).tolist()
            ys += y.tolist()
    return preds, ys


def report(preds, ys, items):
    n = len(CLASSES)
    confusion = [[0] * n for _ in range(n)]
    for p, y in zip(preds, ys):
        confusion[y][p] += 1
    per_class = {
        CLASSES[c]: round(confusion[c][c] / max(1, sum(confusion[c])), 3) for c in range(n) if sum(confusion[c])
    }
    out = {"accuracy": round(sum(p == y for p, y in zip(preds, ys)) / max(1, len(ys)), 3),
           "per_class_accuracy": per_class, "confusion": confusion, "count": len(ys)}
    own = [(p, y) for p, y, it in zip(preds, ys, items) if it[2] == "own"]
    if own:
        out["own_photos_accuracy"] = round(sum(p == y for p, y in own) / len(own), 3)
        out["own_photos_count"] = len(own)
    return out


def train_epochs(model, loader, val_loader, params, epochs, lr, log, checkpoint=None, stage=""):
    """Trains, keeping the best model on validation. After every epoch the best model so far is
    saved to `checkpoint`, so an interrupted run can resume with --resume."""
    opt = torch.optim.AdamW(params, lr=lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs * len(loader))
    loss_fn = nn.CrossEntropyLoss(label_smoothing=0.05)
    best, best_state = -1.0, None
    for epoch in range(epochs):
        model.train()
        t, seen, total = time.time(), 0, 0.0
        for i, (x, y) in enumerate(loader):
            opt.zero_grad()
            loss = loss_fn(model(x), y)
            loss.backward()
            opt.step()
            sched.step()
            seen += len(y)
            total += loss.item() * len(y)
            if i % 50 == 0:
                log(f"  epoch {epoch + 1} batch {i}/{len(loader)} loss {total / seen:.3f} ({seen / (time.time() - t):.0f} img/s)")
        preds, ys = evaluate(model, val_loader)
        acc = sum(p == y for p, y in zip(preds, ys)) / len(ys)
        log(f"epoch {epoch + 1}/{epochs}: train loss {total / seen:.3f}, val accuracy {acc:.3f}, {time.time() - t:.0f}s")
        if acc > best:
            best, best_state = acc, {k: v.clone() for k, v in model.state_dict().items()}
        if checkpoint is not None:
            torch.save({"stage": stage, "epochs_done": epoch + 1, "best_val": best, "state": best_state}, checkpoint)
            log(f"checkpoint saved ({stage}, epoch {epoch + 1})")
    model.load_state_dict(best_state)
    return best


class Exported(nn.Module):
    """Takes RGB in 0-1 (1x3x224x224), returns class probabilities."""

    def __init__(self, net):
        super().__init__()
        self.net = net
        self.register_buffer("mean", torch.tensor(MEAN).view(1, 3, 1, 1))
        self.register_buffer("std", torch.tensor(STD).view(1, 3, 1, 1))

    def forward(self, x):
        return torch.softmax(self.net((x - self.mean) / self.std), dim=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, required=True)
    ap.add_argument("--out", type=Path, default=Path(__file__).resolve().parent.parent / "backend" / "app" / "ml")
    ap.add_argument("--head-epochs", type=int, default=2)
    ap.add_argument("--fine-epochs", type=int, default=3)
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--checkpoint", type=Path, default=Path("disease_checkpoint.pt"))
    ap.add_argument("--resume", action="store_true", help="continue from --checkpoint")
    args = ap.parse_args()
    torch.manual_seed(0)
    random.seed(0)
    torch.set_num_threads(max(1, torch.get_num_threads()))
    log = lambda m: print(m, flush=True)  # noqa: E731

    split = collect(args.data.expanduser())
    for name, items in split.items():
        log(f"{name}: {len(items)} images, {dict(Counter(CLASSES[y] for _, y, _ in items))}")

    # Balance the classes (caterpillar has very few photos) by sampling.
    counts = Counter(y for _, y, _ in split["train"])
    weights = [1.0 / counts[y] for _, y, _ in split["train"]]
    sampler = WeightedRandomSampler(weights, num_samples=len(weights), replacement=True)
    train_loader = DataLoader(Images(split["train"], TRAIN_TF), batch_size=32, sampler=sampler,
                              num_workers=args.workers, persistent_workers=True)
    val_loader = DataLoader(Images(split["val"], EVAL_TF), batch_size=64, num_workers=args.workers)
    test_loader = DataLoader(Images(split["test"], EVAL_TF), batch_size=64, num_workers=args.workers)

    net = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
    net.classifier[3] = nn.Linear(net.classifier[3].in_features, len(CLASSES))

    done = {"stage": "", "epochs_done": 0, "best_val": 0.0}
    if args.resume and args.checkpoint.exists():
        done = torch.load(args.checkpoint)
        net.load_state_dict(done["state"])
        log(f"resumed from {args.checkpoint}: {done['stage']} epoch {done['epochs_done']}, val {done['best_val']:.3f}")

    if done["stage"] != "fine":
        remaining = args.head_epochs - (done["epochs_done"] if done["stage"] == "head" else 0)
        if remaining > 0:
            log("stage 1: train the new head (backbone frozen)")
            for p in net.features.parameters():
                p.requires_grad = False
            train_epochs(net, train_loader, val_loader, [p for p in net.parameters() if p.requires_grad],
                         remaining, 1e-3, log, args.checkpoint, "head")
        done = {"stage": "fine", "epochs_done": 0, "best_val": 0.0}

    log("stage 2: fine-tune the whole network")
    for p in net.parameters():
        p.requires_grad = True
    remaining = args.fine_epochs - done["epochs_done"]
    best_val = done["best_val"]
    if remaining > 0:
        best_val = max(best_val, train_epochs(net, train_loader, val_loader, net.parameters(), remaining, 2e-4, log,
                                              args.checkpoint, "fine"))

    preds, ys = evaluate(net, test_loader)
    metrics = {"validation_accuracy": round(best_val, 3), "test": report(preds, ys, split["test"]),
               "classes": CLASSES, "model": "mobilenet_v3_large (ImageNet) fine-tuned", "input_size": SIZE,
               "trained_at": time.strftime("%Y-%m-%d %H:%M"),
               "data": {k: len(v) for k, v in split.items()}}
    log(json.dumps(metrics["test"], indent=1))

    args.out.mkdir(parents=True, exist_ok=True)
    exported = Exported(net).eval()
    onnx_path = args.out / "disease.onnx"
    torch.onnx.export(exported, torch.rand(1, 3, SIZE, SIZE), onnx_path, input_names=["image"],
                      output_names=["probabilities"], opset_version=17)
    (args.out / "disease_labels.json").write_text(json.dumps(CLASSES))
    (args.out / "disease_metrics.json").write_text(json.dumps(metrics, indent=1))

    # The ONNX file must give the same answers as PyTorch.
    import numpy as np
    import onnxruntime as ort
    sess = ort.InferenceSession(str(onnx_path))
    x = torch.rand(2, 3, SIZE, SIZE)
    diff = max(abs(float(a) - float(b)) for a, b in zip(
        exported(x[:1]).detach().numpy().ravel(), sess.run(None, {"image": x[:1].numpy()})[0].ravel()))
    log(f"exported {onnx_path} ({onnx_path.stat().st_size / 1e6:.1f} MB); max torch/onnx difference {diff:.2e}")
    assert diff < 1e-3 and np.isfinite(diff)


if __name__ == "__main__":
    main()
