**[English](multi-agent.md)** | [简体中文]

---
title: "多智能体 (Multi-Agent)"
description: "在一个网关上运行多个 AI 人格和子任务。"
---

# 多智能体架构

OpenClaw 不仅仅是一个聊天机器人，它是一个 **智能体操作系统**。它支持两种形式的多智能体协作。

## 1. 静态多智能体 (工作区隔离)

您可以配置网关根据来源（频道、发送者）将消息路由到不同的 **工作区 (Workspace)**。

每个工作区都有自己独立的：
- `AGENTS.md` (规则)
- `SOUL.md` (人格)
- `MEMORY.md` (长期记忆)
- 技能集

**用例**:
- `work` 智能体：处理 Slack 消息，专业语气，访问 GitHub 技能。
- `personal` 智能体：处理 WhatsApp，幽默语气，访问家庭自动化技能。

配置示例：
```json5
{
  agents: {
    overrides: [
      {
        match: { channel: "slack" },
        workspace: "~/.openclaw/workspaces/work",
      },
      {
        match: { channel: "whatsapp" },
        workspace: "~/.openclaw/workspaces/personal",
      }
    ]
  }
}
```

## 2. 动态多智能体 (Sub-Agents)

主智能体可以在运行时 **生成 (Spawn)** 子智能体来执行特定任务。

**工作流**:
1.  用户说："研究这个话题并写一份报告。"
2.  主智能体调用 `sessions_spawn` 工具。
3.  网关创建一个临时的、隔离的会话（子智能体）。
4.  子智能体在后台运行（可能在 Docker 沙箱中），使用浏览器搜索、阅读文档。
5.  子智能体完成后，将结果报告回主智能体。
6.  主智能体整合结果并回复用户。

这种模式极大地提高了复杂任务的成功率，因为子智能体可以专注于单一目标，且不会污染主会话的上下文窗口。

## 工具

- `sessions_spawn`: 启动子任务。
- `sessions_list`: 查看正在运行的子智能体。
- `sessions_send`: 向子智能体发送指令或接收更新。
