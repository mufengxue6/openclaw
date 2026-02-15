**[English](bonjour.md)** | [简体中文]

---
title: "Bonjour / mDNS"
description: "局域网内的自动发现协议。"
---

# Bonjour (mDNS)

OpenClaw 使用 Bonjour (也称为 mDNS 或 Zeroconf) 来在局域网内自动发现网关和节点。这使得 iOS/Android 应用无需输入 IP 地址即可连接到网关。

## 工作原理

1.  **广播**: 网关启动时，会在局域网内广播一个服务：`_openclaw._tcp`。
2.  **发现**: 节点设备监听此服务，一旦发现，自动发起 WebSocket 连接。

## 网络要求

- 设备必须在同一个子网内。
- 路由器必须支持多播 (Multicast) 转发。
- 防火墙必须允许 UDP 端口 5353。

## 故障排除

如果您无法自动发现设备：

1.  **检查防火墙**: 确保 UDP 5353 入站/出站均已放行。
2.  **Docker**: 如果您在 Docker 中运行网关，必须使用 `network_mode: "host"`。在 Bridge 模式下，mDNS 广播无法穿透到宿主机网络。
3.  **VPN**: 某些 VPN 客户端会屏蔽本地流量。尝试暂时断开 VPN。

## 禁用

如果您不想广播服务，可以在配置中禁用：

```json5
{
  gateway: {
    bonjour: false
  }
}
```
