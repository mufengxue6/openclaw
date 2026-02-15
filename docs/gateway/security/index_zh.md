**[English](index.md)** | [简体中文]

---
title: "安全概览"
description: "如何安全地运行 OpenClaw，保护您的数据和网络。"
---

# 安全

OpenClaw 是一个极其强大的工具。它就像是在您的计算机上为您打开了一个 shell（终端），并连接到了互联网。**请像对待 root shell 一样对待它。**

默认情况下，OpenClaw 设计为供 **单一可信用户（您）** 使用。当您开始将其连接到群聊或公共频道时，如果不加限制，风险会急剧增加。

## 黄金法则

1.  **不要向互联网公开网关端口**：除非您非常清楚自己在做什么（并使用了密码保护）。
2.  **不要在不信任的群组中给予完全权限**：使用沙箱（Sandbox）模式。
3.  **审查入站流量**：默认拒绝所有未知的私信（DM）。

## 核心层级

OpenClaw 的安全模型由三层组成：

### 1. 网络层 (Network)

控制谁可以连接到网关 API。

- **绑定 (Bind)**: 默认绑定到 `127.0.0.1` (loopback)。这意味着只有本机程序可以访问。
- **认证 (Auth)**:
    - **Token (默认)**: 所有的 WebSocket 和 HTTP 请求必须包含一个随机生成的 Bearer Token。Token 存储在 `~/.openclaw/credentials` 中。
    - **Password**: 您可以设置一个静态密码，这对于 Tailscale Funnel 或公共访问是必须的。
- **Tailscale**: 如果您使用 Tailscale 模式，OpenClaw 会自动利用 Tailscale 的身份验证。

### 2. 消息层 (Messaging)

控制谁可以给智能体发消息。

- **允许列表 (Allowlist)**: 每个频道都有 `allowFrom` 设置。只有列表中的用户 ID（电话号码、用户名、UUID）发送的消息会被处理。
- **配对 (Pairing)**: 对于未知用户，默认策略是 `pairing`。他们会收到一个 6 位数的配对码。您必须在控制台运行 `openclaw pairing approve <channel> <code>` 才能允许他们通过。
- **群组策略**: 群组通常默认是“被动”的（需要 @提及）。

### 3. 执行层 (Execution)

控制智能体可以做什么。

- **主会话 (Main Session)**: 您通过私信（DM）或 CLI 与智能体的直接对话。
    - **默认权限**: **完全访问 (Full Access)**。智能体以您的用户身份运行，可以读取文件、执行命令。
- **非主会话 (Non-Main Sessions)**: 群聊、其他用户的私信。
    - **推荐策略**: **沙箱化 (Sandboxed)**。
    - 在配置中设置 `agents.defaults.sandbox.mode: "non-main"`。
    - 这将强制所有非主会话在 Docker 容器中运行 Bash 命令，从而隔离文件系统和网络风险。

## 沙箱 (Sandboxing)

OpenClaw 支持基于 Docker 的沙箱环境。

要启用它：

1.  确保已安装 Docker 并正在运行。
2.  在 `openclaw.json` 中配置：

```json5
{
  agents: {
    defaults: {
      sandbox: {
        // "off": 所有会话在主机运行 (不安全)
        // "non-main": 仅主会话在主机，其他在 Docker (推荐)
        // "all": 所有会话都在 Docker (最安全)
        mode: "non-main",
      },
    },
  },
}
```

在沙箱中：
- `read`/`write` 工具只能访问容器内的临时工作区。
- `exec` (bash) 命令在容器内运行。
- `browser` 等工具可能会被禁用或受限。

## 敏感数据

- **API 密钥**: 所有的 API 密钥（Anthropic, OpenAI, Telegram 等）都存储在 `~/.openclaw/credentials` 或 `openclaw.json` 中。请确保此文件的权限仅对您的用户可读 (`600`)。
- **会话日志**: 聊天记录存储在 `~/.openclaw/state/sessions`。

## 常见威胁模型

| 场景 | 风险 | 缓解措施 |
| :--- | :--- | :--- |
| **我在 WhatsApp 群里添加了机器人** | 群友可能诱导机器人执行 `rm -rf /` | 启用 **沙箱模式 (`non-main`)**。这样 `rm -rf` 只会删除容器内的临时文件。 |
| **我把网关端口暴露到了公网** | 任何人都可以调用 API 控制您的电脑 | **不要这样做**。使用 Tailscale 或 SSH 隧道。如果必须暴露，强制开启 **密码认证**。 |
| **有人冒充我的 Telegram 用户名** | 攻击者获取控制权 | OpenClaw 优先使用用户 ID (数字 ID) 而非用户名，这更难伪造。但在某些平台上仍需小心。 |
| **提示词注入 (Prompt Injection)** | 攻击者让 AI 忽略您的系统指令 | AI 固有风险。使用更聪明的模型 (如 Claude 3.5 Sonnet / Opus) 并限制敏感工具的访问权限。 |

## 报告漏洞

如果您发现了 OpenClaw 的安全漏洞，请**不要**在 GitHub Issues 中公开提交。
请发送邮件至 `security@openclaw.ai`。我们提供安全赏金计划。
