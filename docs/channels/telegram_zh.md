**[English](telegram.md)** | [简体中文]

---
title: "Telegram"
description: "通过 grammY 框架连接 Telegram Bot API。"
---

# Telegram

OpenClaw 使用 [grammY](https://grammy.dev/) 框架连接标准 Telegram Bots。你需要先通过 [@BotFather](https://t.me/BotFather) 创建一个机器人。

## 配置

```json5
{
  channels: {
    telegram: {
      // 机器人的 API Token
      botToken: "123456789:ABCDefGHIjklMnoPQRstuVWxyz", 
      
      // 安全设置：允许谁与机器人对话 (用户名或数字 ID)
      allowFrom: ["myusername", 12345678],
      
      // 群组设置
      groups: {
        "*": {
          // 推荐在群组中开启，防止机器人回复所有消息
          requireMention: true
        }
      }
    }
  }
}
```

或者使用环境变量 `TELEGRAM_BOT_TOKEN`。

## 功能特性

- **长消息自动分片**：如果回复超过 4096 字符，OpenClaw 会自动将其拆分为多条消息。
- **MarkdownV2 转义**：自动处理 Telegram 复杂的 Markdown 转义规则。
- **命令菜单**：可以通过 `openclaw` CLI 注册 `/commands`。

## Webhook vs Polling

默认情况下，OpenClaw 使用 **长轮询 (Long Polling)**。这最适合本地开发和自托管，不需要公网 IP。

如果需要使用 Webhook（生产环境推荐）：

```json5
{
  channels: {
    telegram: {
      webhookUrl: "https://my-gateway.example.com/webhooks/telegram",
      webhookSecret: "random-string-for-security"
    }
  }
}
```

## 常见问题

**机器人不回复群组消息**
请确保在 @BotFather 中禁用了 "Group Privacy" (Privacy Mode)，或者将机器人设为管理员。如果不禁用隐私模式，机器人只能收到以 `/` 开头的命令或被提及的消息。
