**[English](wizard.md)** | [简体中文]

---
title: "引导向导"
description: "使用 `openclaw onboard` 进行交互式设置。"
---

# 引导向导

`openclaw onboard` 是设置 OpenClaw 的最简单方法。它是一个交互式的 CLI 工具，会检查您的系统环境并指导您完成配置。

## 运行向导

```bash
openclaw onboard
```

或者，如果您想同时安装后台服务（推荐）：

```bash
openclaw onboard --install-daemon
```

## 向导流程

向导会依次执行以下步骤：

1.  **环境检查**:
    - 检查 Node.js 版本。
    - 检查是否安装了必要的依赖（如 `git`, `docker`）。
    - 检查是否有现有的配置文件。

2.  **模型配置**:
    - 询问您首选的 LLM 提供商（Anthropic, OpenAI 等）。
    - 提示您输入 API Key。向导会验证 Key 是否有效。

3.  **工作区初始化**:
    - 在 `~/.openclaw/workspace` 创建默认的智能体文件 (`AGENTS.md`, `SOUL.md`)。
    - 下载推荐的技能集。

4.  **频道设置 (可选)**:
    - 询问是否要立即配置 WhatsApp、Telegram 或 Discord。
    - 如果选择 WhatsApp，会直接显示二维码进行配对。

5.  **服务安装**:
    - 如果使用了 `--install-daemon`，向导会根据您的操作系统（macOS launchd, Linux systemd, Windows Service）注册并启动 OpenClaw 网关服务。

## 故障排除

如果向导失败：

- **权限错误**: 尝试使用 `sudo openclaw onboard`（仅在 Linux 上如果需要写入系统目录时，通常不推荐，OpenClaw 应以用户身份运行）。
- **端口冲突**: 确保端口 18789 没有被占用。
- **网络问题**: 如果无法下载技能，请检查网络连接或代理设置。

您可以随时重新运行向导来更新配置或修复安装。
