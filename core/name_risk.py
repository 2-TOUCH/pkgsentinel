from rapidfuzz.distance import OSA

from core.popular import POPULAR

# Letters that look alike to a tired human
LOOKALIKES = [("rn", "m"), ("1", "l"), ("0", "o")]


def normalize(name):
    return name.lower().replace("_", "-").replace(".", "-")


def _result(score, likely, reasons, known=False):
    return {"score": score, "likely": likely, "reasons": reasons, "known": known}


def check_name(name):
    """Return how risky a package NAME is (0-100) and what it was
    probably meant to be. Only compares text, nothing is downloaded.
    'known' is True only when the name is exactly a popular package."""
    n = normalize(name)
    if n in POPULAR or name.lower() in POPULAR:
        return _result(0, None, [], known=True)

    # Trick 1: look-alike characters (rn vs m, 1 vs l, 0 vs o)
    fixed = n
    for fake, real in LOOKALIKES:
        fixed = fixed.replace(fake, real)
    if fixed in POPULAR:
        return _result(90, fixed,
                       [f"uses look-alike characters; it looks like '{fixed}'"])

    # Trick 2: separator games (react-dom vs reactdom)
    squashed = n.replace("-", "")
    for real in POPULAR:
        if squashed == real.replace("-", ""):
            return _result(80, real,
                           [f"same letters as '{real}' with different separators"])

    # Trick 3: one or two typos (a swapped pair counts as one typo)
    best, best_d = None, 99
    for real in POPULAR:
        d = OSA.distance(n, real)
        if d < best_d:
            best, best_d = real, d
    if best_d == 1 and len(best) >= 4:
        return _result(85, best,
                       [f"only 1 letter away from the popular package '{best}'"])
    if best_d == 2 and len(best) >= 7:
        return _result(55, best,
                       [f"only 2 letters away from the popular package '{best}'"])

    # Trick 4: cut-off name (the start of a popular name, up to 4 letters missing)
    cutoffs = [
        real for real in POPULAR
        if real.startswith(n) and 1 <= len(real) - len(n) <= 4 and len(n) >= 2
    ]
    if cutoffs:
        real = min(cutoffs, key=len)
        return _result(45, real,
                       [f"looks like a cut-off version of the popular package '{real}'"])

    return _result(0, None, [])