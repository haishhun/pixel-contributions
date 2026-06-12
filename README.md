# pixel-contributions

Generate a pixel-art style GitHub contribution graph as an SVG, for use in your profile README.

## Preview

> Dark (github-dark) | Dracula | Nord | Synthwave

## Usage

### In your profile repo (`username/username`)

Create `.github/workflows/pixel-contributions.yml`:

```yaml
name: Pixel Contributions

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Generate pixel contribution SVGs
        uses: YOUR_USERNAME/pixel-contributions@main
        with:
          github_user_name: ${{ github.repository_owner }}
          token: ${{ secrets.GITHUB_TOKEN }}
          output_path: |
            dist/pixel-contributions.svg
            dist/pixel-contributions-dark.svg?color_scheme=dracula
          color_scheme: github-dark

      - name: Push to output branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then add to your `README.md`:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_USERNAME/output/pixel-contributions-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_USERNAME/output/pixel-contributions.svg" />
  <img alt="Pixel Contributions" src="https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_USERNAME/output/pixel-contributions.svg" />
</picture>
```

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `github_user_name` | GitHub username | required |
| `token` | GitHub token | `GITHUB_TOKEN` |
| `output_path` | Output file path(s), one per line | `dist/pixel-contributions.svg` |
| `color_scheme` | `github-dark`, `dracula`, `nord`, `synthwave` | `github-dark` |
| `show_total` | Show total contributions | `true` |
| `show_months` | Show month labels | `true` |
| `show_days` | Show day labels | `true` |
| `quote` | Custom bottom quote | random |

## Color Schemes

- **github-dark** — classic GitHub dark green
- **dracula** — purple tones on dark background
- **nord** — cool blue-grey Arctic palette
- **synthwave** — hot pink on deep navy

## Development

```bash
npm install
npm run build
```

To test locally:

```bash
GITHUB_TOKEN=your_token INPUT_GITHUB_USER_NAME=haishhun node dist/index.js
```

## License

MIT
