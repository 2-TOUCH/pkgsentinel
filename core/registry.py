"""Optional online check: does this name exist on npm, and how popular is it?

Read-only. Asks npm's public download-count API about a package NAME.
Nothing is downloaded or run. If npm cannot be reached, nothing changes.
"""
import json
import urllib.error
import urllib.parse
import urllib.request

DOWNLOADS_URL = "https://api.npmjs.org/downloads/point/last-week/"
TIMEOUT = 3  # seconds
POPULAR_DOWNLOADS = 100_000  # weekly downloads that count as widely used

UNCHECKED = {"checked": False, "exists": None, "weekly_downloads": None}
_cache = {}


def lookup(name):
    """Return {"checked", "exists", "weekly_downloads"} for one package name."""
    if name in _cache:
        return _cache[name]
    url = DOWNLOADS_URL + urllib.parse.quote(name, safe="@/")
    req = urllib.request.Request(url, headers={"User-Agent": "PkgSentinel"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            data = json.load(resp)
        info = {"checked": True, "exists": True,
                "weekly_downloads": int(data.get("downloads", 0))}
    except urllib.error.HTTPError as err:
        if err.code != 404:
            return dict(UNCHECKED)
        info = {"checked": True, "exists": False, "weekly_downloads": None}
    except Exception:
        return dict(UNCHECKED)
    _cache[name] = info
    return info


def enrich(result, name):
    """Add the online facts to a check_name() result and adjust it honestly."""
    info = lookup(name)
    out = dict(result)
    out["registry"] = info
    if not info["checked"]:
        return out

    if not info["exists"]:
        out["reasons"] = out["reasons"] + [
            "no package with this name was found on npm "
            "(installing would fail, or this is a typo)"
        ]
        return out

    downloads = info["weekly_downloads"] or 0
    if not out["known"] and downloads >= POPULAR_DOWNLOADS:
        # A real, widely used package that just isn't in our small list.
        out.update(score=0, likely=None, reasons=[], known=True,
                   verified_online=True)
    elif out["score"] > 0 and downloads < POPULAR_DOWNLOADS:
        out["reasons"] = out["reasons"] + [
            f"exists on npm but had only {downloads:,} downloads last week"
        ]
    return out