**[English](getting-started.md)** | [简体中文]

---
summary: "几分钟内安装 OpenClaw 并运行您的第一次聊天。"
read_when:
  - 从零开始首次设置
  - 您想要最快的聊天路径
title: "快速开始"
---

# 快速开始

目标：以最少的设置从零开始实现第一次工作聊天。

<Info>
最快的聊天方式：打开控制 UI（无需频道设置）。运行 `openclaw dashboard`
并在浏览器中聊天，或者在
<Tooltip headline="网关主机" tip="运行 OpenClaw 网关服务的机器。">网关主机</Tooltip>
上打开 `http://127.0.0.1:18789/`。
文档: [仪表盘](/web/dashboard) 和 [控制 UI](/web/control-ui)。
</Info>

## 先决条件

- Node 22 或更高版本

<Tip>
如果不确定，请使用 `node --version` 检查您的 Node 版本。
</Tip>

## 快速设置 (CLI)

<Steps>
  <Step title="安装 OpenClaw (推荐)">
    <Tabs>
      <Tab title="macOS/Linux">
        ```bash
        curl -fsSL https://openclaw.ai/install.sh | bash
        ```
        <img
  src="/assets/install-script.svg"
  alt="安装脚本流程"
  className="rounded-lg"
/>
      </Tab>
      <Tab title="Windows (PowerShell)">
        ```powershell
        iwr -useb https://openclaw.ai/install.ps1 | iex
        ```
      </Tab>
    </Tabs>

    <Note>
    其他安装方法和要求: [安装](/install)。
    </Note>

  </Step>
  <Step title="运行引导向导">
    ```bash
    openclaw onboard --install-daemon
    ```

    向导将配置认证、网关设置和可选频道。
    详见 [引导向导](/start/wizard)。

  </Step>
  <Step title="检查网关">
    如果您安装了服务，它应该已经在运行：

    ```bash
    openclaw gateway status
    ```

  </Step>
  <Step title="打开控制 UI">
    ```bash
    openclaw dashboard
    ```
  </Step>
</Steps>

<Check>
如果控制 UI 加载成功，您的网关就可以使用了。
</Check>

## 可选检查和额外内容

<AccordionGroup>
  <Accordion title="在前台运行网关">
    用于快速测试或故障排除。

    ```bash
    openclaw gateway --port 18789
    ```

  </Accordion>
  <Accordion title="发送测试消息">
    需要配置好的频道。

    ```bash
    openclaw message send --target +15555550123 --message "Hello from OpenClaw"
    ```

  </Accordion>
</AccordionGroup>

## 有用的环境变量

如果您作为服务账户运行 OpenClaw 或想要自定义配置/状态位置：

- `OPENCLAW_HOME` 设置用于内部路径解析的主目录。
- `OPENCLAW_STATE_DIR` 覆盖状态目录。
- `OPENCLAW_CONFIG_PATH` 覆盖配置文件路径。

完整环境变量参考: [环境变量](/help/environment)。

## 深入了解

<Columns>
  <Card title="引导向导 (详情)" href="/start/wizard">
    完整的 CLI 向导参考和高级选项。
  </Card>
  <Card title="macOS 应用引导" href="/start/onboarding">
    macOS 应用的首次运行流程。
  </Card>
</Columns>

## 您将拥有

- 一个正在运行的网关
- 配置好的认证
- 控制 UI 访问权限或已连接的频道

## 下一步

- 私信安全和批准: [配对](/channels/pairing)
- 连接更多频道: [频道](/channels)
- 高级工作流和源码安装: [设置](/start/setup)
