**[English](agent.md)** | [简体中文]

---
title: "智能体 (Agent)"
description: "OpenClaw 中的智能体运行时：思考、工具使用和循环。"
---

# 智能体 (Agent)

在 OpenClaw 中，"智能体" 指的是驱动对话的 AI 逻辑。目前，OpenClaw 默认集成并使用 **Pi** (Personal Intelligence) 作为其智能体运行时。

## 什么是 Pi?

Pi 是一个无状态的、基于 RPC 的 AI 运行时。它不存储记忆（那是网关的工作），它只负责：
1.  接收当前上下文（消息历史、可用工具）。
2.  思考（调用 LLM）。
3.  决定下一步操作（回复用户、调用工具）。

## 智能体循环 (The Loop)

当网关收到消息时，它会触发智能体循环：

1.  **准备上下文**: 网关从数据库拉取最近的 N 条消息。
2.  **系统提示**: 注入 `AGENTS.md`, `SOUL.md` 等身份文件。
3.  **工具注入**: 注入当前会话可用的工具定义（如 `read`, `web_search`）。
4.  **推理 (Inference)**: 将所有内容发送给 LLM。
5.  **执行 (Execution)**: 
    - 如果 LLM 返回文本 -> 发送给用户。
    - 如果 LLM 请求工具调用 -> 网关执行工具（如读取文件） -> 将结果追加到历史 -> **回到步骤 4**。

这个循环会一直持续，直到 LLM 决定停止或达到最大回合数。

## 配置智能体

在 `openclaw.json` 中：

```json5
{
  agent: {
    // 模型选择
    model: "anthropic/claude-3-5-sonnet-latest",
    
    // 思考深度 (针对支持 CoT 的模型)
    thinking: "medium",
    
    // 单次回复的最大工具调用轮数 (防止死循环)
    maxSteps: 10,
  }
}
```

## 多智能体 (Multi-Agent)

OpenClaw 支持在同一个网关上运行多个“人格”或“智能体”。
通过 `sessions` 工具，主智能体甚至可以“生成”子智能体来处理特定任务。

详见 [多智能体文档](/concepts/multi-agent)。
