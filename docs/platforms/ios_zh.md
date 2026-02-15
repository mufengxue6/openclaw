**[English](ios.md)** | [简体中文]

---
title: "iOS 节点"
description: "将 iPhone 或 iPad 变成 OpenClaw 的眼睛和耳朵。"
---

# iOS 节点

OpenClaw iOS 应用作为一个 **节点 (Node)** 运行。它不运行网关本身，而是连接到您现有的网关（在 Mac/Linux/Windows 上）。

## 功能

连接后，您的 iOS 设备将向智能体提供以下能力：

- **摄像头 (Camera)**: 智能体可以调用 `camera.snap` 拍摄前置/后置照片。
- **屏幕录制 (Screen)**: 智能体可以查看您的屏幕内容（需广播权限）。
- **语音唤醒 (Voice Wake)**: 即使在锁屏状态下，也能通过语音指令唤醒智能体。
- **对话模式 (Talk Mode)**: 一个全屏的语音对话界面。
- **Canvas**: 一个可交互的 UI 表面，智能体可以在上面绘制按钮、表单和内容。

## 配对 (Pairing)

1.  **在 iOS 上**: 打开应用。如果是首次运行，它会寻找局域网内的网关（通过 Bonjour）。
2.  **在网关上**: 运行 `openclaw nodes pending` 查看待批准的设备。
3.  **批准**: 运行 `openclaw nodes approve <device-id>`。

或者手动输入网关地址：`ws://<gateway-ip>:18789`。

## 快捷指令 (Shortcuts)

iOS 应用暴露了 Siri Shortcuts 操作：
- **Ask OpenClaw**: 发送文本并获取回复。
- **Voice Mode**: 直接启动语音对话。

您可以将这些操作绑定到操作按钮 (Action Button) 或背部轻拍 (Back Tap)。

## 常见问题

**无法发现网关**
确保 iPhone 和网关在同一个 Wi-Fi 网络下。有些路由器会阻止 mDNS (Bonjour) 广播。如果是这种情况，请尝试在 iOS 应用设置中手动输入网关 IP。

**连接断开**
iOS 对后台应用有严格限制。为了保持连接，建议开启 "Voice Wake"（这会利用后台音频权限保活），或者将设备插上电源。
