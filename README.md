# Josh Mu's Lab 🧪

A lightweight, static registry for interactive experiments and tools. Inspired by [Simon Willison's setup](https://simonwillison.net/2025/Oct/23/claude-code-for-web-video/), this system uses standalone HTML files published as GitHub gists and rendered via [gistpreview.github.io](https://gistpreview.github.io/).

## 🎯 Philosophy

**Simple is better.** Instead of complex build systems and frameworks, experiments are:

- **Self-contained** - Single HTML files with inline CSS/JS
- **Portable** - Work anywhere, no dependencies
- **Shareable** - Published as gists, viewable via gistpreview
- **Discoverable** - Catalogued in a static registry

## 📁 Structure

```
lab/
├── experiments/          # Standalone HTML experiments (ready for gist upload)
│   ├── particle-system.html
│   ├── liquid-morphing.html
│   ├── cyber-grid.html
│   ├── glitch-art.html
│   ├── organic-evolution.html
│   └── digital-rain.html
├── registry/            # Static registry site
│   ├── index.html      # Main registry page
│   └── data/
│       └── gists.json  # Experiment metadata
├── scripts/            # Utility scripts
│   ├── gist-manager.js     # Create/update gists
│   └── sync-registry.js    # Sync gist metadata
├── templates/          # HTML templates for new experiments
│   └── experiment-template.html
└── README.md
```

## 🚀 Quick Start

### 1. Create a New Experiment

Start with the template:

```bash
cp templates/experiment-template.html experiments/my-experiment.html
```

Edit the metadata in the HTML comment block:

```html
<!--
---
id: my-experiment-001
title: My Experiment
description: A cool interactive thing
category: interactive-animations
tags: [canvas, animation, cool]
difficulty: beginner
author: Josh Mu
created: 2025-01-01
updated: 2025-01-01
estimatedTime: 30 mins
prerequisites: [Basic JavaScript]
learningObjectives:
  - Learn something cool
  - Build something awesome
---
-->
```

### 2. Publish to Gist

Set your GitHub token:

```bash
export GITHUB_TOKEN="your_github_token_here"
```

Create the gist:

```bash
node scripts/gist-manager.js create experiments/my-experiment.html
```

This will output:
- Gist ID
- Gist URL
- GistPreview URL (this is what you share!)

### 3. Update the Registry

Fetch all your gists and update the registry:

```bash
node scripts/sync-registry.js
```

This creates/updates `registry/data/gists.json` with metadata from all your gists.

### 4. View the Registry

Open `registry/index.html` in a browser to see your experiment catalog with:
- Search functionality
- Difficulty filters
- Live preview links
- Gist source links

## 🛠️ Utility Scripts

### Gist Manager

Manage GitHub gists from the command line.

**Create a new gist:**

```bash
node scripts/gist-manager.js create experiments/particle-system.html
```

**Update an existing gist:**

```bash
node scripts/gist-manager.js update <gist-id> experiments/particle-system.html
```

**List all your gists:**

```bash
node scripts/gist-manager.js list
```

### Registry Sync

Fetch gist metadata and update the registry.

```bash
node scripts/sync-registry.js
```

This script:
1. Fetches all your gists from GitHub
2. Extracts metadata from HTML frontmatter
3. Updates `registry/data/gists.json`
4. Shows summary of synced experiments

## 📝 Metadata Format

Experiments use YAML-like frontmatter in HTML comments:

```html
<!--
---
id: unique-id-001
title: Experiment Title
description: Brief description
category: interactive-animations
tags: [tag1, tag2, tag3]
difficulty: beginner|intermediate|advanced
author: Your Name
created: YYYY-MM-DD
updated: YYYY-MM-DD
estimatedTime: X mins/hours
prerequisites: [Prerequisite 1, Prerequisite 2]
learningObjectives:
  - Objective 1
  - Objective 2
---
-->
```

## 🎨 Current Experiments

### 1. Particle System (Intermediate)
Interactive particle field with mouse attraction and dynamic connections.
- **Tech**: Canvas API, Physics simulation
- **Time**: 45 mins
- **File**: `experiments/particle-system.html`

### 2. Liquid Morphing (Advanced)
Fluid blob animations with metaball effects.
- **Tech**: Canvas API, Metaball algorithms
- **Time**: 1 hour
- **File**: `experiments/liquid-morphing.html`

### 3. Cyber Grid (Intermediate)
3D perspective grid with cyberpunk aesthetics.
- **Tech**: 3D projection, Canvas API
- **Time**: 50 mins
- **File**: `experiments/cyber-grid.html`

### 4. Glitch Art (Advanced)
Digital interference and RGB split effects.
- **Tech**: Pixel manipulation, RGB channels
- **Time**: 1 hour
- **File**: `experiments/glitch-art.html`

### 5. Organic Evolution (Advanced)
Generative patterns with geometric shapes.
- **Tech**: Generative algorithms, Canvas API
- **Time**: 2 hours
- **File**: `experiments/organic-evolution.html`

### 6. Digital Rain (Beginner)
Matrix-style falling ASCII characters.
- **Tech**: Text rendering, Canvas API
- **Time**: 30 mins
- **File**: `experiments/digital-rain.html`

## 🔑 GitHub Token Setup

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Lab Gist Manager")
4. Select scope: **gist**
5. Click "Generate token"
6. Copy the token and set it:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

For permanent setup, add to your `~/.bashrc` or `~/.zshrc`:

```bash
echo 'export GITHUB_TOKEN="ghp_your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

## 📖 Workflow

### Creating a New Experiment

1. **Build**: Create standalone HTML file with inline CSS/JS
2. **Metadata**: Add frontmatter with experiment details
3. **Test**: Open locally to verify it works
4. **Publish**: Upload as gist via `gist-manager.js`
5. **Share**: Use the gistpreview.github.io URL
6. **Sync**: Update registry with `sync-registry.js`

### Updating an Experiment

1. **Edit**: Modify the local HTML file
2. **Update**: Push changes via `gist-manager.js update`
3. **Sync**: Refresh registry metadata

### Hosting the Registry

The registry is a static site. Host it anywhere:

- **GitHub Pages**: Push `registry/` to gh-pages branch
- **Netlify/Vercel**: Deploy the `registry` folder
- **Local**: Open `registry/index.html` directly

## 🎯 Why This Approach?

### Advantages

✅ **Zero dependencies** - Just HTML, CSS, JS
✅ **Instant preview** - No build step needed
✅ **Version controlled** - Gists have built-in history
✅ **Easy sharing** - One URL per experiment
✅ **No hosting** - Gists are free, gistpreview handles rendering
✅ **Portable** - Copy/paste HTML anywhere
✅ **Simple** - No webpack, no npm install, no complexity

### Trade-offs

⚠️ **No code splitting** - Everything inline
⚠️ **Limited file size** - Gists have size limits
⚠️ **No external assets** - Images must be data URLs or hosted elsewhere
⚠️ **Manual sync** - Run scripts to update registry

## 🌐 Live Example

Visit the registry at: `registry/index.html`

Each experiment can be viewed:
- **Live**: Via gistpreview.github.io
- **Source**: On GitHub gists
- **Local**: Direct file open

## 📚 Resources

- [GistPreview](https://gistpreview.github.io/) - Live preview for gists
- [GitHub Gists API](https://docs.github.com/en/rest/gists) - API documentation
- [Simon Willison's Blog](https://simonwillison.net/) - Inspiration

## 🤝 Contributing

This is a personal lab, but feel free to:
- Fork and adapt for your own experiments
- Open issues for bugs or suggestions
- Share your own experiment registries!

## 📄 License

MIT License - Do whatever you want with this!

---

**Made with ❤️ by [Josh Mu](https://github.com/joshmu)**
