"""Refresh the public AGRIBALYSE 3.2 aggregate food catalogue; no inventories.

Run: python3 scripts/build_agribalyse_foods.py
Only dist/data/agribalyse-foods.js is regenerated; the runtime and other studies
are maintained separately. The legacy API identifier is agribalyse-31-synthese.
Version, licence, field units, finite factors, taxonomy, DQR, curated mappings
and complete one-row-per-source coverage are checked before writing output.
Reuse covers public aggregate indicators under Etalab, not process inventories.
"""

import json
import math
import re
from datetime import date
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
API = "https://data.ademe.fr/data-fair/api/v1/datasets/agribalyse-31-synthese"
METRICS = {
    "carbon": ("Changement_climatique", 1),
    "agribalyseLand": ("Utilisation_du_sol", 1),
    "freshwaterEutrophication": ("Eutrophisation_eaux_douces", 1000),
    "waterScarcity": ("Épuisement_des_ressources_eau", 1),
    "agribalyseAcidification": ("Acidification_terrestre_et_eaux_douces", 1),
    "marineEutrophication": ("Eutrophisation_marine", 1000),
    "fossilResources": ("Épuisement_des_ressources_énergétiques", 1),
    "smogFormation": ("Formation_photochimique_d'ozone", 1000),
    "mineralResources": ("Épuisement_des_ressources_minéraux", 1000000),
}
OUTPUT_UNITS = {
    "carbon": "kg CO₂e/kg",
    "agribalyseLand": "Pt/kg",
    "freshwaterEutrophication": "g P eq/kg",
    "waterScarcity": "m³ deprivation eq/kg",
    "agribalyseAcidification": "mol H⁺ eq/kg",
    "marineEutrophication": "g N eq/kg",
    "fossilResources": "MJ/kg",
    "smogFormation": "g NMVOC eq/kg",
    "mineralResources": "mg Sb eq/kg",
}
GROUPS = {
    "viandes, œufs, poissons": ("agb-proteins", "Meat, fish and eggs"),
    "fruits, légumes, légumineuses et oléagineux": (
        "agb-plants",
        "Fruit, vegetables, pulses and nuts",
    ),
    "produits céréaliers": ("agb-grains", "Bread, cereals and pasta"),
    "entrées et plats composés": ("agb-prepared", "Prepared dishes and starters"),
    "lait et produits laitiers": ("agb-dairy", "Milk and dairy products"),
    "aides culinaires et ingrédients divers": (
        "agb-ingredients",
        "Cooking ingredients and condiments",
    ),
    "boissons": ("agb-drinks", "Drinks"),
    "matières grasses": ("agb-fats", "Oils and fats"),
    "produits sucrés": ("agb-sweets", "Sweet foods"),
    "aliments infantiles": ("agb-infant", "Infant food products"),
    "glaces et sorbets": ("agb-frozen-desserts", "Ice cream and sorbets"),
}
SUBGROUPS = {
    "aides culinaires": "Cooking aids",
    "algues": "Seaweed",
    "autres matières grasses": "Other fats",
    "autres produits à base de viande": "Other meat products",
    "beurres": "Butter",
    "boisson alcoolisées": "Alcoholic drinks",
    "boissons sans alcool": "Non-alcoholic drinks",
    "charcuteries": "Cured and processed meats",
    "chocolats et produits à base de chocolat": "Chocolate",
    "condiments": "Condiments",
    "confiseries non chocolatées": "Sugar confectionery",
    "confitures et assimilés": "Jams and preserves",
    "crèmes et spécialités à base de crème": "Cream",
    "céréales de petit-déjeuner et biscuits": "Breakfast cereals and biscuits",
    "céréales et biscuits infantiles": "Infant cereals and biscuits",
    "denrées destinées à une alimentation particulière": "Special dietary products",
    "desserts glacés": "Frozen desserts",
    "desserts infantiles": "Infant desserts",
    "eaux": "Water",
    "farines et pâtes à tarte": "Flour and pastry dough",
    "feuilletées et autres entrées": "Pastries and other starters",
    "fromages": "Cheese",
    "fruits": "Fruit",
    "fruits à coque et graines oléagineuses": "Nuts and seeds",
    "glaces": "Ice cream",
    "gâteaux et pâtisseries": "Cakes and pastries",
    "herbes": "Herbs",
    "huiles de poissons": "Fish oils",
    "huiles et graisses végétales": "Vegetable oils and fats",
    "ingrédients divers": "Other ingredients",
    "laits": "Milk",
    "laits et boissons infantiles": "Infant milks and drinks",
    "légumes": "Vegetables",
    "légumineuses": "Pulses",
    "margarines": "Margarine",
    "mollusques et crustacés crus": "Raw shellfish",
    "mollusques et crustacés cuits": "Cooked shellfish",
    "pains et viennoiseries": "Bread and breakfast pastries",
    "petits pots salés et plats infantiles": "Infant meals",
    "pizzas, tartes et crêpes salées": "Savoury pizzas, tarts and pancakes",
    "plats composés": "Prepared dishes",
    "plats végétariens": "Vegetarian dishes",
    "poissons crus": "Raw fish",
    "poissons cuits": "Cooked fish",
    "pommes de terre et autres tubercules": "Potatoes and tubers",
    "produits laitiers frais et assimilés": "Fresh dairy products and alternatives",
    "produits à base de poissons et produits de la mer": "Processed seafood",
    "pâtes, riz et céréales": "Pasta, rice and cereals",
    "salades composées et crudités": "Salads and raw vegetable dishes",
    "sandwichs": "Sandwiches",
    "sauces": "Sauces",
    "sels": "Salt",
    "sorbets": "Sorbets",
    "soupes": "Soups",
    "substituts de charcuterie": "Plant-based deli alternatives",
    "substituts de viande": "Meat alternatives",
    "sucres, miels et assimilés": "Sugar and honey",
    "viandes crues": "Raw meat",
    "viandes cuites": "Cooked meat",
    "épices": "Spices",
    "œufs": "Eggs",
}

PREPARATION = {
    "Pas de préparation": "no preparation",
    "Four": "oven",
    "Micro-onde": "microwave",
    "Cuisson à l'eau": "boiling",
    "Poêle": "frying pan",
    "Réfrigéré chez le consommateur": "refrigerated at home",
}


def fetch(url):
    with urlopen(url, timeout=60) as response:
        return json.load(response)


def build():
    metadata = fetch(API)
    if "v3.2" not in metadata["description"]:
        raise ValueError(
            "Dataset version changed; review the new release before importing."
        )
    licence = metadata.get("license", {})
    if licence.get(
        "title"
    ) != "Licence Ouverte / Open Licence" or "etalab.gouv.fr" not in licence.get(
        "href", ""
    ):
        raise ValueError("The published data licence changed; review reuse conditions.")
    schema = {column["key"]: column for column in metadata["schema"]}
    expected_units = {
        "carbon": "kg CO2 eq/kg de produit",
        "agribalyseLand": "Pt/kg de produit",
        "freshwaterEutrophication": "kg P eq/kg de produit",
        "waterScarcity": "m3 depriv./kg de produit",
        "agribalyseAcidification": "mol H+ eq/kg de produit",
        "marineEutrophication": "kg N eq/kg de produit",
        "fossilResources": "MJ/kg de produit",
        "smogFormation": "kg NMVOC eq/kg de produit",
        "mineralResources": "kg Sb eq/kg de produit",
    }
    for target, (field, _) in METRICS.items():
        if schema.get(field, {}).get("description") != expected_units[target]:
            raise ValueError(("Source unit changed; review conversion", field))
    rows = []
    url = API + "/lines?size=10000"
    while url:
        page = fetch(url)
        rows.extend(page["results"])
        url = page.get("next")
    if len(rows) != metadata["count"]:
        raise ValueError("Incomplete API result.")
    by_code = {row["Code_AGB"]: row for row in rows}
    if len(by_code) != len(rows):
        raise ValueError("Duplicate source food code.")
    selection = json.loads((ROOT / "scripts/agribalyse-selection.json").read_text())
    selected_codes = {entry["sourceCode"] for entry in selection}
    if len(selected_codes) != len(selection):
        raise ValueError("A curated selection duplicates a source row.")
    if not selected_codes.issubset(by_code):
        raise ValueError("A curated food no longer exists in the source release.")
    for row in rows:
        code = row.get("Code_AGB")
        if not isinstance(code, str) or not re.fullmatch(r"[0-9]+(?:_[0-9]+)?", code):
            raise ValueError(("Unexpected source code", code))
        for key in [
            "LCI_Name",
            "Groupe_d'aliment",
            "Sous-groupe_d'aliment",
            "Nom_du_Produit_en_Français",
        ]:
            if not isinstance(row.get(key), str) or not row[key].strip():
                raise ValueError(("Missing source text", code, key))
        if (
            row["Groupe_d'aliment"] not in GROUPS
            or row["Sous-groupe_d'aliment"] not in SUBGROUPS
        ):
            raise ValueError(("Unknown source taxonomy", code))
        if row["Préparation"] not in PREPARATION or row["Approche_emballage_"] not in [
            "PACK AGB",
            "PACK PROXY",
        ]:
            raise ValueError(("Unknown preparation or packaging model", code))
        if str(row.get("code_saison")) not in ["0", "1", "2"] or not isinstance(
            row.get("code_avion"), bool
        ):
            raise ValueError(("Unknown season or freight flag", code))
        dqr = row.get("DQR")
        if (
            isinstance(dqr, bool)
            or not isinstance(dqr, (float, int))
            or not math.isfinite(dqr)
            or not 1 <= dqr <= 5
        ):
            raise ValueError(("Invalid DQR", code, dqr))
        for field, _ in METRICS.values():
            value = row.get(field)
            if (
                isinstance(value, bool)
                or not isinstance(value, (float, int))
                or not math.isfinite(value)
            ):
                raise ValueError(("Missing or nonnumeric source factor", code, field))
    provenance = {
        "source": API,
        "version": "AGRIBALYSE 3.2",
        "sourceDataUpdated": metadata["dataUpdatedAt"],
        "sourceMetadataUpdated": metadata["updatedAt"],
        "sourceCount": len(rows),
        "sourceFileMd5": metadata["file"]["md5"],
        "retrieved": date.today().isoformat(),
        "licence": metadata["license"],
        "sourceFields": {
            target: {
                "field": field,
                "multiplier": multiplier,
                "publishedUnit": next(
                    column["description"]
                    for column in metadata["schema"]
                    if column["key"] == field
                ),
                "catalogueUnit": OUTPUT_UNITS[target],
            }
            for target, (field, multiplier) in METRICS.items()
        },
    }
    group_keys = list(GROUPS)
    subgroup_keys = list(SUBGROUPS)
    preparation_keys = list(PREPARATION)
    compact_rows = []
    for row in sorted(
        rows,
        key=lambda row: (
            group_keys.index(row["Groupe_d'aliment"]),
            SUBGROUPS[row["Sous-groupe_d'aliment"]],
            row["LCI_Name"].casefold(),
            row["Code_AGB"],
        ),
    ):
        compact_rows.append(
            [
                row["Code_AGB"],
                row["LCI_Name"],
                row["Nom_du_Produit_en_Français"],
                group_keys.index(row["Groupe_d'aliment"]),
                subgroup_keys.index(row["Sous-groupe_d'aliment"]),
                preparation_keys.index(row["Préparation"]),
                row["DQR"],
                int(row["Approche_emballage_"] == "PACK PROXY"),
                int(row["code_saison"]),
                int(row["code_avion"]),
                *[row[field] for field, _ in METRICS.values()],
            ]
        )

    def dump(data):
        return json.dumps(data, ensure_ascii=False, separators=(",", ":"))

    data_output = "// ADEME AGRIBALYSE 3.2 public aggregate results: Etalab Open Licence 2.0.\n// Generated by scripts/build_agribalyse_foods.py; factors remain in published units in compact rows.\n"
    data_output += (
        "export const agribalyseFoodMetadata = "
        + json.dumps(provenance, ensure_ascii=False, indent=2)
        + ";\n"
    )
    data_output += "export const groupNames = " + dump(list(GROUPS.values())) + ";\n"
    data_output += (
        "export const subgroupNames = " + dump(list(SUBGROUPS.values())) + ";\n"
    )
    data_output += (
        "export const preparationNames = " + dump(list(PREPARATION.values())) + ";\n"
    )
    data_output += "export const selections = " + dump(selection) + ";\n"
    data_output += "// Columns: source code, publisher English name, publisher French name, group index, subgroup index, preparation index, DQR, packaging proxy, season, air freight, then raw factors in sourceFields order.\n"
    data_output += (
        "export const rows = [\n"
        + ",\n".join(dump(row) for row in compact_rows)
        + "\n];\n"
    )
    (ROOT / "dist/data/agribalyse-foods.js").write_text(data_output)
    print(
        json.dumps(
            {
                "sourceRows": len(rows),
                "rawModuleBytes": len(data_output.encode()),
                "cautionDqrAbove3": sum(row["DQR"] > 3 for row in rows),
                "dqrAbove4": sum(row["DQR"] > 4 for row in rows),
                "packagingProxies": sum(
                    row["Approche_emballage_"] == "PACK PROXY" for row in rows
                ),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    build()
