import json

import typer
from rich.console import Console
from rich.table import Table

from core.name_risk import check_name
from core.scanner import scan_project

app = typer.Typer(help="PkgSentinel: phishing protection for programmers.")
console = Console()
COLORS = {"BLOCK": "bold red", "WARN": "bold yellow", "ALLOW": "bold green"}


@app.command()
def scan(
    path: str = typer.Argument(".", help="Project folder to scan"),
    as_json: bool = typer.Option(False, "--json", help="Print JSON"),
    ):
    """Scan a project's dependencies BEFORE installing them."""
    result = scan_project(path)

    if as_json:
        print(json.dumps(result, indent=2))
    else:
        table = Table(title=f"PkgSentinel scan: {path}")
        table.add_column("Package")
        table.add_column("Verdict")
        table.add_column("Score", justify="right")
        table.add_column("Why")
        for p in result["packages"]:
            color = COLORS[p["verdict"]]
            table.add_row(p["name"], f"[{color}]{p['verdict']}[/]", str(p["score"]), p["summary"])
        console.print(table)

        c = result["counts"]
        console.print(f"BLOCK: {c['BLOCK']}   WARN: {c['WARN']}   ALLOW: {c['ALLOW']}")
        if c["BLOCK"]:
            console.print("[bold red]Install stopped. Nothing was downloaded or run.[/]")

    if result["counts"]["BLOCK"]:
        raise typer.Exit(code=1)


@app.command()
def check(name: str):
    """Check a single package NAME, for example: check expresss"""
    r = check_name(name)
    if r["likely"]:
        console.print(f"[bold red]{name}[/]: score {r['score']}. {r['reasons'][0]}. "
                      f"Did you mean '{r['likely']}'?")
    else:
        console.print(f"[bold green]{name}[/]: no name risk found.")


if __name__ == "__main__":
    app()