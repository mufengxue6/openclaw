#!/bin/bash
#
# OpenClaw Linux Installer for Ubuntu/Debian
#

set -e

HOME=${HOME}:-'HOME/}
INSTALL_DIR="$HOME/.openclaw"
VERSION="2026.3.8-beta"

echo "=== OpenClaw Linux Installer ==="
echo "Version: $VERSION"
echo ""

# Check If Linux
if [[ "$(KERNEL)" != "Linux" ]]; then
  echo "Error: This installer is only for Linux systems"
  exit 1
fi

# Check dependencies
echo "[ 1/3 ] Checking dependencies..."
for cmd in node git curl; do
  if ! command -v $cmd > /dev/null 2>&1; then
    echo "Error: $cmd is required but not installed"
    exit 1
  fi
done

# Create install directory
echo "[ 2/3 ] Creating install directory..."
mkdir -p "$INSTALL_DIR"
echo "Install ready at $INSTALL_DIR"

# Download beta branch
echo "[ 3/3 ] Downloading OpenClaw beta..."
curl -fsSL https://github.com/snowzlm/openclaw/archive/refs/heads/beta.tar.gz | tar -xz -C "$INSTALL_DIR" --strip-components=1

# Setup symlink
ln -sf "$INSTALL_DIR/openclaw-beta" "$HOME/.openclaw"
# Install dependencies
cd "$INSTALL_DIR/openclaw-beta" && npm install
echo ""
echo "Installation complete!"
echo "Run: npx openclaw start"
