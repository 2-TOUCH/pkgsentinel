VERBS = {"npm", "npx", "yarn", "pnpm", "pip", "pip3", "install", "i", "add"}


def parse_command(command):
    """Pull package names out of text like 'npm install expresss lodash@4'.
    Only reads text. Nothing is run."""
    names = []
    for token in command.split():
        # skip the command words (npm, install, ...) and flags (--save)
        if token.lower() in VERBS or token.startswith("-"):
            continue
        # strip a version like lodash@4.17.21 (but keep scopes like @types/node)
        if "@" in token[1:]:
            token = token[: token.index("@", 1)]
        if token:
            names.append(token)
    return names