# PkgSentinel

> Phishing protection for programmers.

PkgSentinel checks a package **before** it is installed, and never runs anything.

## The problem
Developers install code from strangers with one command. Attackers publish
look-alike packages (`reqeusts` instead of `requests`) or hide install scripts
that steal secrets (API keys, SSH keys) the moment you install.

## Our idea
1. Read the dependency list (nothing is downloaded or run).
2. **Name check:** is this name suspiciously close to a popular package?
3. **Script check:** does the install script (read as text only) send data out,
   read env vars or `~/.ssh`, or hide code?
4. Give a risk score: BLOCK (70+), WARN (40-69), ALLOW (below 40),
   with a plain-English reason and a "did you mean...?".

## Planned parts
- CLI: `sentinel scan`, `sentinel check <name>`
- API (FastAPI) and an animated web dashboard
- Detection rules as small YAML files anyone can add

## Status
Built during the Devf8rge x Hacktoberfest Hack Day finals. Work in progress.

## AI tools used
Claude (Anthropic) as a coding assistant.

## License
Apache-2.0