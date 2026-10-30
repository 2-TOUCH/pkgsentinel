# Contributing to PkgSentinel

Thank you for helping! The easiest first contribution is **one small detection rule**.

## Ground rules

- Be kind. We follow the [MLH Code of Conduct](https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md).
- **Never run a package's install script** and never publish test packages to npm or PyPI. PkgSentinel only reads text.
- Use **fake packages and fake local addresses** (like `http://localhost:9999`) in tests and demos. Never put real secrets or real malware in the repo.

## Set up

```bash
git clone https://github.com/SMohammedMaaz/pkgsentinel.git
cd pkgsentinel
pip install -r requirements.txt
python -m pytest
```

All tests should pass before you start. (Use `python -m pytest`, not `pytest`, so it works on every setup.)

## Add a detection rule

1. Open the `rules/` folder. Each rule is one small `.yml` file with these fields: `id`, `severity`, `pattern`, `explain`.
2. Copy an existing file, give it a new name, and change the fields:
   - `id`: a short UPPER_CASE name
   - `severity`: how dangerous it is, as a number
   - `pattern`: what to look for in the script text
   - `explain`: one plain-English sentence a beginner can understand
3. Add a test in `tests/` that shows the rule catches a bad line and does **not** flag a harmless one.
4. Run `python -m pytest`.

## Other ways to help

- Grow the list of popular package names in `core/popular.py`.
- Add a PyPI adapter so Python projects can be scanned too.
- Improve the plain-English explanations.
- Report a false positive (a safe package we flagged) with the package name and the score.

## Making your change

1. Fork the repo and create a branch: `git checkout -b my-change`
2. Keep commits **small**, with a short message that starts with a type:
   - `feat:` new feature or rule
   - `fix:` bug fix
   - `test:` tests
   - `docs:` documentation
3. Run `python -m pytest` again.
4. Push your branch and open a pull request. Say what you changed and why.

## Web dashboard

```bash
python -m uvicorn api.main:app --reload     # terminal 1
cd web && npm install && npm run dev        # terminal 2
```