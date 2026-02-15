**[English](models.md)** | [简体中文]

---
title: "模型 (Models)"
description: "配置 LLM 提供商、模型选择和别名。"
---

# 模型

OpenClaw 支持所有主流的 LLM 提供商。您可以全局配置默认模型，也可以为特定任务覆盖模型。

## 支持的提供商

- **Anthropic**:Claude 3.5 Sonnet, Opus, Haiku
- **OpenAI**: GPT-4o, o1, o3-mini
- **Google**: Gemini 1.5 Pro/Flash
- **DeepSeek**: DeepSeek-V3, R1
- **Ollama**: 本地模型 (Llama 3, Qwen 等)
- **OpenRouter / LiteLLM**: 聚合层，支持几乎所有模型

## 配置

在 `openclaw.json` 中配置认证信息：

```json5
{
  agent: {
    // 默认模型
    model: "anthropic/claude-3-5-sonnet-latest",
  },
  // 提供商凭据 (也可以使用环境变量如 ANTHROPIC_API_KEY)
  auth: {
    anthropic: {
      key: "sk-ant-...",
    },
    openai: {
      key: "sk-...",
    }
  }
}
```

## 模型别名 (Aliases)

为了方便在 CLI 中切换，您可以定义别名：

```json5
{
  models: {
    aliases: {
      "smart": "anthropic/claude-3-5-sonnet-latest",
      "fast": "openai/gpt-4o-mini",
      "local": "ollama/llama3",
    }
  }
}
```

使用别名：
```bash
openclaw agent --model fast --message "Hi"
```

## 推理模型 (Thinking Models)

对于像 OpenAI o1/o3 或 DeepSeek R1 这样的推理模型，OpenClaw 会自动处理特殊的推理标签（如 `<thinking>`），并可以选择是否在 UI 中展示思考过程。

配置显示级别：
`agent.thinking: "high"` (显示全部思考过程) 或 `"low"` (仅显示摘要)。
