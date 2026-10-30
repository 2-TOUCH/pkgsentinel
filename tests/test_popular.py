from core.name_risk import check_name
from core.popular import POPULAR


def test_every_popular_name_is_safe():
    for name in POPULAR:
        assert check_name(name)["score"] == 0, name


def test_known_typos_are_caught():
    for typo, real in [("expresss", "express"), ("lodsh", "lodash"),
                       ("reactt", "react"), ("axioss", "axios")]:
        r = check_name(typo)
        assert r["score"] >= 70 and r["likely"] == real