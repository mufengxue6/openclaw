**[English](doctor.md)** | [简体中文]

---
title: "Doctor (诊断工具)"
description: "自动检测和修复环境问题。"
---

# OpenClaw Doctor

`openclaw doctor` 是您的第一线调试工具。它会扫描您的环境、配置和网络，寻找潜在问题。

## 用法

```bash
openclaw doctor
```

## 检查项

Doctor 会检查以下类别：

1.  **系统环境**:
    - Node.js 版本 (>= 22)。
    - 操作系统兼容性。
    - 必要的系统依赖 (如 Linux 上的 Chrome 库)。

2.  **配置**:
    - `openclaw.json` 语法是否合法。
    - 必要的 Token 是否存在。
    - 路径权限是否正确 (`~/.openclaw` 必须可写)。

3.  **网络**:
    - 端口 18789 是否被占用。
    - Tailscale 状态 (如果启用)。
    - 外网连通性 (检查 LLM API 是否可达)。

4.  **安全**:
    - 检查是否有危险的 `0.0.0.0` 绑定且无密码。
    - 检查是否在 root 用户下运行 (不推荐)。

## 自动修复

对于某些问题（如缺失的目录、权限错误），Doctor 会询问是否尝试自动修复。

```bash
openclaw doctor --fix
```

这会自动应用推荐的修复方案。
