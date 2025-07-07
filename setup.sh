#!/bin/bash
# One-time setup script for claude-code-morph

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Claude-Code-Morph Setup${NC}"
echo "========================"
echo ""

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

# Install Node.js dependencies
echo -e "${GREEN}Installing Node.js dependencies...${NC}"
npm install

# Check for MorphBox
if ! command -v morphbox &> /dev/null; then
    echo -e "${YELLOW}MorphBox not found. Installing...${NC}"
    if [[ -d "../morphbox" ]]; then
        cd ../morphbox && ./install.sh && cd -
    else
        echo -e "${RED}MorphBox directory not found at ../morphbox${NC}"
        echo "Please clone MorphBox first:"
        echo "  git clone https://github.com/yourusername/morphbox ../morphbox"
        exit 1
    fi
fi

# Check for QEMU on Linux
if [[ "$OS" == "linux" ]] && ! command -v qemu-img &> /dev/null; then
    echo -e "${YELLOW}QEMU is required on Linux. Please install it:${NC}"
    
    if command -v apt-get &> /dev/null; then
        echo "  sudo apt-get install -y qemu-system-x86 qemu-utils"
    elif command -v dnf &> /dev/null; then
        echo "  sudo dnf install -y qemu"
    elif command -v pacman &> /dev/null; then
        echo "  sudo pacman -S qemu"
    else
        echo "  Please install QEMU for your distribution"
    fi
    
    echo ""
    echo -e "${YELLOW}After installing QEMU, run this setup again.${NC}"
    exit 1
fi

# Create symlink for global access
echo -e "${GREEN}Creating global command...${NC}"
if [[ -w "/usr/local/bin" ]]; then
    ln -sf "$(pwd)/bin/morph.js" /usr/local/bin/morph
    echo -e "${GREEN}✅ You can now use 'morph' from anywhere!${NC}"
else
    echo -e "${YELLOW}Cannot create global symlink. To use globally, run:${NC}"
    echo "  sudo ln -sf $(pwd)/bin/morph.js /usr/local/bin/morph"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start using Claude-Code-Morph:"
echo "  morph"
echo "  # or"
echo "  ./bin/morph.js"
echo ""
echo "First run will take a few minutes to create the MorphBox VM."