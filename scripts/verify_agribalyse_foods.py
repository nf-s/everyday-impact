"""Compare every bundled food factor and source identity with ADEME's public API.

Run: python3 scripts/verify_agribalyse_foods.py
Requires network access and Node. Does not rewrite data. Fails on a changed
upstream source fingerprint so a source refresh requires deliberate review.
"""

import json
import subprocess
from decimal import Decimal
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]


def fetch(url):
    with urlopen(url, timeout=60) as response:
        return json.load(response)


def verify():
    script = """
import {foodGroups, agribalyseFoodMetadata} from './dist/data/food.js';
process.stdout.write(JSON.stringify({metadata:agribalyseFoodMetadata,
  foods:foodGroups.flatMap(group=>group.options).filter(food=>food.sourceCode)}));
"""
    bundled = json.loads(
        subprocess.check_output(["node", "--input-type=module", "-e", script], cwd=ROOT)
    )
    imported = bundled["metadata"]
    api = imported["source"]
    current = fetch(api)
    if current["file"]["md5"] != imported["sourceFileMd5"]:
        raise ValueError(
            "The upstream source file changed; review and refresh before verification."
        )
    rows = []
    url = api + "/lines?size=10000"
    while url:
        page = fetch(url)
        rows.extend(page["results"])
        url = page.get("next")
    source = {row["Code_AGB"]: row for row in rows}
    foods = bundled["foods"]
    if len(source) != len(rows) or len(foods) != len(source):
        raise ValueError("Source/output coverage mismatch.")
    seen = set()
    for food in foods:
        code = food["sourceCode"]
        if code in seen:
            raise ValueError(("Duplicate source row", code))
        seen.add(code)
        row = source[code]
        for key, definition in imported["sourceFields"].items():
            field = definition["field"]
            expected = float(Decimal(str(row[field])) * definition["multiplier"])
            if food["values"][key] != expected:
                raise ValueError(
                    ("Factor differs", code, key, food["values"][key], expected)
                )
        for output, original in [
            ("sourceName", "LCI_Name"),
            ("sourceFrenchName", "Nom_du_Produit_en_Français"),
            ("dqr", "DQR"),
            ("packagingApproach", "Approche_emballage_"),
        ]:
            if food[output] != row[original]:
                raise ValueError(("Source metadata differs", code, output))
    if seen != set(source):
        raise ValueError("Not every source row was verified.")
    print(
        f"Verified {len(foods)} unique foods and {len(foods) * len(imported['sourceFields'])} factors against ADEME; original source fingerprint matches."
    )


if __name__ == "__main__":
    verify()
