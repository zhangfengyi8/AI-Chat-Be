export const AI_CONFIG = {
  API_KEY:
    process.env.DASHSCOPE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    'sk-377e1e50f3a44410a972f186da25df64',
  BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  MODEL_NAME: 'qwen-long',
};
