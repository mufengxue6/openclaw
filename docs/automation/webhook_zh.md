**[English](webhook.md)** | [简体中文]

---
title: "Webhooks"
description: "从外部系统触发智能体。"
---

# Webhooks

OpenClaw 允许外部服务（如 GitHub Actions, IFTTT, Zapier）通过 HTTP POST 请求触发智能体。

## 端点

`POST /api/webhook/:id`

`:id` 是您在配置中定义的 Webhook ID。

## 配置

在 `openclaw.json` 中定义 Webhook：

```json5
{
  automation: {
    webhooks: {
      "deploy-success": {
        // 当收到请求时，执行此操作
        action: "send",
        target: "whatsapp:+15551234567",
        message: "部署成功！版本: {{body.version}}"
      },
      "alert": {
        action: "agent",
        message: "收到警报：{{body.alert_name}}。请检查日志并告诉我发生了什么。"
      }
    }
  }
}
```

## 有效载荷 (Payload)

请求体必须是 JSON。您可以在配置中使用模板变量 `{{body.field}}` 来引用请求中的数据。

**示例请求**:

```bash
curl -X POST http://localhost:18789/api/webhook/deploy-success \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"version": "v1.2.3"}'
```

智能体将会向 WhatsApp 发送：“部署成功！版本: v1.2.3”。

## 安全

所有的 Webhook 请求都必须包含 `Authorization: Bearer <token>` 头。Token 是您的 OpenClaw 访问令牌。
