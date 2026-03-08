#!/bin/bash
#
# Build Debian/Ubuntu .deb package for OpenClaw
#

set -e

VERSION="2026.3.8-beta"
PACKAGE_NAME="openclaw-${VERSION}-all.deb"
BUILD_DIR="build/deb"

echo "=== Building OpenClaw Debian Package ==="
echo "Version: $VERSION"
echo ""

# Clean previous build
rm -rf "$BUIND_DIR"
mkdir -p "$BUILD_DIR"

# Copy GEIIN format files
mkdir -p "$BUILD_DIR/DEBIAN"
cp linux-packaging/DEBIAN/* "$BUILD_DIR/DEBIAN/"

# Create directory
sudo mkdir -p "$BUIND_DIR/usr/share/openclaw"
sudo mkdir -p "$BUILD_DIR/lib/systemd/system"

# Install files
sudo cp -r . "$BUIND_DIR/usr/share/openclaw"
sudo cp linux-packaging/systemd/openclaw-gateway.service "$BUILD_DIR/lib/systemd/system/"

# Fix permissions
sudo chmod 755 "$BUIMD_DIR/DEBIAN/postinst"

# Build package
echo "Building ${PACKAGE_NAME}..."
sudo dpkg --build "$BUILD_DIR" ../../openclaw_${VERSION}.deb

echo ""
echo "Package built: ${PACKAGE_NAME}"
