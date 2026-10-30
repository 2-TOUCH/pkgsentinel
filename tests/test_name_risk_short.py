from core.name_risk import check_name


def test_two_letter_typo_of_seven_letter_name_is_warned():
    result = check_name("expre")
    assert result["score"] == 55
    assert result["likely"] == "express"


def test_exact_popular_names_stay_clean():
    assert check_name("express")["score"] == 0
    assert check_name("lodash")["score"] == 0


def test_unrelated_name_stays_clean():
    assert check_name("my-cool-app")["score"] == 0