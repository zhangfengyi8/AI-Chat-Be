import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { AiService } from './ai.service';

// DTO 定义
export class ChatWithMemoryDto {
  chatId: string;
  message: string;
  filePath?: string;
}

export class MemoryStatsDto {
  chatId: string;
}

@Controller('ai/memory')
export class AiMemoryController {
  constructor(private readonly aiService: AiService) {}

  // 带记忆的聊天接口
  @Post('chat')
  async chatWithMemory(@Body() chatDto: ChatWithMemoryDto) {
    try {
      const { chatId, message, filePath } = chatDto;

      const stream = await this.aiService.getMainWithMemory(
        chatId,
        message,
        filePath,
      );

      return {
        success: true,
        data: stream,
        message: '开始带记忆的对话',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `对话失败: ${error?.message || '未知错误'}`,
      };
    }
  }

  // 获取会话历史
  @Get('history/:chatId')
  async getConversationHistory(@Param('chatId') chatId: string) {
    try {
      const history = await this.aiService.getConversationHistory(chatId);

      return {
        success: true,
        data: history,
        message: '获取会话历史成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `获取历史失败: ${error?.message || '未知错误'}`,
      };
    }
  }

  // 清除会话记忆
  @Delete('clear/:chatId')
  clearConversationMemory(@Param('chatId') chatId: string) {
    try {
      const result = this.aiService.clearConversationMemory(chatId);

      return {
        success: true,
        data: result,
        message: '会话记忆已清除',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `清除失败: ${error?.message || '未知错误'}`,
      };
    }
  }

  // 获取所有活跃会话
  @Get('active')
  getActiveConversations() {
    try {
      const activeChats = this.aiService.getActiveConversations();

      return {
        success: true,
        data: activeChats,
        message: '获取活跃会话成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `获取失败: ${error?.message || '未知错误'}`,
      };
    }
  }

  // 获取会话记忆统计
  @Get('stats/:chatId')
  getMemoryStats(@Param('chatId') chatId: string) {
    try {
      const stats = this.aiService.getMemoryStats(chatId);

      return {
        success: true,
        data: stats,
        message: '获取记忆统计成功',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `获取统计失败: ${error?.message || '未知错误'}`,
      };
    }
  }

  // 测试记忆功能
  @Get('test/:chatId')
  async testMemory(@Param('chatId') chatId: string) {
    try {
      const result = await this.aiService.testMemory(chatId);

      return {
        success: true,
        data: result,
        message: '记忆测试完成',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `测试失败: ${error?.message || '未知错误'}`,
      };
    }
  }

  // 批量清除所有会话记忆
  @Delete('clear-all')
  clearAllConversations() {
    try {
      const activeChats = this.aiService.getActiveConversations();
      const results: Array<{ chatId: string; result: any }> = [];

      for (const chatId of activeChats) {
        const result = this.aiService.clearConversationMemory(chatId);
        results.push({ chatId, result });
      }

      return {
        success: true,
        data: results,
        message: `已清除 ${activeChats.length} 个会话的记忆`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `批量清除失败: ${error?.message || '未知错误'}`,
      };
    }
  }
}
