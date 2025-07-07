# Changelog

## 2025-07-07

### Added
- Interactive Lima installation prompt for Linux users
  - Detects when Lima is not installed before running MorphBox installer
  - Prompts user to install Lima with clear explanation about sudo requirement
  - Handles Lima installation failure gracefully with helpful error messages
  - Improves error detection when morphbox fails due to missing Lima

- KVM virtualization detection and helpful error messages
  - Detects when system lacks KVM support (common on VPS/containers)
  - Provides clear explanation of why MorphBox can't run
  - Suggests alternatives including --skip-morphbox flag
  - Lists common scenarios where KVM is unavailable

### Fixed
- MorphBox installation no longer fails silently when Lima is missing
- Better error messages when sudo is required for installation
- More user-friendly installation flow with clear prompts and options
- Clear guidance when virtualization is not available

### Technical Notes
- Lima fundamentally requires hardware virtualization (KVM) on Linux
- Software emulation (TCG) is not well supported by Lima
- MorphBox now detects this limitation and provides alternatives

### Requirements Clarification
- Removed config bypass options to maintain security integrity
- Made KVM requirement message clearer and more definitive
- This tool is designed for local development machines only
- VPS/cloud servers typically lack the required nested virtualization

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