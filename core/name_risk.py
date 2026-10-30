from rapidfuzz.distance import OSA

from core.popular import POPULAR

# Letters that look alike to a tired human
LOOKALIKES = [("rn", "m"), ("1", "l"), ("0", "o")]


def normalize(name):
    return name.lower().replace("_", "-").replace(".", "-")


def check_name(name):
    """Return how risky a package NAME is (0-100) and what it was
    probably meant to be. Only compares text, nothing is downloaded."""
    n = normalize(name)
    if n in POPULAR:
        return {"score": 0, "likely": None, "reasons": []}

    # Trick 1: look-alike characters (rn vs m, 1 vs l, 0 vs o)
    fixed = n
    for fake, real in LOOKALIKES:
        fixed = fixed.replace(fake, real)
    if fixed in POPULAR:
        return {"score": 90, "likely": fixed,
                "reasons": [f"uses look-alike characters; it looks like '{fixed}'"]}

    # Trick 2: separator games (react-dom vs reactdom)
    squashed = n.replace("-", "")
    for real in POPULAR:
        if squashed == real.replace("-", ""):
            return {"score": 80, "likely": real,
                    "reasons": [f"same letters as '{real}' with different separators"]}

    # Trick 3: one or two typos (a swapped pair counts as one typo)
    best, best_d = None, 99
    for real in POPULAR:
        d = OSA.distance(n, real)
        if d < best_d:
            best, best_d = real, d
    if best_d == 1 and len(best) >= 4:
        return {"score": 85, "likely": best,
                "reasons": [f"only 1 letter away from the popular package '{best}'"]}
    if best_d == 2 and len(best) >= 8:
        return {"score": 55, "likely": best,
                "reasons": [f"only 2 letters away from the popular package '{best}'"]}

    return {"score": 0, "likely": None, "reasons": []}