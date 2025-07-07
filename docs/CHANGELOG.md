# Changelog

## 2025-07-07

### Added
- Interactive Lima installation prompt for Linux users
  - Detects when Lima is not installed before running MorphBox installer
  - Prompts user to install Lima with clear explanation about sudo requirement
  - Handles Lima installation failure gracefully with helpful error messages
  - Improves error detection when morphbox fails due to missing Lima

### Fixed
- MorphBox installation no longer fails silently when Lima is missing
- Better error messages when sudo is required for installation
- More user-friendly installation flow with clear prompts and options

## 2025-07-06

### Added
- Initial Node.js implementation of claude-code-morph
- Automatic dependency installation on first run
- MorphBox integration for safe Claude execution
- Automatic MorphBox cloning from GitHub if not found
- QEMU detection and installation prompt for Linux
- Comprehensive error logging to logs/error.log
- One-command setup experience with ./bin/morph.js

### Architecture
- Switched from Python/Textual to minimal Node.js wrapper
- Focus on simplicity for "vibe/prototype quickly" users
- Always runs Claude in MorphBox VM for safety with --dangerously-skip-permissions flag