import type { AIProvider } from './ai.interface';
import { MockAIProvider } from './mock.provider';
import { OpenAIProvider } from './openai.provider';

export const getAIProvider = (): AIProvider => {
  const provider = process.env.AI_PROVIDER || 'mock';
  switch (provider) {
    case 'openai':
      return new OpenAIProvider();
    case 'mock':
    default:
      return new MockAIProvider();
  }
};
