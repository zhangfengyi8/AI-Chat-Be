# AI Chat Backend - 记忆对话系统

## 项目概述

这是一个基于 NestJS 的 AI 聊天后端系统，支持记忆对话功能。系统能够记住用户之前的对话内容，实现连贯的对话体验。

## 核心功能

### 🧠 记忆对话系统

- **会话记忆**: 每个聊天会话都有独立的记忆存储
- **上下文保持**: AI 能够基于历史对话内容进行回答
- **内存管理**: 自动限制历史记录数量，防止内存溢出
- **流式响应**: 支持实时流式传输 AI 响应

### 📁 文件处理

- **文件上传**: 支持上传文档文件
- **文件分析**: AI 能够分析文件内容并回答相关问题
- **图片处理**: 支持图片识别和分析

### 🔧 技术特性

- **多模型支持**: 支持多种 AI 模型提供商
- **配置管理**: 统一的配置管理系统
- **错误处理**: 完善的错误处理和日志记录
- **API 文档**: 完整的 API 接口文档

## 系统架构

### 核心服务

1. **AiService** (`src/ai/ai.service.ts`)
   - 主要的 AI 对话服务
   - 记忆管理功能
   - 文件处理功能

2. **ChatService** (`src/chat/chat.service.ts`)
   - 聊天会话管理
   - 消息存储和检索
   - 流式响应处理

3. **FileService** (`src/file/file.service.ts`)
   - 文件上传和管理
   - 文件存储和检索

### 记忆系统设计

```typescript
// 记忆存储结构
private conversationHistory = new Map<string, Array<{
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}>>();
```

**记忆特性:**
- 每个 `chatId` 对应独立的对话历史
- 自动保存用户消息和 AI 响应
- 限制历史记录数量（最多50条）
- 支持记忆统计和清理

## API 接口

### 主要聊天接口

```http
POST /chat/send
Content-Type: application/json

{
  "id": "chat-session-id",
  "message": "用户消息",
  "fileId": "optional-file-id"
}
```

### 记忆管理接口

```http
# 获取会话历史
GET /ai/memory/history/:chatId

# 清除会话记忆
DELETE /ai/memory/clear/:chatId

# 获取活跃会话
GET /ai/memory/active

# 获取记忆统计
GET /ai/memory/stats/:chatId
```

## 使用方法

### 1. 基本对话

```typescript
// 发送消息
const response = await aiService.chat(chatId, message, filePath);

// 处理流式响应
for await (const chunk of response) {
  if (chunk.choices[0]?.delta?.content) {
    console.log(chunk.choices[0].delta.content);
  }
}
```

### 2. 记忆管理

```typescript
// 获取对话历史
const history = aiService.getConversationHistory(chatId);

// 清除记忆
aiService.clearConversationMemory(chatId);

// 获取统计信息
const stats = aiService.getMemoryStats(chatId);
```

### 3. 文件处理

```typescript
// 处理文件
const fileContent = await aiService.getAiWithFile(filePath);

// 带文件的对话
const response = await aiService.chat(chatId, message, filePath);
```

## 配置说明

### AI 配置 (`src/config/ai.config.ts`)

```typescript
export const AI_CONFIG = {
  API_KEY: process.env.AI_API_KEY,
  BASE_URL: process.env.AI_BASE_URL,
  MODEL_NAME: process.env.AI_MODEL_NAME || 'qwen-long',
};
```

### 环境变量

```bash
# AI 配置
AI_API_KEY=your-api-key
AI_BASE_URL=https://your-api-endpoint
AI_MODEL_NAME=qwen-long

# 数据库配置
DATABASE_URL=your-database-url

# 文件存储配置
UPLOAD_PATH=./uploads
```

## 开发指南

### 项目结构

```
src/
├── ai/                    # AI 服务模块
│   ├── ai.service.ts     # 主要 AI 服务
│   ├── ai.controller.ts  # AI 控制器
│   └── ai.module.ts      # AI 模块
├── chat/                  # 聊天模块
│   ├── chat.service.ts   # 聊天服务
│   ├── chat.controller.ts # 聊天控制器
│   └── chat.module.ts    # 聊天模块
├── file/                  # 文件处理模块
├── config/               # 配置管理
└── util/                 # 工具函数
```

### 添加新功能

1. **扩展记忆系统**: 在 `AiService` 中添加新的记忆方法
2. **添加文件类型**: 在 `FileService` 中支持新的文件格式
3. **自定义模型**: 在配置中添加新的 AI 模型支持

### 测试记忆功能

```typescript
// 测试记忆系统
const testResult = aiService.testMemory(chatId);
console.log(testResult);
```

## 部署说明

### 环境要求

- Node.js 18+
- NestJS 10+
- 数据库（PostgreSQL/MySQL）
- 文件存储系统

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run start:prod
```

## 注意事项

1. **内存管理**: 系统会自动清理过期的对话历史，防止内存溢出
2. **文件安全**: 上传的文件会进行安全检查
3. **API 限制**: 注意 AI 服务的 API 调用限制
4. **数据备份**: 定期备份重要的对话数据

## 更新日志

### v2.0.0 - 记忆对话系统重构
- 重新整合 AI 服务代码
- 实现统一的记忆对话功能
- 移除 LangChain 依赖，简化架构
- 优化内存管理和性能

### v1.0.0 - 初始版本
- 基础聊天功能
- 文件上传和处理
- 多模型支持
