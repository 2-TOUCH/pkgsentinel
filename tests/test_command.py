from core.command import parse_command


def test_parses_install_command():
    assert parse_command("npm install expresss lodash@4.17.21 --save") == ["expresss", "lodash"]


def test_keeps_scoped_names():
    assert parse_command("npm i @types/node") == ["@types/node"]