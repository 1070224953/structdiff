<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/StructDiff-semantic_diff_for_structured_data-58a6ff?style=for-the-badge">
</picture>

# StructDiff

**Semantic diff for structured data. Finally, an open-source tool that understands your config files.**

Stop diffing JSON and YAML line-by-line. StructDiff understands structure — it shows you what *actually* changed, not what just moved to a different line.

## Why StructDiff?

Traditional diff tools compare files line by line. Perfect for code. Useless for structured data.

```yaml
# Original
replicas: 2
containers:
  - name: main
    resources:
      limits:
        cpu: "1"
        memory: "512Mi"

# Modified
containers:
  - name: main
    resources:
      limits:
        cpu: "2"       # changed
        memory: "1Gi"  # changed
replicas: 3            # changed + moved
```

**Line diff**: 9 lines changed. Unreadable.  
**StructDiff**: 3 values changed, 1 key moved. Clean tree view.

## Features

- **Structure-aware diff** — compares JSON and YAML at the semantic level
- **Auto-detects format** — paste JSON or YAML, it figures out which
- **Interactive tree view** — expand, collapse, scan changes at a glance
- **Color-coded** — added (green), removed (red), changed (yellow)
- **Change summary** — instant count per change type
- **100% local** — all processing in your browser, no data leaves your machine
- **Pre-loaded demo** — a real Kubernetes Deployment diff on first open

## Quick Start

```bash
git clone https://github.com/1070224953/structdiff.git
cd structdiff
npm install
npm run dev
```

Or try it instantly online: **[Live Demo](https://1070224953.github.io/structdiff)**

## Usage

1. Paste original JSON or YAML in the left panel
2. Paste the modified version in the right panel
3. The diff appears instantly below

Perfect for:
- Reviewing Kubernetes manifest changes
- Comparing API response snapshots
- Auditing config file drift between environments
- Understanding what changed in any JSON/YAML file

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + TypeScript |
| Build | Vite |
| YAML | js-yaml |
| Styling | CSS (zero runtime deps) |

## Why This Exists

I merge Kubernetes YAML files regularly and got tired of raw text diffs showing 200+ "changes" when only 3 values actually changed. Every existing diff tool treats config files like prose. They're not prose — they're trees. StructDiff is a tree diff that happens to render text.

## Contributing

```bash
npm install
npm run dev
```

Issues and PRs welcome. Check the [issues](https://github.com/1070224953/structdiff/issues) for `good first issue` tags.

## License

MIT — see [LICENSE](LICENSE).
