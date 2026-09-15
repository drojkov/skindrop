"""
Импорт реальных скинов CS2 для сайта SkinDrop.

Источники:
  1. CSGO-API (github.com/ByMykel/CSGO-API) — названия, редкость, износы, картинки
  2. Skinport API (api.skinport.com)        — реальные цены по market_hash_name

Результат:
  data.js         — const DATA = { skins: [...], listings: [...] }
  images/*.png    — картинки скинов

Запуск:
  pip install requests brotli
  python import_skins.py              # 150 самых популярных скинов
  python import_skins.py --limit 300  # больше
"""

import argparse
import json
import re
import sys
from pathlib import Path

import requests

SKINS_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
PRICES_URL = "https://api.skinport.com/v1/items?app_id=730&currency=USD&tradable=0"

# --- Соответствия между датасетом и нашими словарями в products.js ---
WEAR_CODES = {
    "Factory New": "FN", "Minimal Wear": "MW", "Field-Tested": "FT",
    "Well-Worn": "WW", "Battle-Scarred": "BS",
}
WEAR_RANGES = {"FN": (0.00, 0.07), "MW": (0.07, 0.15), "FT": (0.15, 0.38), "WW": (0.38, 0.45), "BS": (0.45, 1.00)}

RARITY_MAP = {
    "rarity_common_weapon": "consumer",
    "rarity_uncommon_weapon": "industrial",
    "rarity_rare_weapon": "milspec",
    "rarity_mythical_weapon": "restricted",
    "rarity_legendary_weapon": "classified",
    "rarity_ancient_weapon": "covert",
    "rarity_contraband_weapon": "contraband",
    "rarity_ancient": "gold",          # ножи и перчатки
}

SNIPERS = {"AWP", "SSG 08", "SCAR-20", "G3SG1"}
CATEGORY_MAP = {"Rifles": "rifle", "Pistols": "pistol", "SMGs": "smg", "Heavy": "heavy", "Knives": "knife", "Gloves": "gloves"}


def slugify(text: str) -> str:
    text = text.replace("★", "").replace("™", "").lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def seeded_random(s: str) -> float:
    """Тот же алгоритм, что в products.js, — одна строка → одно число 0..1."""
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h / 4294967296


def fetch_skins() -> list:
    print("Скачиваю датасет скинов…")
    r = requests.get(SKINS_URL, timeout=60)
    r.raise_for_status()
    return r.json()


def fetch_prices() -> dict:
    """Возвращает { market_hash_name: {price, quantity} }."""
    print("Скачиваю цены Skinport…")
    # Skinport требует сжатие brotli — поэтому pip install brotli
    r = requests.get(PRICES_URL, headers={"Accept-Encoding": "br"}, timeout=60)
    r.raise_for_status()
    result = {}
    for item in r.json():
        price = item.get("min_price") or item.get("suggested_price")
        if price:
            result[item["market_hash_name"]] = {"price": float(price), "quantity": item.get("quantity", 0)}
    return result


def hash_name(name: str, wear_label: str, stattrak: bool) -> str:
    """Собирает market_hash_name как на Steam/Skinport."""
    if stattrak:
        # у ножей: "★ StatTrak™ Karambit | Doppler", у оружия: "StatTrak™ AK-47 | Redline"
        name = "★ StatTrak™ " + name[2:] if name.startswith("★ ") else "StatTrak™ " + name
    return f"{name} ({wear_label})"


def build(skins_raw: list, prices: dict, limit: int):
    skins_out, listings_out = [], []

    for s in skins_raw:
        cat = s["category"]["name"]
        if cat not in CATEGORY_MAP:
            continue
        rarity = RARITY_MAP.get(s["rarity"]["id"])
        if not rarity:
            continue

        weapon = s["weapon"]["name"]
        skin_type = "sniper" if weapon in SNIPERS else CATEGORY_MAP[cat]
        display_weapon = ("★ " if s["name"].startswith("★") else "") + weapon
        pattern = s["pattern"]["name"] if s.get("pattern") else s["name"].split("|")[-1].strip()
        skin_id = slugify(s["name"])

        variants, popularity = [], 0
        for w in s.get("wears", []):
            code = WEAR_CODES.get(w["name"])
            if not code:
                continue
            for st in ([False, True] if s.get("stattrak") else [False]):
                p = prices.get(hash_name(s["name"], w["name"], st))
                if not p:
                    continue
                lid = f"{skin_id}_{code}{'_st' if st else ''}"
                lo, hi = WEAR_RANGES[code]
                lo, hi = max(lo, s.get("min_float", 0)), min(hi, s.get("max_float", 1))
                fl = lo + seeded_random(lid) * max(hi - lo, 0)
                variants.append({
                    "id": lid, "skinId": skin_id, "weapon": display_weapon, "name": pattern,
                    "fullName": ("StatTrak™ " if st else "") + f"{display_weapon} | {pattern}",
                    "type": skin_type, "rarity": rarity, "wear": code, "float": round(fl, 4),
                    "stattrak": st, "price": round(p["price"], 2), "image": f"images/{skin_id}.png",
                })
                popularity += p["quantity"]

        if variants:
            skins_out.append({
                "id": skin_id, "weapon": display_weapon, "name": pattern, "type": skin_type,
                "rarity": rarity, "image": f"images/{skin_id}.png", "_pop": popularity, "_img": s["image"],
            })
            listings_out.extend(variants)

    # Самые популярные (по количеству лотов на Skinport) — первыми, и режем до limit
    skins_out.sort(key=lambda x: -x["_pop"])
    skins_out = skins_out[:limit]
    keep = {sk["id"] for sk in skins_out}
    listings_out = [l for l in listings_out if l["skinId"] in keep]
    order = {sk["id"]: i for i, sk in enumerate(skins_out)}
    listings_out.sort(key=lambda l: (order[l["skinId"]], l["stattrak"], list(WEAR_RANGES).index(l["wear"])))
    return skins_out, listings_out


def download_images(skins: list, folder: Path):
    folder.mkdir(exist_ok=True)
    print(f"Скачиваю картинки ({len(skins)})…")
    for i, sk in enumerate(skins, 1):
        path = folder / f"{sk['id']}.png"
        if path.exists():
            continue
        try:
            # суффикс /360fx360f — Steam отдаёт картинку нужного размера
            r = requests.get(sk["_img"] + "/360fx360f", timeout=30)
            r.raise_for_status()
            path.write_bytes(r.content)
        except Exception as e:
            print(f"  не удалось {sk['id']}: {e}")
        if i % 25 == 0:
            print(f"  {i}/{len(skins)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=150, help="сколько базовых скинов взять")
    ap.add_argument("--no-images", action="store_true", help="не скачивать картинки")
    args = ap.parse_args()

    skins_raw = fetch_skins()
    try:
        prices = fetch_prices()
    except Exception as e:
        sys.exit(f"Не удалось получить цены Skinport: {e}\n"
                 "Проверь: pip install brotli; лимит API — 8 запросов в 5 минут.")
    print(f"Цен получено: {len(prices)}")

    skins, listings = build(skins_raw, prices, args.limit)
    if not args.no_images:
        download_images(skins, Path("images"))

    for sk in skins:            # служебные поля в data.js не нужны
        sk.pop("_pop"); sk.pop("_img")

    data = json.dumps({"skins": skins, "listings": listings}, ensure_ascii=False, indent=None)
    Path("data.js").write_text("// Сгенерировано import_skins.py — не редактируй руками\nconst DATA = " + data + ";\n", encoding="utf-8")
    print(f"Готово: {len(skins)} скинов, {len(listings)} позиций → data.js")


if __name__ == "__main__":
    main()
