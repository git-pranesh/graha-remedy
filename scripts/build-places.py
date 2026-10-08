"""
Build frontend/src/data/places.json from GeoNames dumps (CC BY 4.0, https://www.geonames.org).

Inputs (download from https://download.geonames.org/export/dump/):
  cities1000.txt, cities5000.txt, admin1CodesASCII.txt, countryInfo.txt
Usage:
  python3 scripts/build-places.py /path/to/geonames-dir

Coverage: India from cities1000 (population >= 1,000), all other countries from
cities5000 (population >= 5,000).
"""
import json, os, re, sys, unicodedata

src = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "data", "places.json")

admin1 = {}
for line in open(os.path.join(src, "admin1CodesASCII.txt"), encoding="utf-8"):
    code, name, ascii_name, _ = line.rstrip("\n").split("\t")
    admin1[code] = ascii_name or name

countries = {}
for line in open(os.path.join(src, "countryInfo.txt"), encoding="utf-8"):
    if line.startswith("#"):
        continue
    f = line.rstrip("\n").split("\t")
    countries[f[0]] = f[4]

ascii_word = re.compile(r"^[A-Za-z][A-Za-z .'-]{1,40}$")

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).strip()

rows, seen = [], set()
def load(fname, keep):
    for line in open(os.path.join(src, fname), encoding="utf-8"):
        f = line.rstrip("\n").split("\t")
        gid, name, asciiname, alts, lat, lon, fclass, fcode, cc, _, a1 = f[:11]
        pop, tz = int(f[14] or 0), f[17]
        if not keep(cc) or gid in seen or not tz:
            continue
        seen.add(gid)
        alt = []
        if pop >= 100000:
            for a in alts.split(","):
                n = norm(a)
                if ascii_word.match(a) and n and n != norm(asciiname) and n not in alt:
                    alt.append(n)
                if len(alt) >= 15:
                    break
        rows.append({
            "n": name, "k": norm(asciiname or name), "a": admin1.get(f"{cc}.{a1}", ""),
            "c": cc, "lat": round(float(lat), 4), "lon": round(float(lon), 4),
            "tz": tz, "p": pop, "alt": alt,
        })

load("cities1000.txt", lambda cc: cc == "IN")
load("cities5000.txt", lambda cc: cc != "IN")
rows.sort(key=lambda r: -r["p"])

tzs = sorted({r["tz"] for r in rows})
tz_idx = {t: i for i, t in enumerate(tzs)}
packed = {
    "attribution": "Place data from GeoNames (https://www.geonames.org), licensed under CC BY 4.0",
    "countries": {cc: countries.get(cc, cc) for cc in sorted({r["c"] for r in rows})},
    "tz": tzs,
    # [name, searchKey, admin1, countryCode, lat, lon, tzIndex, population, altKeys]
    "places": [[r["n"], r["k"], r["a"], r["c"], r["lat"], r["lon"], tz_idx[r["tz"]], r["p"], r["alt"]] for r in rows],
}
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(packed, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(rows)} places, {len(tzs)} timezones -> {out} ({os.path.getsize(out)/1e6:.1f} MB)")
