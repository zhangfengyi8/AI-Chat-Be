// import { ChatOpenAI } from '@langchain/openai';
// import { BufferMemory } from 'langchain/memory';
// import { PromptTemplate } from '@langchain/core/prompts';
// import { RunnableSequence } from '@langchain/core/runnables';
// import { StringOutputParser } from '@langchain/core/output_parsers';
// import { AI_CONFIG } from '../config/ai.config';

describe('LangChain上下文对话核心逻辑', () => {
  it('should support context memory', async () => {
    //     // 1. 初始化大模型和记忆
    //     const llm = new ChatOpenAI({
    //       openAIApiKey: AI_CONFIG.API_KEY, // 你的API Key
    //       configuration: { baseURL: AI_CONFIG.BASE_URL }, // 你的API地址
    //       modelName: process.env.AI_MODEL_NAME || 'qwen-long',
    //       temperature: 0.7,
    //       streaming: false,
    //     });
    //     const memory = new BufferMemory({
    //       returnMessages: true,
    //       memoryKey: 'history',
    //       inputKey: 'input',
    //     });
    //     // 2. 定义prompt模板
    //     const prompt = PromptTemplate.fromTemplate(`
    // 你是一个专业的AI助手，请基于对话历史回答用户的问题。
    // 对话历史：
    // {history}
    // 用户问题：{input}
    // 请根据对话历史提供连贯、准确的回答。
    // `);
    //     // 3. 构建链
    //     const chain = RunnableSequence.from([
    //       {
    //         input: (input: { input: string }) => input.input,
    //         history: async () => await memory.loadMemoryVariables({}),
    //       },
    //       prompt,
    //       llm,
    //       new StringOutputParser(),
    //     ]);
    //     // 4. 多轮对话
    //     // 第1轮
    //     let userInput = '你好，我叫张三';
    //     let aiOutput = await chain.invoke({ input: userInput });
    //     await memory.saveContext({ input: userInput }, { output: aiOutput });
    //     console.log(memory);
    //     // 第2轮
    //     userInput = '我刚才说我叫什么？';
    //     aiOutput = await chain.invoke({ input: userInput });
    //     await memory.saveContext({ input: userInput }, { output: aiOutput });
    //     console.log(memory);
    //     // 你可以继续多轮对话
  });
});
