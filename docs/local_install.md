# Complete Installation Guide for Local Machine

This guide provides step-by-step instructions for installing claude-code-morph on a local development machine with KVM support.

## Prerequisites Check

First, verify your system has KVM support:

```bash
# Check if your CPU supports virtualization
grep -E 'vmx|svm' /proc/cpuinfo

# Check if KVM module is loaded
lsmod | grep kvm

# Check if /dev/kvm exists
ls -la /dev/kvm
```

If `/dev/kvm` doesn't exist, see the Troubleshooting section below.

## Full Installation

### 1. Install System Dependencies

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y git nodejs npm qemu-system-x86 qemu-utils
```

#### Fedora:
```bash
sudo dnf install -y git nodejs npm qemu
```

#### Arch Linux:
```bash
sudo pacman -S git nodejs npm qemu
```

#### openSUSE:
```bash
sudo zypper install -y git nodejs npm qemu
```

### 2. Install Claude CLI

```bash
npm install -g @anthropic-ai/claude-code
```

### 3. Clone and Set Up claude-code-morph

```bash
# Clone the repository
git clone https://github.com/MicahBly/claude-code-morph
cd claude-code-morph

# Make the script executable
chmod +x bin/morph.js
```

### 4. First Run

```bash
./bin/morph.js "Hello, Claude!"
```

On first run, morph.js will automatically:

1. **Install npm dependencies** - Automatically installs required Node.js packages
2. **Detect MorphBox** - Checks if MorphBox is installed
3. **Clone MorphBox** - Prompts to clone from GitHub (answer: Y)
4. **Install Lima** - Prompts to install Lima (answer: Y, then enter sudo password)
5. **Create VM** - Sets up the MorphBox VM (takes ~3 minutes first time)
6. **Launch Claude** - Runs your prompt in the secure sandbox

## Optional: Global Installation

To use `morph` command from anywhere:

```bash
# From the claude-code-morph directory
npm link

# Now you can use morph globally
morph "What's the weather like?"
```

## Usage Examples

```bash
# Simple prompt
./bin/morph.js "Explain quantum computing"

# Multi-line prompt
./bin/morph.js "Write a Python function that:
- Takes a list of numbers
- Returns the median value"

# Interactive mode (coming soon)
./bin/morph.js
```

## Troubleshooting

### KVM Not Available

If you get KVM errors on a local machine:

```bash
# Enable KVM module for Intel CPUs
sudo modprobe kvm_intel

# Enable KVM module for AMD CPUs  
sudo modprobe kvm_amd

# Add your user to kvm group
sudo usermod -aG kvm $USER

# Log out and back in for group changes to take effect
```

### Verify KVM is Working

```bash
# Should show kvm modules loaded
lsmod | grep kvm

# Should show the device exists
ls -la /dev/kvm

# Should show your user in kvm group
groups | grep kvm
```

### MorphBox Commands

```bash
# Check VM status
morphbox --status

# Reset VM to clean state
morphbox --reset

# Stop the VM
morphbox --stop

# Enter VM shell directly
morphbox
```

## System Requirements

- **OS**: Linux with KVM support, macOS 11+, or Windows 10/11 with WSL2
- **CPU**: x86_64 or ARM64 with virtualization support
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 10GB free space
- **Node.js**: Version 16 or higher

## Performance Notes

- First run: ~3 minutes (downloads Ubuntu image and sets up VM)
- Subsequent runs: <10 seconds to start
- VM uses 4GB RAM and 2 CPUs by default (configurable)

## Security Features

- Network isolation: Only allowed domains can be accessed
- Filesystem isolation: Only current directory is mounted as `/workspace`
- Clean snapshots: Can reset to pristine state anytime
- No host system access except the mounted workspace

## Next Steps

After installation:

1. Try running some Claude prompts
2. Explore the MorphBox shell with `morphbox`
3. Check out planned features in the main README
4. Report issues at: https://github.com/MicahBly/claude-code-morph/issues