"""Seed and Disease scans analysed by Gemini (vision).

Gemini looks at the photo and reports what it sees (seed counts by condition, or the crop
problem). Percentages, grades and the germination estimate are then computed here with fixed
rules, so the numbers are consistent and explainable. Results are AI estimates, not lab tests.
"""
from app.models.user import User
from app.services import gemini
from app.services.advisor import LANGUAGES

LANGUAGE_NOTE = "Write every text field (summary, titles, details) in {language}."


class NotTheRightPhoto(ValueError):
    """The photo doesn't show what the scan needs (peanut seeds, or a peanut plant)."""


# ---- Seed ---------------------------------------------------------------------------------

SEED_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "is_peanut_seed_photo": {"type": "BOOLEAN"},
        "healthy": {"type": "INTEGER"},
        "underdeveloped": {"type": "INTEGER"},
        "damaged": {"type": "INTEGER"},
        "diseased": {"type": "INTEGER"},
        "size_uniformity_pct": {"type": "INTEGER"},
        "color_consistency_pct": {"type": "INTEGER"},
        "confidence_pct": {"type": "INTEGER"},
        "summary": {"type": "STRING"},
        "actions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {"title": {"type": "STRING"}, "detail": {"type": "STRING"}},
                "required": ["title", "detail"],
            },
        },
    },
    "required": ["is_peanut_seed_photo", "healthy", "underdeveloped", "damaged", "diseased",
                 "size_uniformity_pct", "color_consistency_pct", "confidence_pct", "summary", "actions"],
}

SEED_PROMPT = """You grade peanut (groundnut) seed lots for farmers in Pakistan from a photo.
Look at every peanut seed/kernel visible and COUNT them by condition:
- healthy: whole, plump, even colour, no marks
- underdeveloped: small, shrivelled or wrinkled
- damaged: broken, split, cracked, chipped, skin badly peeled, or insect holes
- diseased: mould, black/green fuzz, rot, or strong discolouration
Count each seed once, in its worst category. If the photo does not show peanut seeds or kernels,
set is_peanut_seed_photo to false and all counts to 0.
size_uniformity_pct: how similar in size the seeds are (100 = identical).
color_consistency_pct: how even the colour is across seeds (100 = identical).
confidence_pct: how sure you are of the counts (lower for blurry, crowded or overlapping seeds).
summary: one short sentence on the lot's quality for planting.
actions: 2-3 practical next steps for the farmer (title of 2-4 words, one-sentence detail).
{language_note}"""


def _pct(part: int, total: int) -> int:
    return round(100 * part / total) if total else 0


def seed_grade(healthy_pct: int) -> str:
    if healthy_pct >= 85:
        return "A"
    if healthy_pct >= 70:
        return "B"
    if healthy_pct >= 50:
        return "C"
    return "D"


def finish_seed(raw: dict) -> dict:
    if not raw.get("is_peanut_seed_photo"):
        raise NotTheRightPhoto("This photo doesn't show peanut seeds. Take a clear photo of the seeds on a plain surface.")
    counts = {k: max(0, int(raw.get(k) or 0)) for k in ("healthy", "underdeveloped", "damaged", "diseased")}
    total = sum(counts.values())
    if total == 0:
        raise NotTheRightPhoto("No seeds could be counted. Take a clearer, closer photo of the seeds.")
    pcts = {k: _pct(v, total) for k, v in counts.items()}
    # Make the four percentages add up to exactly 100 (rounding).
    pcts["healthy"] += 100 - sum(pcts.values())
    # Visual estimate: healthy seeds usually sprout; shrivelled ones about half the time.
    germination = min(98, round(pcts["healthy"] * 0.95 + pcts["underdeveloped"] * 0.5))
    clamp = lambda v: max(0, min(100, int(v or 0)))  # noqa: E731
    return {
        "total_seeds": total,
        "counts": counts,
        "percentages": pcts,
        "grade": seed_grade(pcts["healthy"]),
        "germination_pct": germination,
        "size_uniformity_pct": clamp(raw.get("size_uniformity_pct")),
        "color_consistency_pct": clamp(raw.get("color_consistency_pct")),
        "confidence_pct": clamp(raw.get("confidence_pct")),
        "summary": str(raw.get("summary") or "").strip(),
        "actions": [
            {"title": str(a.get("title", "")).strip(), "detail": str(a.get("detail", "")).strip()}
            for a in (raw.get("actions") or [])[:3]
        ],
    }


def seed_status(result: dict) -> str:
    return {"A": "Healthy", "B": "Healthy", "C": "Moderate"}.get(result["grade"], "High Risk")


# ---- Disease ------------------------------------------------------------------------------

DISEASE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "is_crop_photo": {"type": "BOOLEAN"},
        "category": {"type": "STRING", "enum": ["healthy", "disease", "pest", "nutrient", "other"]},
        "condition_en": {"type": "STRING"},
        "condition": {"type": "STRING"},
        "confidence_pct": {"type": "INTEGER"},
        "affected_pct": {"type": "INTEGER"},
        "severity_stage": {"type": "INTEGER"},
        "outbreak_risk": {"type": "STRING", "enum": ["low", "medium", "high"]},
        "explanation": {"type": "STRING"},
        "urgent_action": {"type": "STRING"},
        "treatments": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {"title": {"type": "STRING"}, "detail": {"type": "STRING"}},
                "required": ["title", "detail"],
            },
        },
        "prevention": {"type": "STRING"},
    },
    "required": ["is_crop_photo", "category", "condition_en", "condition", "confidence_pct",
                 "affected_pct", "severity_stage", "outbreak_risk", "explanation", "urgent_action",
                 "treatments", "prevention"],
}

DISEASE_PROMPT = """You diagnose peanut (groundnut) crop problems for farmers in the Pothwar region of Pakistan
from a photo of leaves, stems, pods or pests. Common problems there: early leaf spot, late leaf spot, rust,
rosette virus, collar/stem rot, nutrient deficiency (yellowing: nitrogen, iron, sulphur...), drought stress,
and pests such as red hairy caterpillar, armyworm, aphids, thrips, termites and white grubs.
Describe only what is visible. If several are possible, name the most likely and lower confidence_pct.
is_crop_photo: true for a peanut plant or any part of it (leaves, stems, roots, pods), a pest or insect
found in the field (even on bare soil), or a field of the crop. False for anything else.
If the plant looks healthy, category "healthy", severity_stage 0 and outbreak_risk "low".
condition_en: the condition's short name in English (e.g. "Early Leaf Spot", "Red Hairy Caterpillar",
"Nitrogen Deficiency", "Healthy"). condition: the same name in the reply language.
affected_pct: share of the visible foliage affected (0-100).
severity_stage: 0 none, 1 early, 2 moderate, 3 severe, 4 critical.
explanation: 2-3 short sentences on what you see and why you think so.
urgent_action: the single most important thing to do now.
treatments: 2-3 practical steps (title of 2-4 words, one-sentence detail). For sprays give the common
rate and say to follow the product label and check with the local agriculture extension office.
prevention: one sentence.
{language_note}"""


def finish_disease(raw: dict) -> dict:
    if not raw.get("is_crop_photo"):
        raise NotTheRightPhoto("This photo doesn't show a peanut plant. Take a clear, close photo of the affected leaves or plant.")
    clamp = lambda v, hi=100: max(0, min(hi, int(v or 0)))  # noqa: E731
    category = raw.get("category") if raw.get("category") in DISEASE_SCHEMA["properties"]["category"]["enum"] else "other"
    risk = raw.get("outbreak_risk") if raw.get("outbreak_risk") in ("low", "medium", "high") else "medium"
    return {
        "category": category,
        "condition_en": str(raw.get("condition_en") or "Unknown").strip(),
        "condition": str(raw.get("condition") or raw.get("condition_en") or "").strip(),
        "confidence_pct": clamp(raw.get("confidence_pct")),
        "affected_pct": clamp(raw.get("affected_pct")),
        "severity_stage": clamp(raw.get("severity_stage"), 4),
        "outbreak_risk": risk,
        "explanation": str(raw.get("explanation") or "").strip(),
        "urgent_action": str(raw.get("urgent_action") or "").strip(),
        "treatments": [
            {"title": str(a.get("title", "")).strip(), "detail": str(a.get("detail", "")).strip()}
            for a in (raw.get("treatments") or [])[:3]
        ],
        "prevention": str(raw.get("prevention") or "").strip(),
    }


def disease_status(result: dict) -> str:
    if result["category"] == "healthy":
        return "Healthy"
    return "High Risk" if result["outbreak_risk"] == "high" or result["severity_stage"] >= 3 else "Moderate"


# ---- Entry point --------------------------------------------------------------------------

def analyze(kind: str, data: bytes, mime_type: str, language: str, user: User) -> tuple[dict, str, str, float]:
    """Returns (analysis, title, status, confidence 0-100). Raises NotTheRightPhoto or gemini.AIUnavailable."""
    language_note = LANGUAGE_NOTE.format(language=LANGUAGES.get(language, LANGUAGES["en"]))
    location = f" The farm is in {user.farm_location}." if user.farm_location else ""
    image = gemini.Part(data=data, mime_type=mime_type)
    if kind == "seed":
        raw = gemini.generate_json(SEED_PROMPT.format(language_note=language_note) + location, [image], SEED_SCHEMA)
        result = finish_seed(raw)
        return result, f"Seed Lot Grade {result['grade']}", seed_status(result), float(result["confidence_pct"])
    raw = gemini.generate_json(DISEASE_PROMPT.format(language_note=language_note) + location, [image], DISEASE_SCHEMA)
    result = finish_disease(raw)
    title = "Healthy Crop" if result["category"] == "healthy" else f"{result['condition_en']} Detection"
    return result, title, disease_status(result), float(result["confidence_pct"])
