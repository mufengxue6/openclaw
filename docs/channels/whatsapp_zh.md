**[English](whatsapp.md)** | [简体中文]

---
title: "WhatsApp"
description: "通过 Baileys 库连接 WhatsApp。"
---

# WhatsApp

OpenClaw 使用 [Baileys](https://github.com/WhiskeySockets/Baileys) 库直接连接到 WhatsApp Multi-Device API。它不需要 WhatsApp Business API 账户；它就像 WhatsApp Web 一样工作。

## 配置

```json5
{
  channels: {
    whatsapp: {
      // 可选：仅处理来自这些号码的消息
      allowFrom: ["+15550001234"],
      
      // 可选：群组特定设置
      groups: {
        "*": {
          // 在群组中是否需要 @提及 机器人才回复
          requireMention: true, 
        }
      }
    }
  }
}
```

## 认证 (配对)

1.  启动 OpenClaw 网关：`openclaw gateway`。
2.  在另一个终端运行登录命令：
    ```bash
    openclaw channels login
    ```
3.  选择 **WhatsApp**。
4.  终端会显示一个二维码。
5.  打开手机上的 WhatsApp -> 设置 -> 链接设备 -> 链接设备。
6.  扫描二维码。

成功后，凭据将保存在 `~/.openclaw/credentials/whatsapp` 中。

## 功能支持

| 功能 | 支持情况 | 备注 |
| :--- | :--- | :--- |
| 文本消息 | ✅ | |
| 图片发送/接收 | ✅ | 支持自动描述 (Vision) |
| 语音消息 | ✅ | 支持转录 (Whisper) |
| 群聊 | ✅ | 支持提及 (@bot) |
| 反应 (Reactions) | ✅ | |
| 正在输入指示器 | ✅ | |

## 故障排除

**二维码不显示或过期**
二维码在终端中可能因为字体大小或行高问题显示错乱。尝试调整终端缩放，或者使用 Web 控制台查看日志。

**连接断开**
Baileys 会自动尝试重连。如果遇到 "Unauthorized" 错误，可能需要删除 `~/.openclaw/credentials` 并重新扫描。
