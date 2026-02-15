**[English](configuration.md)** | [简体中文]

---
title: "配置参考"
description: "OpenClaw 网关的完整配置参考 (openclaw.json)。"
---

# 配置参考

OpenClaw 从 `~/.openclaw/openclaw.json` (或 `OPENCLAW_CONFIG_PATH` 指定的路径) 加载配置。
文件格式支持 JSON5 (允许注释和尾随逗号) 或标准 JSON。

## 最小配置

```json5
{
  // 所有的默认值通常都够用了，但你通常需要选择一个模型。
  agent: {
    model: "anthropic/claude-opus-4-6",
  },
  // 除非你想完全匿名运行，否则至少配置一个频道。
  channels: {
    whatsapp: {
      // 允许谁和你聊天
      allowFrom: ["+15550001234"],
    },
  },
}
```

## 顶层结构

| 键 | 类型 | 描述 |
| :--- | :--- | :--- |
| `agent` | `object` | 智能体运行时设置 (模型, 超时, 系统提示词)。 |
| `gateway` | `object` | 服务器设置 (端口, 认证, 远程访问)。 |
| `channels` | `object` | 聊天平台配置 (WhatsApp, Telegram, Discord 等)。 |
| `messages` | `object` | 消息路由规则 (群组, 提及, 媒体)。 |
| `skills` | `object` | 技能加载和注册表设置。 |
| `logging` | `object` | 日志级别和格式。 |

## Agent (智能体)

控制 AI 如何思考和回应。

```json5
{
  agent: {
    // 主要模型 ID (提供商/模型名称)
    // 参见: `openclaw models list`
    model: "anthropic/claude-3-5-sonnet-latest",

    // 思考/推理级别 (仅限支持的模型，如 o1/r1)
    // 值: "off", "low", "medium", "high"
    thinking: "low",

    // 系统提示词覆盖 (默认是从 AGENTS.md 加载)
    // 警告: 覆盖此项可能会破坏某些工具的使用能力。
    systemPrompt: "你是一个有用的助手...",

    // 这里定义的工具将对所有会话可用
    tools: {
      // 启用/禁用特定工具
      browser: true,
      chart: false,
    },
  },
}
```

## Gateway (网关)

控制服务器进程、网络和安全。

```json5
{
  gateway: {
    // 监听端口 (默认: 18789)
    port: 18789,

    // 绑定地址
    // "loopback" (仅本机), "all" (0.0.0.0), 或具体 IP
    bind: "loopback",

    // 认证策略
    auth: {
      // "token" (默认), "password", "none" (不推荐)
      mode: "token",
      // 用于 "password" 模式的静态密码
      password: "secret-admin-pass",
    },

    // Tailscale 自动化 (Serve/Funnel)
    tailscale: {
      // "off", "serve" (仅内网), "funnel" (公网)
      mode: "serve",
      // 进程退出时是否移除 Serve/Funnel 配置
      resetOnExit: true,
    },
  },
}
```

## Channels (频道)

配置你想要连接的平台。未配置的频道将不会启动。

### WhatsApp

基于 Baileys 库。需要扫描二维码登录。

```json5
{
  channels: {
    whatsapp: {
      // 自动接受来自这些号码的消息
      allowFrom: ["+1234567890"],
      // 群组策略
      groups: {
        // "*" 匹配所有群组
        "*": {
          // 是否需要 @提及 机器人才回复
          requireMention: true,
        },
        // 特定群组 ID 的覆盖设置
        "123456@g.us": {
          requireMention: false, // 在这个群里即使不 @ 也回复
        },
      },
    },
  },
}
```

### Telegram

需要 Bot Token。

```json5
{
  channels: {
    telegram: {
      botToken: "123456:ABC-DEF...", // 或使用环境变量 TELEGRAM_BOT_TOKEN
      allowFrom: ["username", 12345678], // 用户名或 ID
    },
  },
}
```

### Discord

需要 Bot Token。

```json5
{
  channels: {
    discord: {
      token: "...", // 或使用环境变量 DISCORD_BOT_TOKEN
      // 限制机器人只响应特定的服务器 (Guilds)
      guilds: ["123456789012345678"],
    },
  },
}
```

### BlueBubbles (iMessage)

推荐的 iMessage 解决方案。

```json5
{
  channels: {
    bluebubbles: {
      serverUrl: "http://localhost:1234",
      password: "password",
      // Webhook 路径，用于接收消息
      webhookPath: "/bluebubbles/webhook",
    },
  },
}
```

## Skills (技能)

管理工具和能力。

```json5
{
  skills: {
    // 自动从 ClawHub 下载缺失的技能
    autoInstall: true,
    
    // 技能搜索路径
    paths: ["./skills", "./workspace/skills"],
    
    // 允许使用的技能列表 (空列表代表允许所有)
    allowlist: ["weather", "search"],
    
    // 禁止使用的技能
    denylist: ["dangerous-skill"],
  },
}
```
