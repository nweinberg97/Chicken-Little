"""Convert verified research JSON into the app's data module, applying fact-check corrections."""
import json, sys

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))

# --- source fixes ---
d["sources"] = [s for s in d["sources"] if s["id"] != "hlbc-choking-topic"]  # URL resolved to a search page
for s in d["sources"]:
    if s["id"] == "usda-wic-guidelines":
        s["url"] = "https://wicworks.fna.usda.gov/sites/default/files/media/document/Guidelines_for_Feeding_Healthy_Infants_Job_Aid.pdf"

def drop(ids, *bad):
    return [i for i in ids if i not in bad and i != "hlbc-choking-topic"]

# --- general fixes ---
for g in d["general"]:
    g["sourceIds"] = drop(g["sourceIds"])
    t = g["text"]
    if g["topic"] == "vitamin-d":
        g["text"] = ("Canadian guidance recommends a daily 400 IU vitamin D supplement for babies who are breastfed "
                     "or receive breast milk. Babies fed only store-bought infant formula don't need one.")
    if g["topic"] == "fish-mercury" and "75 g" in t:
        g["text"] = ("Choose fish lower in mercury, such as salmon, trout, sole, cod, pollock, halibut, herring, mackerel, "
                     "sardines and canned light tuna. For children 12 to 24 months, Health Canada says to avoid fresh or frozen "
                     "tuna, shark, swordfish, marlin, orange roughy and escolar, or limit them to 75 g a month.")
    if g["topic"] == "emergency" and "first-aid" in t:
        g["text"] = ("Parents and caregivers are encouraged to learn choking first aid. Go to the emergency room or call 9-1-1 "
                     "if coughing continues, or if retching, vomiting or wheezing develops.")
    if g["topic"] == "food-safety":
        g["sourceIds"] = drop(g["sourceIds"], "usda-cacfp-solids")
    if g["topic"] == "allergen-introduction" and "eczema or an egg allergy" in t:
        g["sourceIds"] = drop(g["sourceIds"], "usda-wic-starting-solids")
    if g["topic"] == "textures" and "no later than 9 months" in t:
        g["sourceIds"] = ["hc-6-24", "hlbc-first-foods-pdf"]

# --- allergen fixes: guidance becomes a list of sourced statements ---
for a in d["allergens"]:
    a["guidance"] = [{"text": a["guidance"], "sourceIds": drop(a["sourceIds"])}]
    del a["sourceIds"]
peanut = next(a for a in d["allergens"] if a["id"] == "peanut")
peanut["guidance"] = [
    {"text": "Peanut can be introduced at about 6 months, once your baby shows signs of readiness. HealthLink BC recommends giving peanut early.",
     "sourceIds": ["hlbc-allergy", "hlbc-first-foods"]},
    {"text": "To start, blend 1 tablespoon of smooth peanut butter with 1 tablespoon of warm water or breast milk, then stir it into infant cereal or a fruit purée. For older babies, spread it thinly on toast strips.",
     "sourceIds": ["hlbc-allergy", "hlbc-first-foods"]},
    {"text": "For a first taste, offer about a quarter of a baby spoonful, wait 10 to 15 minutes, and offer more if there's no reaction.",
     "sourceIds": ["hlbc-allergy"]},
    {"text": "Never give whole or chopped peanuts, or spoonfuls or chunks of peanut butter: they are choking hazards.",
     "sourceIds": ["cdc-choking", "niaid-parent-summary", "hc-6-24"]},
    {"text": "If your baby has severe eczema or an egg allergy, talk with your baby's doctor before introducing peanut.",
     "sourceIds": ["niaid-parent-summary", "cdc-intro-solids"]},
]

# --- food fixes ---
for f in d["foods"]:
    for item in f["prep"] + f["safety"]:
        item["sourceIds"] = drop(item["sourceIds"])
    slug = f["slug"]
    if slug == "banana":
        f["safety"] = [s for s in f["safety"] if "peel" not in s["text"]]
        f["prep"][0]["sourceIds"] = ["hc-6-24", "hc-infant-nutrition"]
    if slug == "salmon":
        for s in f["safety"]:
            if "75 g" in s["text"]:
                s["text"] = ("Choose fish lower in mercury, such as salmon, trout, cod, sole, pollock, halibut or canned light tuna. "
                             "For children 12 to 24 months, Health Canada says to avoid fresh or frozen tuna, shark, swordfish, marlin, "
                             "orange roughy and escolar, or limit them to 75 g a month.")
                s["sourceIds"] = ["hlbc-first-foods-pdf", "hc-6-24"]
    if slug == "peanut-butter":
        f["prep"][0]["sourceIds"] = ["hlbc-first-foods", "hlbc-allergy"]
    if slug == "popcorn":
        for s in f["safety"]:
            s["sourceIds"] = drop(s["sourceIds"], "cdc-choking")
    if slug == "infant-cereal":
        f["allergens"] = []
        f["prep"][0]["sourceIds"] = drop(f["prep"][0]["sourceIds"], "usda-wic-guidelines")
        for s in f["safety"]:
            if "wheat" in s["text"].lower() and "allergen" in s["text"]:
                s["text"] = "Some infant cereals are made with wheat, a common allergen, so check the label."
    if slug in ("carrot", "spinach"):
        for s in f["safety"]:
            if "nitrate" in s["text"]:
                s["text"] = s["text"].replace("USDA advises", "USDA, citing the American Academy of Pediatrics, advises")
    if slug == "shrimp":
        f["safety"] = [s for s in f["safety"] if "fully cooked" not in s["text"]]
        f["safety"].append({"text": "USDA says shellfish for infants should come from a commercial source and be cooked. Health Canada advises never giving raw or undercooked fish to babies; no shellfish-specific rule was found.",
                            "sourceIds": ["usda-cacfp-solids", "hc-6-24"]})

ids = {s["id"] for s in d["sources"]}
for coll in (d["general"], [g for a in d["allergens"] for g in a["guidance"]],
             [x for f in d["foods"] for x in f["prep"] + f["safety"]]):
    for item in coll:
        missing = [i for i in item["sourceIds"] if i not in ids]
        assert not missing, (item, missing)
        assert item["sourceIds"], ("unsourced", item)

with open(out, "w") as fh:
    fh.write("// Generated from government sources only (see docs/content-sources.md). Do not hand-edit safety text.\n")
    fh.write("export const DATA = " + json.dumps(d, indent=1, ensure_ascii=False) + ";\n")
print("ok", len(d["sources"]), len(d["general"]), len(d["allergens"]), len(d["foods"]))
