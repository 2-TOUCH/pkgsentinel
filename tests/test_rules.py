from core.rules import load_rules


def test_builtin_rules_load():
    ids = {r["id"] for r in load_rules()}
    assert {"NET_CALL", "ENV_READ", "SECRET_FILES"} <= ids


def test_a_new_rule_file_is_picked_up(tmp_path):
    (tmp_path / "crypto_miner.yml").write_text(
        "id: CRYPTO_MINER\nseverity: 85\npattern: 'stratum\\+tcp'\nexplain: Looks like a crypto miner.\n"
    )
    assert [r["id"] for r in load_rules(tmp_path)] == ["CRYPTO_MINER"]