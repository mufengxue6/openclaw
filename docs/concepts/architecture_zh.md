**[English](architecture.md)** | [简体中文]

---
title: "架构"
description: "OpenClaw 内部工作原理：网关、会话、工具和节点。"
---

# 架构

OpenClaw 遵循 **本地优先 (Local-First)** 和 **以智能体为中心 (Agent-Centric)** 的设计哲学。

系统的核心不是聊天机器人，而是一个 **通用网关 (Gateway)**。

## 高层视图

```mermaid
graph TD
    User[用户 / 聊天应用] -->|Web/WS| Gateway[OpenClaw 网关]
    Gateway -->|RPC| Agent[AI 智能体 (Pi)]
    Gateway -->|WS| Node1[iOS 节点]
    Gateway -->|WS| Node2[macOS 节点]
    Gateway -->|CDP| Browser[Chrome 浏览器]
    
    subgraph Host[主机 / 容器]
        Gateway
        Agent
        Browser
    end
```

1.  **网关 (Gateway)**: 中央枢纽。管理连接、认证、路由和状态。
2.  **智能体 (Agent)**: 大脑。当前使用 `Pi` 运行时，通过 RPC 与网关通信。
3.  **节点 (Nodes)**: 扩展设备。手机、平板或另一台电脑，提供摄像头、传感器或屏幕。

## 核心概念

### 1. 会话 (Session)

每一次对话都是一个 **会话**。

- **主会话 (Main Session)**: 这是您与智能体的私密、长期对话。它拥有最高权限，状态持久化。
- **临时会话 (Ephemeral/Group Sessions)**: 每个群聊或每个陌生人的私信都会启动一个新的会话。这些会话通常是隔离的，并且可能会在一段时间不活动后被修剪（Pruned）。

会话文件存储在 `~/.openclaw/state/sessions/<session_id>.jsonl`。

### 2. 工具 (Tools)

工具是智能体与世界互动的“手”。

- **内置工具**: `read` (读文件), `write` (写文件), `exec` (运行命令), `browser` (控制浏览器)。
- **外部工具**: 通过插件或 MCP (Model Context Protocol) 扩展。
- **节点工具**: 当您连接一个 iOS 节点时，它会向网关注册 `camera.snap` 工具。智能体可以直接调用这个工具，网关会将其路由到手机执行。

### 3. 频道 (Channels)

频道是连接外部世界的“耳朵”和“嘴巴”。

OpenClaw 使用 **适配器模式**。无论是 WhatsApp、Telegram 还是 HTTP Webhook，都被归一化为标准的 `Message` 对象。

```typescript
interface Message {
  id: string;
  body: string;
  sender: {
    id: string;
    name?: string;
  };
  threadId?: string;
  attachments?: Attachment[];
}
```

### 4. 路由 (Routing)

当收到消息时，网关决定将其发送给哪个会话：

1.  **解析**: 识别发送者 ID 和来源频道。
2.  **查找**: 检查是否存在该发送者的现有会话。
3.  **创建**: 如果不存在，根据配置（如 `model`，`systemPrompt`）创建一个新会话。
4.  **分发**: 将消息追加到会话记录，并唤醒智能体。

## 进程模型

默认情况下，OpenClaw 作为单一的 Node.js 进程运行 (`openclaw gateway`)。

- **轻量级**: 内存占用低，适合在树莓派或 VPS 上运行。
- **可扩展**: 虽然是单进程，但利用了 Node.js 的异步 I/O 处理高并发连接。
- **沙箱**: 如果启用了 Docker 沙箱，网关会为每个受限会话启动一个临时的 Docker 容器来执行命令。

## 目录结构

OpenClaw 遵循 XDG 规范（在 Linux 上）或标准惯例：

- **Config**: `~/.openclaw/openclaw.json` (macOS/Linux)
- **State**: `~/.openclaw/state/` (数据库、会话日志)
- **Cache**: `~/.openclaw/cache/` (临时文件、下载)
- **Workspace**: `~/.openclaw/workspace/` (智能体的工作目录)

## 通信协议

网关对外暴露两套 API：

1.  **WebSocket API (`/ws`)**: 实时控制平面。
    - CLI 工具 (`openclaw agent`) 使用此接口流式传输响应。
    - Web 控制台使用此接口同步状态。
    - 节点设备使用此接口注册能力。
2.  **HTTP API**: 用于 Webhook 回调、文件上传/下载和简单的 REST 调用。

所有 API 均受 Bearer Token 保护。
