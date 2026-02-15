**[English](discord.md)** | [简体中文]

---
title: "Discord"
description: "连接 Discord 机器人。"
---

# Discord

通过 `discord.js` 连接。需要创建一个 Discord Application 并添加 Bot 用户。

## 设置步骤

1.  访问 [Discord Developer Portal](https://discord.com/developers/applications)。
2.  创建一个新应用 (Application)。
3.  进入 **Bot** 选项卡，点击 "Add Bot"。
4.  **重要**: 在 "Privileged Gateway Intents" 下，开启 **Message Content Intent**。OpenClaw 需要此权限来读取消息内容。
5.  复制 Token。

## 配置

```json5
{
  channels: {
    discord: {
      token: "OTk5...", 
      
      // 可选：限制仅响应特定服务器 (Guild ID)
      guilds: ["123456789012345678"],
      
      // 机器人状态
      status: "online", // dnd, idle, invisible
      activityType: "listening", // playing, watching...
      activityName: "commands",
    }
  }
}
```

## 权限计算器

邀请机器人时，建议授予以下权限 (OAuth2 URL Generator):
- Read Messages / View Channels
- Send Messages
- Send Messages in Threads
- Embed Links
- Attach Files
- Read Message History
- Add Reactions

## 线程与论坛 (Threads & Forums)

OpenClaw 对 Discord 线程有很好的支持：
- 自动识别并回复线程中的消息。
- 支持在论坛频道 (Forum Channels) 中创建新帖。
- 上下文感知：会话历史会自动包含线程中的前文。
