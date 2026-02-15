**[English](slack.md)** | [简体中文]

---
title: "Slack"
description: "通过 Socket Mode 连接 Slack App。"
---

# Slack

OpenClaw 使用 Slack 的 **Socket Mode**，这意味着你不需要将网关暴露给公网，也不需要配置防火墙。

## 应用设置

1.  访问 [api.slack.com/apps](https://api.slack.com/apps)。
2.  创建新应用 ("From scratch")。
3.  **Socket Mode**: 开启 Socket Mode。
4.  **Event Subscriptions**: 
    - 开启 Events。
    - 订阅 Bot Events: `message.channels`, `message.im`, `message.groups`, `app_mention`。
5.  **OAuth & Permissions**:
    - 添加 Scopes: `chat:write`, `files:write`, `channels:history`, `im:history`.
6.  **Install App**: 安装到工作区，获取 `xoxb-` (Bot Token) 和 `xapp-` (App Token)。

## 配置

```json5
{
  channels: {
    slack: {
      botToken: "xoxb-...",
      appToken: "xapp-...",
      
      // 可选：仅允许特定用户
      allowFrom: ["U12345678"],
    }
  }
}
```

## 提及行为

在 Slack 频道中，通常建议配置 OpenClaw 只响应 `@提及`。
如果你订阅了 `message.channels` 但没配置过滤，机器人可能会回复所有消息，造成干扰。

推荐在 `openclaw.json` 中配置：
```json5
{
  channels: {
    slack: {
      groups: {
        "*": { requireMention: true }
      }
    }
  }
}
```
