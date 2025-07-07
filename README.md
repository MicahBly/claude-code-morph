# Claude-Code-Morph

A minimal wrapper for Claude CLI that adds safety through MorphBox integration, prompt queuing, and context persistence.

## Features

- 🔒 **Always Safe**: Automatically runs Claude in MorphBox sandbox
- 📝 **Prompt Queue**: Queue up multiple prompts (coming soon)
- 💾 **Context Persistence**: Never lose your place between sessions (coming soon)
- 🔄 **Self-Modifying**: Morph mode lets you improve the tool using Claude itself (coming soon)

## Installation

```bash
npm install -g claude-code-morph
```

Or use without installing:
```bash
npx claude-code-morph
```

## Prerequisites

1. **MorphBox** - Install with:
   ```bash
   curl -sSf https://morphbox.iu.dev/install.sh | bash
   ```

2. **Claude CLI** - Install with:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

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