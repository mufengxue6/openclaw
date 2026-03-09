#!/bin/bash
set -euo pipefail

# OpenClaw Beta Installer for macOS and Linux
# Modified to download from snowzlm/openclaw beta releases
# Usage: curl -fsSL --proto '=https' --tlsv1.2 https://raw.githubusercontent.com/snowzlm/openclaw/beta/scripts/install.sh | bash

BOLD='\033[1m'
ACCENT='\033[38;2;255;77;77m'
INFO='\033[38;2;136;146;176m'
SUCCESS='\033[38;2;0;229;204m'
WARN='\033[38;2;255;176;32m'
ERROR='\033[38;2;230;57;70m'
MUTED='\033[38;2;90;100;128m'
NC='\033[0m'

# ======= 修改的下载链接配置 =======
# 替换为 snowzlm/openclaw beta 分支的发布链接
GITHUB_REPO="snowzlm/openclaw"
BETA_VERSION="2026.3.8-beta.1"
RELEASE_URL="https://github.com/snowzlm/openclaw/releases/download/v2026.3.8-beta.1/OpenClaw-2026.3.8.zip"
# ===================================

DEFAULT_TAGLINE="All your chats, one OpenClaw."
NODE_MIN_MAJOR=22
NODE_MIN_MINOR=12
NODE_MIN_VERSION="${NODE_MIN_MAJOR}.${NODE_MIN_MINOR}"

TMPFILES=()
cleanup_tmpfiles() {
    local f
    for f in "${TMPFILES[@]:-}"; do
        rm -rf "$f" 2>/dev/null || true
    done
}
trap cleanup_tmpfiles EXIT

mktempfile() {
    local f
    f="$(mktemp)"
    TMPFILES+=("$f")
    echo "$f"
}

DOWNLOADER=""
detect_downloader() {
    if command -v curl &> /dev/null; then
        DOWNLOADER="curl"
        return 0
    fi
    if command -v wget &> /dev/null; then
        DOWNLOADER="wget"
        return 0
    fi
    echo "Missing downloader (curl or wget required)"
    exit 1
}

download_file() {
    local url="$1"
    local output="$2"
    if [[ -z "$DOWNLOADER" ]]; then
        detect_downloader
    fi
    if [[ "$DOWNLOADER" == "curl" ]]; then
        curl -fsSL --proto '=https' --tlsv1.2 --retry 3 --retry-delay 1 --retry-connrefused -o "$output" "$url"
        return
    fi
    wget -q --https-only --secure-protocol=TLSv1_2 --tries=3 --timeout=20 -O "$output" "$url"
}

# 检测操作系统和架构
detect_os() {
    case "$(uname -s 2>/dev/null || true)" in
        Darwin) echo "macos" ;;
        Linux) echo "linux" ;;
        *) echo "unknown" ;;
    esac
}

detect_arch() {
    case "$(uname -m 2>/dev/null || true)" in
        x86_64|amd64) echo "x64" ;;
        arm64|aarch64) echo "arm64" ;;
        *) echo "unknown" ;;
    esac
}

# 获取下载链接
get_download_url() {
    echo "$RELEASE_URL"
}

# 主要安装函数
main() {
    echo -e "${BOLD}${ACCENT}OpenClaw Beta Installer${NC}"
    echo -e "${INFO}Repository: ${GITHUB_REPO}${NC}"
    echo -e "${INFO}Version: ${BETA_VERSION}${NC}"
    echo ""
    
    local os arch download_url
    os="$(detect_os)"
    arch="$(detect_arch)"
    
    echo -e "${INFO}Detected: $os / $arch${NC}"
    
    if [[ "$os" == "unknown" ]]; then
        echo -e "${ERROR}Unsupported operating system${NC}"
        exit 1
    fi
    
    download_url="$(get_download_url "$os" "$arch")"
    
    if [[ -z "$download_url" ]]; then
        echo -e "${ERROR}Unsupported architecture: $arch${NC}"
        echo -e "${INFO}Supported: x64, arm64${NC}"
        exit 1
    fi
    
    echo -e "${INFO}Download URL: $download_url${NC}"
    echo ""
    
    # 创建临时目录
    local tmpdir
    tmpdir="$(mktemp -d)"
    TMPFILES+=("$tmpdir")
    
    local archive_name="openclaw-beta.zip"
    local archive_path="$tmpdir/$archive_name"
    
    # 下载
    echo -e "${INFO}Downloading from ${RELEASE_URL}...${NC}"
    if ! download_file "$RELEASE_URL" "$archive_path"; then
        echo -e "${ERROR}Download failed${NC}"
        exit 1
    fi
    
    echo -e "${SUCCESS}Download complete${NC}"
    
    # 解压
    echo -e "${INFO}Extracting...${NC}"
    if ! unzip -q "$archive_path" -d "$tmpdir"; then
        echo -e "${ERROR}Extraction failed${NC}"
        exit 1
    fi
    
    echo -e "${SUCCESS}Extraction complete${NC}"
    
    # 安装到 /usr/local/bin
    local install_dir="/usr/local/bin"
    local binary_name="openclaw"
    
    # 查找解压后的二进制文件
    local binary_path
    binary_path="$(find "$tmpdir" -name "openclaw*" -type f | head -1)"
    
    if [[ -z "$binary_path" ]]; then
        echo -e "${ERROR}Could not find openclaw binary in archive${NC}"
        exit 1
    fi
    
    echo -e "${INFO}Installing to $install_dir/$binary_name...${NC}"
    
    # 检查是否需要 sudo
    if [[ -w "$install_dir" ]]; then
        mv "$binary_path" "$install_dir/$binary_name"
        chmod +x "$install_dir/$binary_name"
    else
        echo -e "${WARN}Need sudo permission to install to $install_dir${NC}"
        sudo mv "$binary_path" "$install_dir/$binary_name"
        sudo chmod +x "$install_dir/$binary_name"
    fi
    
    echo ""
    echo -e "${SUCCESS}✓ OpenClaw Beta installed successfully!${NC}"
    echo ""
    echo -e "${INFO}Version:${NC}"
    openclaw --version
    echo ""
    echo -e "${INFO}Usage:${NC}"
    echo "  openclaw --help"
    echo ""
}

# 运行主函数
main "$@"
