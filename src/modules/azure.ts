import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { getConfig } from './config';

export interface ChatMessage {
  role: string;
  content: string;
}
export type ChatMessages = ChatMessage[];

export async function requestCompletion(messages: ChatMessages) {
  const client = new OpenAIClient(
    getConfig('azure_openai_endpoint')!,
    new AzureKeyCredential(getConfig('azure_openai_key')!),
  );

  const result = await client.getChatCompletions(getConfig('azure_openai_model')!, messages);

  // Return only the first choice
  return result.choices[0]?.message;
}
