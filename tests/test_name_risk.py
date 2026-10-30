from core.name_risk import check_name


def test_typo_is_flagged():
    r = check_name("expresss")
    assert r["score"] >= 70
    assert r["likely"] == "express"


def test_swapped_letters_flagged():
    assert check_name("lodahs")["score"] >= 70


def test_real_names_are_safe():
    assert check_name("express")["score"] == 0
    assert check_name("lodash")["score"] == 0


def test_unrelated_name_is_safe():
    assert check_name("env-reporter")["score"] == 0