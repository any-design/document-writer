import { promises as fsp, Dirent } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as azure from './azure';
import { getConfig } from './config';

export interface WriterOptions {
  output?: string;
  version?: '2' | '3';
  language?: string;
  matcher?: RegExp;
}

async function handleDirectory(directory: string, output: string, options: WriterOptions) {
  const { version = '3', language = 'English', matcher } = options;

  try {
    const dirents = await fsp.readdir(directory, { withFileTypes: true });

    const promises = dirents.map(async (dirent: Dirent) => {
      const resPath = path.resolve(directory, dirent.name);
      const outputPath = path.resolve(output, dirent.name);

      if (dirent.isDirectory()) {
        if (!fs.existsSync(outputPath)) {
          await fsp.mkdir(outputPath, { recursive: true });
        }
        return handleDirectory(resPath, outputPath, options);
      } else if (dirent.isFile() && dirent.name.endsWith('.vue') && (!matcher || matcher.test(dirent.name))) {
        const content = await fsp.readFile(resPath, 'utf8');
        const systemPrompt =
          'You are a program documentation assistant. You need to understand the content and the definitions of parameters of the given Vue component code step by step, and write the documentation. You are only allowed to output content in Markdown format.';
        const userPrompt = `Please write a document based on the following Vue${version} component code. The language of output document is ${language}.\n\n${content}`;
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ];
        const result = await azure.requestCompletion(messages);
        const filePath = path.join(outputPath, `${path.basename(dirent.name, '.vue')}.md`);
        if (!result?.content) {
          throw new Error('The generated content is empty.');
        }
        await fsp.writeFile(filePath, result.content, 'utf8');
        console.log(`Document has been successfully generated and saved at ${filePath}`);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error(`An error occurred while processing the directory ${directory}:`, error);
  }
}

export async function writeDocument(directory: string, options: WriterOptions): Promise<void> {
  const keys = ['azure_openai_endpoint', 'azure_openai_key', 'azure_openai_model'];
  for (const key of keys) {
    if (!getConfig(key)) {
      console.error(`Missing configuration for ${key}`);
      return;
    }
  }
  const { output = './' } = options;
  if (!fs.existsSync(output)) {
    await fsp.mkdir(output, { recursive: true });
  }
  await handleDirectory(directory, output, options);
}
