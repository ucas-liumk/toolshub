# 应用管家

一款轻量级桌面工具管理应用，帮助你集中管理和快速启动各种本地工具与服务。

## 功能特点

- **工具管理** — 添加、编辑、删除本地工具/服务，支持自定义启动命令和工作目录
- **一键启停** — 快速启动和停止工具进程，实时显示运行状态
- **分组管理** — 通过分组对工具进行分类整理
- **输出查看** — 实时查看工具运行的控制台输出
- **持久化存储** — 工具配置自动保存，重启应用不丢失

## 安装使用

### 直接下载

前往 [Releases](https://github.com/ucas-liumk/toolshub/releases) 页面下载最新的安装包。

### 从源码构建

```bash
# 克隆项目
git clone https://github.com/ucas-liumk/toolshub.git
cd toolshub

# 安装依赖
npm install

# 启动开发模式
npm run dev

# 打包为 exe
npm run pack
```

## 技术栈

- Electron + React + TypeScript
- Tailwind CSS
- Zustand (状态管理)
- electron-store (持久化)

## 许可证

[MIT](LICENSE)
