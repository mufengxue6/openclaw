**[English](session.md)** | [简体中文]

---
title: "会话 (Session)"
description: "理解会话生命周期、隔离和持久化。"
---

# 会话 (Session)

会话是 OpenClaw 状态管理的核心单元。它代表了智能体与用户（或群组）之间的一段连续对话历史。

## 结构

每个会话在磁盘上是一个 `.jsonl` (JSON Lines) 文件。

路径: `~/.openclaw/state/sessions/<session_key>.jsonl`

```json
{"id":"msg_1", "role":"user", "content":"Hello", "ts":1700000000}
{"id":"msg_2", "role":"assistant", "content":"Hi there!", "ts":1700000005}
```

## 会话密钥 (Session Key)

OpenClaw 使用确定性的算法生成会话密钥，以确保同一用户的消息总是路由到同一个会话。

格式通常为：
`agent:<agent_id>:channel:<channel_name>:thread:<thread_id>`

例如：
- WhatsApp 私信: `agent:main:channel:whatsapp:thread:+15551234567`
- Discord 频道: `agent:main:channel:discord:thread:1234567890`

## 会话类型

### 1. 主会话 (Main Session)
- **ID**: `main`
- **特点**: 持久化，拥有最高权限（默认无沙箱），可以直接操作主机文件系统。
- **用途**: 它是您的“私人助理”。

### 2. 隔离会话 (Isolated Sessions)
- **特点**: 通常用于群组或不受信任的来源。
- **沙箱**: 建议配置为在 Docker 中运行。
- **修剪**: 可能会配置自动清理策略（例如 24 小时无活动则删除历史）。

## 状态管理

- **重置**: 发送 `/reset` 或 `/new` 会归档当前会话文件并开始一个新的。旧文件会被移动到 `archive/` 目录。
- **分叉 (Forking)**: 当一个子智能体被生成时，它可以继承父会话的部分上下文。

## 锁 (Locking)

为了防止竞态条件，网关对每个会话文件实施 **文件锁**。当智能体正在处理某个会话的消息时，新的入站消息会进入 **队列 (Queue)** 等待，直到当前回合结束。
