"""Index places/raw/ photos into places/photos/*.webp + places/photos.json.

Usage: python build.py            build
       python build.py --selftest run the small checks
"""
import base64, json, os, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW, OUT, CACHE = ROOT / "raw", ROOT / "photos", ROOT / ".cache"
EXTS = {".jpg", ".jpeg", ".png"}
MODEL = "claude-sonnet-5-5"
UA = "posca-travel-lab/0.1"


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", Path(name).stem.lower()).strip("-")


def dms_to_dec(dms, ref):
    d, m, s = (float(x) for x in dms)
    v = d + m / 60 + s / 3600
    return round(-v if str(ref).upper() in ("S", "W") else v, 6)


def read_exif(img):
    exif = img.getexif()
    gps = exif.get_ifd(0x8825)
    lat = lon = date = None
    if 2 in gps and 4 in gps:
        lat, lon = dms_to_dec(gps[2], gps.get(1, "N")), dms_to_dec(gps[4], gps.get(3, "E"))
    dt = exif.get_ifd(0x8769).get(0x9003) or exif.get(0x0132)
    if dt:
        date = str(dt)[:10].replace(":", "-")
    return lat, lon, date


def load(path):
    return json.loads(path.read_text()) if path.exists() else {}


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


_last_geo = [0.0]


def geocode(lat, lon, cache):
    key = f"{lat:.3f},{lon:.3f}"
    if key not in cache:
        time.sleep(max(0, 1 - (time.time() - _last_geo[0])))  # Nominatim: max 1 req/sec
        _last_geo[0] = time.time()
        q = urllib.parse.urlencode({"format": "jsonv2", "lat": lat, "lon": lon, "zoom": 10, "accept-language": "en"})
        req = urllib.request.Request(f"https://nominatim.openstreetmap.org/reverse?{q}", headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                a = json.load(r).get("address", {})
        except Exception as e:
            print(f"  warn: geocode failed for {key}: {e}")
            return "", ""  # not cached, retried next run
        place = next((a[k] for k in ("city", "town", "village", "county") if a.get(k)), "")
        cache[key] = [place, a.get("country", "")]
    return tuple(cache[key])


TAG_SCHEMA = {
    "type": "object",
    "properties": {"caption": {"type": "string"}, "tags": {"type": "array", "items": {"type": "string"}}},
    "required": ["caption", "tags"],
    "additionalProperties": False,
}
PROMPT = ("Describe this travel photo for a personal photo map. Return JSON with "
          "\"caption\": a short lowercase handwritten-note style caption (under ~12 words), and "
          "\"tags\": 8-15 lowercase tags of visible content, including generous synonyms "
          "(e.g. sea, ocean, water, coast).")


def claude_tags(client, webp):
    data = base64.standard_b64encode(webp.read_bytes()).decode()
    r = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        output_config={"effort": "low", "format": {"type": "json_schema", "schema": TAG_SCHEMA}},
        messages=[{"role": "user", "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/webp", "data": data}},
            {"type": "text", "text": PROMPT},
        ]}],
    )
    if r.stop_reason != "end_turn":
        raise RuntimeError(f"stop_reason={r.stop_reason}")
    out = json.loads(next(b.text for b in r.content if b.type == "text"))
    return out["caption"].strip().lower(), [t.strip().lower() for t in out["tags"] if t.strip()]


def encode(img, dest, edge, quality=82):
    im = img.copy()
    im.thumbnail((edge, edge))
    im.save(dest, "WEBP", quality=quality, method=6)
    return im.size


def build():
    from PIL import Image, ImageOps

    OUT.mkdir(exist_ok=True)
    overrides = load(RAW / "overrides.json")
    geo_cache, tag_cache = load(CACHE / "geocode.json"), load(CACHE / "tags.json")
    client, notified = None, False
    sources = sorted(p for p in RAW.iterdir() if p.suffix.lower() in EXTS)
    entries = []

    for src in sources:
        pid, ov, mtime = slug(src.name), overrides.get(src.name, {}), src.stat().st_mtime
        big, thumb = OUT / f"{pid}.webp", OUT / f"{pid}.thumb.webp"
        with Image.open(src) as img:
            lat, lon, date = read_exif(img)
            lat, lon, date = ov.get("lat", lat), ov.get("lon", lon), ov.get("date", date)
            if lat is None or lon is None:
                print(f"skip {src.name}: no lat/lon in EXIF or overrides")
                continue
            if big.exists() and thumb.exists() and min(big.stat().st_mtime, thumb.stat().st_mtime) > mtime:
                with Image.open(big) as b:
                    w, h = b.size
                status = "cached"
            else:
                img = ImageOps.exif_transpose(img).convert("RGB")
                w, h = encode(img, big, 1600)
                encode(img, thumb, 480)
                status = "encoded"

        place, country = ov.get("place"), ov.get("country")
        if place is None or country is None:
            gp, gc = geocode(lat, lon, geo_cache)
            place, country = place if place is not None else gp, country if country is not None else gc

        caption, tags = ov.get("caption"), ov.get("tags")
        if caption is None or tags is None:
            key = f"{pid}:{int(mtime)}"
            if key not in tag_cache and os.environ.get("ANTHROPIC_API_KEY"):
                if client is None:
                    import anthropic
                    client = anthropic.Anthropic()
                try:
                    tag_cache[key] = list(claude_tags(client, big))
                    save(CACHE / "tags.json", tag_cache)
                except Exception as e:
                    print(f"  warn: tagging failed for {pid}: {e}")
            elif key not in tag_cache and not notified:
                print("notice: ANTHROPIC_API_KEY unset; missing captions/tags left empty")
                notified = True
            c, t = tag_cache.get(key, ["", []])
            caption, tags = caption if caption is not None else c, tags if tags is not None else t

        entries.append({
            "id": pid, "src": f"photos/{pid}.webp", "thumb": f"photos/{pid}.thumb.webp",
            "w": w, "h": h, "lat": lat, "lon": lon, "date": date or "",
            "place": place, "country": country, "caption": caption, "tags": tags,
            "credit": ov.get("credit", ""),
        })
        print(f"{status:7} {pid}  {date or '????-??-??'}  {place}, {country}  {len(tags)} tags")

    save(CACHE / "geocode.json", geo_cache)
    live = {slug(p.name) for p in sources}
    for f in OUT.glob("*.webp"):
        if f.name.split(".")[0] not in live:
            f.unlink()
            print(f"removed {f.name}")
    entries.sort(key=lambda e: (e["date"], e["id"]))
    save(ROOT / "photos.json", entries)
    print(f"wrote photos.json: {len(entries)} photos")


def selftest():
    assert dms_to_dec((37, 48, 30), "N") == 37.808333
    assert dms_to_dec((122, 28, 48), "W") == -122.48
    assert dms_to_dec((33, 52, 4.8), "S") == -33.868
    assert dms_to_dec((151, 12, 36), b"E".decode()) == 151.21
    assert slug("Kyoto Fushimi_Inari (2).JPG") == "kyoto-fushimi-inari-2"
    assert slug("sf-golden-gate.jpg") == "sf-golden-gate"
    print("selftest ok")


if __name__ == "__main__":
    selftest() if "--selftest" in sys.argv else build()
