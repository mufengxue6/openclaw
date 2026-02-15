**[English](android.md)** | [简体中文]

---
title: "Android 节点"
description: "Android 设备的连接与控制。"
---

# Android 节点

Android 节点应用的功能与 iOS 版本类似，将您的 Android 手机变成 OpenClaw 网络的扩展外设。

## 功能

- **摄像头**: 支持 `camera.snap` (拍照) 和 `camera.list` (列出摄像头)。
- **实时画布**: 完整的 Canvas/A2UI 支持。
- **通知**: 智能体可以发送系统通知 (`node.notify`)。
- **位置**: 智能体可以查询 GPS 位置 (`location.get`)。

## 安装

从 [GitHub Releases](https://github.com/openclaw/openclaw/releases) 下载最新的 `.apk` 文件并安装。

## 权限

首次运行时，您需要授予以下权限：
- **相机**: 用于拍照。
- **位置**: 用于位置查询和 Wi-Fi SSID 发现。
- **通知**: 用于接收智能体消息。
- **后台运行**: 建议允许“无限制”电池使用，以防系统杀后台。

## 短信 (SMS) 支持

Android 版本有一个独有功能：**短信网关**。
如果启用，OpenClaw 可以读取收到的短信并作为聊天消息转发给智能体。智能体也可以回复短信。

配置：
在 Android 应用设置中启用 "SMS Gateway"。
