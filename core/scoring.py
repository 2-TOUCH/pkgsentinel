BLOCK_AT = 70
WARN_AT = 40


def combine(name_score, script_score):
    """The bigger worry decides; the smaller one adds a little extra."""
    high, low = max(name_score, script_score), min(name_score, script_score)
    return min(100, round(high + 0.25 * low))


def verdict(score):
    if score >= BLOCK_AT:
        return "BLOCK"
    if score >= WARN_AT:
        return "WARN"
    return "ALLOW"