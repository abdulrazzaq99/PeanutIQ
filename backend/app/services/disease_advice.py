"""Built-in advice for each class of the trained disease model, used when Gemini is unavailable."""

NAMES = {
    "healthy": {"en": "Healthy", "ur": "صحت مند"},
    "early_leaf_spot": {"en": "Early Leaf Spot", "ur": "ابتدائی پتوں کے دھبے"},
    "late_leaf_spot": {"en": "Late Leaf Spot", "ur": "پچھیتے پتوں کے دھبے"},
    "rust": {"en": "Rust", "ur": "کنگی (رسٹ)"},
    "nutrient_deficiency": {"en": "Nutrient Deficiency", "ur": "غذائی کمی"},
    "caterpillar": {"en": "Red Hairy Caterpillar", "ur": "سرخ بالوں والی سنڈی"},
}

SPRAY_NOTE = {
    "en": "Follow the product label and check with your local agriculture office.",
    "ur": "پروڈکٹ لیبل پر عمل کریں اور مقامی محکمہ زراعت سے مشورہ کریں۔",
}

ADVICE = {
    "healthy": {
        "en": dict(
            explanation="The leaves look green and even, with no clear spots, holes or yellowing.",
            urgent_action="No action needed. Keep checking the crop every week.",
            treatments=[("Keep monitoring", "Look at the lower leaves every week for spots or pests.")],
            prevention="Keep the field weed-free and avoid waterlogging.",
            severity=0, affected=0, risk="low"),
        "ur": dict(
            explanation="پتے سبز اور یکساں نظر آ رہے ہیں، کوئی واضح دھبے، سوراخ یا پیلا پن نہیں۔",
            urgent_action="کسی کارروائی کی ضرورت نہیں۔ ہر ہفتے فصل کا معائنہ کرتے رہیں۔",
            treatments=[("نگرانی جاری رکھیں", "ہر ہفتے نچلے پتوں پر دھبوں یا کیڑوں کو دیکھیں۔")],
            prevention="کھیت کو جڑی بوٹیوں سے پاک رکھیں اور پانی کھڑا نہ ہونے دیں۔",
            severity=0, affected=0, risk="low"),
    },
    "early_leaf_spot": {
        "en": dict(
            explanation="Brown spots with a yellow ring on the leaves are a typical sign of Early Leaf Spot, a fungal disease.",
            urgent_action="Remove badly spotted leaves and plan a fungicide spray this week.",
            treatments=[("Fungicide spray", "Chlorothalonil about 2 ml per litre, repeated after 10-14 days."),
                        ("Field hygiene", "Remove and burn infected plant debris.")],
            prevention="Rotate peanuts with cereals and avoid sowing in the same field every year.",
            severity=2, affected=20, risk="medium"),
        "ur": dict(
            explanation="پتوں پر پیلے گھیرے والے بھورے دھبے ابتدائی پتوں کے دھبوں کی بیماری (پھپھوندی) کی علامت ہیں۔",
            urgent_action="زیادہ متاثرہ پتے ہٹا دیں اور اس ہفتے پھپھوند کش دوا کا اسپرے کریں۔",
            treatments=[("پھپھوند کش اسپرے", "کلوروتھیلونل تقریباً 2 ملی لیٹر فی لیٹر، 10 سے 14 دن بعد دوبارہ۔"),
                        ("کھیت کی صفائی", "متاثرہ پودوں کی باقیات ہٹا کر جلا دیں۔")],
            prevention="مونگ پھلی کے بعد اناج کی فصل لگائیں اور ہر سال ایک ہی کھیت میں کاشت نہ کریں۔",
            severity=2, affected=20, risk="medium"),
    },
    "late_leaf_spot": {
        "en": dict(
            explanation="Dark, almost black round spots, mostly on the underside of leaves, point to Late Leaf Spot, a fungal disease.",
            urgent_action="Spray a fungicide soon; this disease can make leaves fall early and cut the yield.",
            treatments=[("Fungicide spray", "Tebuconazole or chlorothalonil at the label rate, repeated every 10-14 days."),
                        ("Field hygiene", "Remove infected debris after harvest.")],
            prevention="Use crop rotation and clean seed; sow at the recommended spacing for air flow.",
            severity=2, affected=25, risk="high"),
        "ur": dict(
            explanation="پتوں کے نچلے حصے پر گہرے، تقریباً سیاہ گول دھبے پچھیتے پتوں کے دھبوں کی بیماری (پھپھوندی) کی علامت ہیں۔",
            urgent_action="جلد پھپھوند کش اسپرے کریں؛ یہ بیماری پتے جلد گرا کر پیداوار کم کر سکتی ہے۔",
            treatments=[("پھپھوند کش اسپرے", "ٹیبوکونازول یا کلوروتھیلونل لیبل کی مقدار میں، ہر 10 سے 14 دن بعد۔"),
                        ("کھیت کی صفائی", "کٹائی کے بعد متاثرہ باقیات ہٹا دیں۔")],
            prevention="فصلوں کا ہیر پھیر کریں، صاف بیج استعمال کریں اور مناسب فاصلے پر کاشت کریں۔",
            severity=2, affected=25, risk="high"),
    },
    "rust": {
        "en": dict(
            explanation="Small orange-brown powdery pustules on the leaves are a sign of Rust, a fungal disease that spreads in humid weather.",
            urgent_action="Spray a fungicide, especially if humid or rainy weather is expected.",
            treatments=[("Fungicide spray", "Tebuconazole or mancozeb at the label rate."),
                        ("Remove volunteers", "Pull out self-grown peanut plants that carry the disease.")],
            prevention="Sow on time and rotate crops; remove infected plant debris.",
            severity=2, affected=20, risk="medium"),
        "ur": dict(
            explanation="پتوں پر چھوٹے نارنجی بھورے سفوفی دانے کنگی (رسٹ) کی علامت ہیں، جو مرطوب موسم میں پھیلتی ہے۔",
            urgent_action="پھپھوند کش دوا کا اسپرے کریں، خاص طور پر اگر بارش یا نمی متوقع ہو۔",
            treatments=[("پھپھوند کش اسپرے", "ٹیبوکونازول یا مینکوزیب لیبل کی مقدار میں۔"),
                        ("خود رو پودے ہٹائیں", "خود اگنے والے مونگ پھلی کے پودے نکال دیں جو بیماری پھیلاتے ہیں۔")],
            prevention="بروقت کاشت کریں، فصلوں کا ہیر پھیر کریں اور متاثرہ باقیات ہٹائیں۔",
            severity=2, affected=20, risk="medium"),
    },
    "nutrient_deficiency": {
        "en": dict(
            explanation="Yellowing leaves usually mean the plant is short of a nutrient, often nitrogen, iron or sulphur.",
            urgent_action="Check the soil moisture and apply a balanced fertiliser; a soil test shows exactly what is missing.",
            treatments=[("Fertiliser", "Apply gypsum at flowering and a small dose of urea if the whole plant is pale."),
                        ("Iron spray", "If young leaves are yellow with green veins, spray iron sulphate (about 0.5%).")],
            prevention="Get a soil test before sowing and use DAP and gypsum as recommended.",
            severity=1, affected=30, risk="low"),
        "ur": dict(
            explanation="پتوں کا پیلا ہونا عموماً کسی غذائی جز کی کمی ہوتی ہے، اکثر نائٹروجن، آئرن یا سلفر۔",
            urgent_action="زمین کی نمی دیکھیں اور متوازن کھاد ڈالیں؛ مٹی کا ٹیسٹ اصل کمی بتاتا ہے۔",
            treatments=[("کھاد", "پھول آنے پر جپسم ڈالیں، اور اگر پورا پودا پیلا ہو تو تھوڑی یوریا۔"),
                        ("آئرن اسپرے", "اگر نئے پتے سبز رگوں کے ساتھ پیلے ہوں تو آئرن سلفیٹ (تقریباً 0.5%) کا اسپرے کریں۔")],
            prevention="کاشت سے پہلے مٹی کا ٹیسٹ کروائیں اور سفارش کے مطابق ڈی اے پی اور جپسم استعمال کریں۔",
            severity=1, affected=30, risk="low"),
    },
    "caterpillar": {
        "en": dict(
            explanation="A hairy orange caterpillar was found. Red hairy caterpillars eat peanut leaves quickly and move in groups.",
            urgent_action="Check the whole field now; pick off and destroy caterpillars where you see them.",
            treatments=[("Hand picking", "Collect and destroy caterpillars and egg masses on the leaves."),
                        ("Spray if many", "Use a recommended insecticide such as emamectin benzoate at the label rate.")],
            prevention="Deep ploughing in summer exposes the pupae; light traps catch the moths at night.",
            severity=2, affected=10, risk="high"),
        "ur": dict(
            explanation="بالوں والی نارنجی سنڈی پائی گئی۔ سرخ بالوں والی سنڈی مونگ پھلی کے پتے تیزی سے کھاتی ہے اور گروہوں میں پھیلتی ہے۔",
            urgent_action="ابھی پورے کھیت کا معائنہ کریں؛ جہاں سنڈیاں نظر آئیں انہیں پکڑ کر تلف کریں۔",
            treatments=[("ہاتھ سے چننا", "پتوں پر موجود سنڈیاں اور انڈوں کے گچھے جمع کر کے تلف کریں۔"),
                        ("زیادہ ہوں تو اسپرے", "تجویز کردہ کیڑے مار دوا جیسے ایمامیکٹن بینزوایٹ لیبل کی مقدار میں۔")],
            prevention="گرمیوں میں گہرا ہل چلانے سے پیوپا ختم ہوتے ہیں؛ روشنی کے پھندے رات کو پروانے پکڑتے ہیں۔",
            severity=2, affected=10, risk="high"),
    },
}


def built_in(label: str, language: str) -> dict:
    lang = language if language in ("en", "ur") else "en"
    a = ADVICE[label][lang]
    treatments = []
    for title, detail in a["treatments"]:
        if "spray" in title.lower() or "اسپرے" in title:
            detail = f"{detail} {SPRAY_NOTE[lang]}"
        treatments.append({"title": title, "detail": detail})
    return {
        "explanation": a["explanation"],
        "urgent_action": a["urgent_action"],
        "treatments": treatments,
        "prevention": a["prevention"],
        "severity_stage": a["severity"],
        "affected_pct": a["affected"],
        "outbreak_risk": a["risk"],
    }
