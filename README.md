# Claude-Code-Morph

A minimal wrapper for Claude CLI that adds safety through MorphBox integration, prompt queuing, and context persistence.

## Features

- 🔒 **Always Safe**: Automatically runs Claude in MorphBox sandbox
- 📝 **Prompt Queue**: Queue up multiple prompts (coming soon)
- 💾 **Context Persistence**: Never lose your place between sessions (coming soon)
- 🔄 **Self-Modifying**: Morph mode lets you improve the tool using Claude itself (coming soon)

## Quick Start

```bash
git clone https://github.com/MicahBly/claude-code-morph
cd claude-code-morph
./bin/morph.js
```

That's it! The script will automatically:
- Install npm dependencies
- Clone and install MorphBox
- Prompt to install QEMU (Linux only)
- Create a secure VM
- Launch Claude

## Installation (Optional)

For global access:
```bash
npm install -g claude-code-morph
# Then from anywhere:
morph
```

Or use without installing:
```bash
npx claude-code-morph
```

## Prerequisites

- **Node.js** 16+ (for npm)
- **Claude CLI** - Install with:
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
- **MorphBox** - Will be installed automatically on first run (if ../morphbox exists)

## Usage

```bash
# Start Claude safely in any directory
morph

# Pass arguments to Claude
morph --help
morph --version

# Skip MorphBox check (unsafe, not recommended!)
morph --skip-morphbox
```

## How It Works

1. When you run `morph`, it checks if you're inside MorphBox
2. If not, it launches MorphBox and re-runs itself inside the sandbox
3. Inside MorphBox, it runs `claude --dangerously-skip-permissions` (safe because of VM isolation)
4. Your current directory is mounted as `/workspace` in the sandbox

## Roadmap

- [ ] Prompt queue with Ctrl+Q hotkey
- [ ] Context persistence to `.claude/`
- [ ] Morph mode for self-modification
- [ ] Community plugin system

## Development

```bash
# Clone the repo
git clone https://github.com/yourusername/claude-code-morph
cd claude-code-morph

# Install dependencies
npm install

# Run locally
node bin/morph.js
```

## License

MIT