import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { BASE_URL } from 'src/constant';
import { isImageByExtension } from 'src/util';
import { AI_CONFIG } from '../config/ai.config';
import { ChatOpenAI } from '@langchain/openai';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private defaultMessage = 'you are a helpful assistant';

  // LCEL 记忆系统
  private memoryMap = new Map<string, BufferMemory>();
  private conversationChains = new Map<string, RunnableSequence>();

  constructor() {
    this.openai = new OpenAI({
      // 若没有配置环境变量，请用阿里云百炼API Key将下行替换为：apiKey: "sk-xxx",
      apiKey: AI_CONFIG.API_KEY,
      baseURL: AI_CONFIG.BASE_URL,
    });
  }

  async getAiWithFile(filePath: string) {
    // 将URL路径转换为本地文件系统路径
    let localFilePath = filePath;

    if (filePath.startsWith(BASE_URL)) {
      // 如果是完整URL，移除BASE_URL部分
      localFilePath = filePath.replace(BASE_URL, '');
    }

    if (localFilePath.startsWith('/uploads/')) {
      // 如果是相对URL路径，转换为绝对本地路径
      localFilePath = path.join(
        process.cwd(),
        localFilePath.replace(/^\//, ''),
      );
    } else if (localFilePath.startsWith('uploads/')) {
      // 如果已经移除了前导斜杠，直接拼接
      localFilePath = path.join(process.cwd(), localFilePath);
    }

    // 确保路径使用正确的分隔符
    localFilePath = path.normalize(localFilePath);

    console.log('转换后的本地路径:', localFilePath);

    const fileObject = await this.openai.files.create({
      file: fs.createReadStream(localFilePath),

      purpose: 'file-extract' as any,
    });

    const res = `fileid://${fileObject.id}`;
    return res;
  }

  async getAiWithMessage() {}

  getAiWithImg(message: string, imgUrl: string) {
    const imgContent: {
      type: 'image_url';
      image_url: { url: string };
    } = {
      type: 'image_url',
      image_url: { url: imgUrl },
    };
    // imgUrl.map((item) => {

    // });

    const messageContent: {
      type: 'text';
      text: string;
    } = {
      type: 'text',
      text: message,
    };

    return [messageContent, imgContent];
  }

  async getMain(message: string, filePath: string) {
    const isImage = isImageByExtension(filePath);
    const model = isImage ? 'qwen-vl-plus' : 'qwen-long';

    const content = filePath
      ? await this.getAiWithFile(filePath)
      : this.defaultMessage;

    const userContent = isImage
      ? this.getAiWithImg(message, filePath)
      : message;

    const completion = await this.openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: content },
        { role: 'user', content: userContent },
      ],
      stream: true,
      stream_options: {
        include_usage: true,
      },
    });

    return completion;
  }

  // ==================== 新增 LCEL 记忆功能 ====================

  /**
   * 获取或创建会话记忆
   */
  private getOrCreateMemory(chatId: string): BufferMemory {
    console.log('🔍 获取记忆，chatId:', chatId);

    if (!this.memoryMap.has(chatId)) {
      console.log('🆕 创建新的记忆，chatId:', chatId);
      this.memoryMap.set(
        chatId,
        new BufferMemory({
          returnMessages: true,
          memoryKey: 'history',
          inputKey: 'input',
        }),
      );
    } else {
      console.log('✅ 找到现有记忆，chatId:', chatId);
    }
    return this.memoryMap.get(chatId)!;
  }

  /**
   * 带记忆的聊天方法 - 使用 LCEL
   */
  async getMainWithMemory(chatId: string, message: string, filePath?: string) {
    try {
      console.log(
        '🚀 开始带记忆对话 (LCEL)，chatId:',
        chatId,
        'message:',
        message.substring(0, 50) + '...',
      );

      // 1. 获取历史
      const historyArr = await this.getConversationHistory(chatId);
      // 组装历史为字符串
      const historyText = historyArr
        .map((msg: any) => {
          const type =
            msg.id?.[3] ||
            msg.type ||
            msg._type ||
            (msg.constructor && msg.constructor.name) ||
            'Unknown';
          const content =
            msg.kwargs?.content ||
            msg.content ||
            (typeof msg.text === 'string' ? msg.text : '') ||
            '';
          return `[${type}] ${content}`;
        })
        .join('\n');

      // 2. 组装prompt（历史+本轮输入）
      const promptText = `${historyText}\n[HumanMessage] ${message}`;
      console.log(promptText, 'promptText');

      // 3. 构造prompt模板
      const prompt = PromptTemplate.fromTemplate(`
你是一个专业的AI助手，请基于对话历史回答用户的问题。

对话历史：
{history}

请根据对话历史提供连贯、准确的回答。如果历史中没有相关信息，请基于你的知识回答。
回答要求：
1. 保持对话的连贯性
2. 准确、有用、友好
3. 使用中文回答
4. 如果涉及之前讨论的内容，请适当引用

回答：`);

      // 4. 构造链（不再自动注入history，手动传递）
      const llm = new ChatOpenAI({
        openAIApiKey: AI_CONFIG.API_KEY,
        configuration: {
          baseURL: AI_CONFIG.BASE_URL,
        },
        modelName: AI_CONFIG.MODEL_NAME || 'qwen-long',
        temperature: 0.7,
        streaming: true,
      });
      const chain = RunnableSequence.from([
        prompt,
        llm,
        new StringOutputParser(),
      ]);

      // 5. 流式对话
      const stream = await chain.stream({ history: promptText });
      const memory = this.getOrCreateMemory(chatId);

      const proxyStream = async function* () {
        let aiOutput = '';
        for await (const chunk of stream) {
          aiOutput += chunk;
          yield chunk;
        }
        await memory.saveContext({ input: message }, { output: aiOutput });
      }.bind(this);

      return proxyStream();
    } catch (error) {
      console.error('❌ LCEL 对话失败:', error);
      throw error;
    }
  }

  /**
   * 获取会话历史
   */
  async getConversationHistory(chatId: string): Promise<any[]> {
    const memory = this.getOrCreateMemory(chatId);
    const history = await memory.loadMemoryVariables({});
    return (history.history as any[]) || [];
  }

  /**
   * 清除会话记忆
   */
  clearConversationMemory(chatId: string) {
    this.memoryMap.delete(chatId);
    this.conversationChains.delete(chatId);
    return { success: true, message: '会话记忆已清除' };
  }

  /**
   * 获取所有活跃会话ID
   */
  getActiveConversations(): string[] {
    return Array.from(this.memoryMap.keys());
  }

  /**
   * 获取会话记忆统计信息
   */
  getMemoryStats(chatId: string) {
    const memory = this.memoryMap.get(chatId);
    if (!memory) {
      return { exists: false };
    }

    return {
      exists: true,
      chatId,
      // 可以添加更多统计信息
    };
  }

  /**
   * 测试记忆功能
   */
  async testMemory(chatId: string) {
    console.log('🧪 测试记忆功能 (LCEL)，chatId:', chatId);

    const history = await this.getConversationHistory(chatId);
    console.log('📚 当前历史记录数量:', history.length);

    if (history.length > 0) {
      console.log('📚 最近3条记录:');
      history.slice(-3).forEach((msg: any, index) => {
        const content =
          typeof msg.data?.content === 'string'
            ? msg.data.content.substring(0, 50)
            : '...';
        console.log(`  ${index + 1}. [${msg.type || 'unknown'}] ${content}...`);
      });
    }

    const stats = this.getMemoryStats(chatId);
    console.log('📊 记忆统计:', stats);

    return { history, stats };
  }
}
