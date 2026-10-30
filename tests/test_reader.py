from core.reader import read_dependencies


def test_reads_demo_dependencies():
    deps = read_dependencies("demo")
    assert "express" in deps
    assert "expresss" in deps
    assert "env-reporter" in deps