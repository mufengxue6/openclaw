**[English](control-ui.md)** | [简体中文]

---
title: "Web 控制台"
description: "使用浏览器界面管理聊天、配置和节点。"
---

# Web 控制台 (Control UI)

OpenClaw 内置了一个功能强大的 Web 界面，称为 **Control UI**。它直接由网关进程托管，无需额外的 Web 服务器。

## 访问

默认地址：
[http://127.0.0.1:18789/](http://127.0.0.1:18789/)

## 功能模块

### 1. 聊天 (Chat)
这是一个全功能的 Web 聊天客户端。
- **调试**: 在这里与智能体对话，就像在 WhatsApp 上一样。
- **多会话**: 可以切换查看不同的会话（如群聊、子智能体）。
- **工具输出**: 可以看到原始的工具调用和结果（`read`, `exec` 等），非常适合调试智能体行为。

### 2. 配置 (Config)
可视化编辑器，用于修改 `openclaw.json`。
- 支持实时验证 schema。
- 修改后通常需要重启网关才能生效（界面上会有重启按钮）。

### 3. 会话管理 (Sessions)
- 查看当前活跃的会话列表。
- 强制终止卡住的会话。
- 查看 Token 消耗统计。

### 4. 节点 (Nodes)
- 查看已连接的设备（iOS, Android, macOS 节点）。
- 查看节点的状态（电池电量、权限状态）。
- 远程触发节点动作（如“拍摄照片”）。

## 安全性

由于 Control UI 拥有对网关的完全控制权（包括执行命令），默认情况下它 **只绑定到 localhost**。

### 远程访问

如果您想从另一台设备访问 Control UI，请务必配置安全措施：

1.  **Tailscale (推荐)**: 启用 `gateway.tailscale.mode: "serve"`。这样只有您的 Tailscale 网络内的设备可以访问。
2.  **SSH 隧道**: `ssh -L 18789:localhost:18789 user@gateway-host`。
3.  **密码保护**: 如果必须暴露到公网，请在配置中启用 `gateway.auth.mode: "password"` 并设置强密码。
