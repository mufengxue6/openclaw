#!/bin/bash
set -euo pipefail

echo "🔄 Starting sync from official OpenClaw repository..."

# 配置 Git 用户信息
git config --global user.name "GitHub Actions"
git config --global user.email "actions@github.com"

# 添加官方仓库作为 upstream（如果还没有）
if ! git remote get-url upstream >/dev/null 2>&1; then
    echo "Adding upstream remote..."
    git remote add upstream https://github.com/openclaw/openclaw.git
fi

# 获取最新的官方仓库内容
echo "Fetching latest changes from upstream..."
git fetch upstream

# 切换到 beta 分支
echo "Switching to beta branch..."
git checkout beta

# 检查是否有新的提交需要同步
LOCAL_COMMIT=$(git rev-parse HEAD)
UPSTREAM_COMMIT=$(git rev-parse upstream/main)

if [ "$LOCAL_COMMIT" = "$UPSTREAM_COMMIT" ]; then
    echo "✅ No new changes to sync. Local beta branch is already up to date."
    exit 0
fi

echo "Found new changes. Local: $LOCAL_COMMIT, Upstream: $UPSTREAM_COMMIT"

# 重置 beta 分支到官方 main 分支的最新状态
echo "Resetting beta branch to upstream/main..."
git reset --hard upstream/main

# 更新 package.json 版本号（添加 -beta 后缀如果还没有）
VERSION=$(node -p "require('./package.json').version")
if [[ "$VERSION" != *"-beta"* ]]; then
    NEW_VERSION="${VERSION}-beta"
    echo "Updating version from $VERSION to $VERSION (keeping original for npm compatibility)"
    # 注意：npm 不支持 -beta 后缀，所以我们保持原版本号用于 npm 发布
    # 但 GitHub Release 会使用 beta 标签
fi

# 提交更改
echo "Committing synchronized changes..."
git add .
git commit -m "chore: sync with official openclaw/main@$UPSTREAM_COMMIT" || echo "No changes to commit"

# 推送到你的仓库
echo "Pushing to origin/beta..."
git push origin beta --force

echo "✅ Successfully synced official OpenClaw main branch to your beta branch!"