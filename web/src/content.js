// All the words on the landing page.

export const REPO_URL = "https://github.com/SMohammedMaaz/pkgsentinel";
export const CLI_EXAMPLE = "python -m cli.main scan demo";

export const nav = [
  { label: "Story", href: "#story" },
  { label: "How it works", href: "#how" },
  { label: "Try it", href: "#try" },
  { label: "Ways to use", href: "#ways" },
  { label: "Contribute", href: "#contribute" },
];

export const story = {
  eyebrow: "The story",
  heading: "One extra letter. One stolen key.",
  body: "Maya is a first-year student. It is 1 AM at a hackathon. This is what happens next, frame by frame.",
  note: "Illustrative story, not a real person.",
};

export const pipeline = {
  eyebrow: "How it works",
  heading: "Six steps, drawn as you scroll.",
  legs: [
    { tag: "Step 1", title: "Read the list", body: "PkgSentinel reads package.json and the install scripts. Nothing is downloaded or run." },
    { tag: "Step 2", title: "Check the name", body: "expresss is one letter away from express. A look-alike alarm goes off." },
    { tag: "Step 3", title: "Read the scripts", body: "Install scripts are read as plain text, looking for phone-home calls and secret reads." },
    { tag: "Step 4", title: "Name evidence", body: "The name check hands its evidence to the scorer." },
    { tag: "Step 5", title: "Script evidence", body: "The script check hands its evidence to the scorer, and the risk score climbs." },
    { tag: "Step 6", title: "Verdict", body: "A score of 85 means BLOCK. Nothing was installed and nothing ran." },
  ],
};

export const ways = {
  eyebrow: "Ways to use it",
  heading: "Three doors, one engine.",
  note: "Same checks behind every door.",
  items: [
    { name: "CLI", rings: 2, lines: ["Scan a project folder", "Plain-English verdicts", "Works offline"], code: CLI_EXAMPLE },
    { name: "Web checker", rings: 3, lines: ["Paste an install command", "Animated risk gauge", "Evidence drawer"], code: "npm install expresss", featured: true },
    { name: "REST API", rings: 4, lines: ["Scan, check, rules, history", "JSON results", "Built with FastAPI"], code: "POST /api/check" },
  ],
};

export const contribute = {
  eyebrow: "Open source",
  heading: "Make it smarter in five minutes.",
  body: "Detection rules are small, readable files in the rules folder. Add one, add a test, open a pull request.",
  steps: ["Fork", "Add a rule + test", "Tests pass", "Pull request"],
  rule: [
    ["id", "NET_CALL"],
    ["severity", "50"],
    ["pattern", "\\bfetch\\(|\\bcurl\\b|https?://"],
    ["explain", "Makes a network call during install."],
  ],
};