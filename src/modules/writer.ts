import chalk from 'chalk';
import { promises as fsp, Dirent } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as azure from './azure';
import { getConfig } from './config';
import { getExample } from './example';

export interface WriterOptions {
  output?: string;
  version?: '2' | '3';
  language?: string;
  matcher?: RegExp;
  packageName?: string;
}

const SYSTEM_PROMPT = `
You are an assistant specialized in creating Markdown format documentation for Vue components. While creating the document, you need to comprehensively understand the given Vue component code and elaborate its content and props definitions step by step. Please remember, your output should strictly be confined to Markdown content, excluding any other forms of output. The document you produce should cover the following aspects:

1. Introduction of the Vue component
2. Basic usage and examples of the Vue component
3. Props to be passed in, their meanings, and examples of these props
4. Meanings of the Events the compoent will emit.
5. Explain the exposed methods or values.

And you should following these rules while creating document:

1. NEVER explain or generate document for the internal styles (code wrapped with <style></style>) in the Vue component.
2. NEVER explain or generate document for the internal, non-exposed values in the Vue component.
3. You should explain all the props defined in the Vue component.
4. Ignore all imported components from other packages, you should only generate content about current component.
5. If an example or template is provided, the generated document should align with the format of the provided content, maintaining stylistic consistency.
6. If the component won't emit any event, you should not explain that or generate a part says there's no events.
7. If the component doesn't have any exposed methods or values, you should not explain that or generate a part says there's no exposed methods or values.

Apart from the content mentioned above, the document should not contain any additional information. Carefully study the Vue component code and explain it in the most direct and clear manner, so that other developers can quickly understand and use it.
`.trim();

async function handleDirectory(directory: string, output: string, options: WriterOptions) {
  const { version = '3', language = 'English', matcher } = options;
  let { packageName } = options;

  try {
    const directoryPath = path.resolve(process.cwd(), directory);
    if (!fs.existsSync(directoryPath)) {
      throw new Error('The input directory does not exist.');
    }

    const dirents = await fsp.readdir(directoryPath, { withFileTypes: true });

    const promises = dirents.map(async (dirent: Dirent) => {
      const resPath = path.resolve(directoryPath, dirent.name);
      const outputPath = path.resolve(output, path.basename(dirent.name, '.vue'));

      if (!packageName) {
        const packageJson = path.resolve(process.cwd(), './package.json');
        if (!fs.existsSync(packageJson)) {
          throw new Error('Package json is not found, cannot read the name of package.');
        }
        const packageJsonContent = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
        packageName = packageJsonContent.name;
      }

      if (dirent.isDirectory()) {
        if (!fs.existsSync(outputPath)) {
          await fsp.mkdir(outputPath, { recursive: true });
        }
        return handleDirectory(resPath, outputPath, options);
      } else if (dirent.isFile() && dirent.name.endsWith('.vue') && (!matcher || matcher.test(dirent.name))) {
        const content = await fsp.readFile(resPath, 'utf8');
        let systemPrompt = SYSTEM_PROMPT;
        const userPrompt = `Please write a document based on the following Vue${version} component code. The language of output document should be ${language}. The package which includes the component is named "${packageName}".\n\n${content}`;
        // check the example
        const example = getExample();
        if (example) {
          systemPrompt += `\n\nHere's an example of the document you will write, please ensure the stylistic consistency.\n\n${example}`;
        }
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ];
        const result = await azure.requestCompletion(messages);
        if (!fs.existsSync(outputPath)) {
          await fsp.mkdir(outputPath, { recursive: true });
        }
        const filePath = path.join(outputPath, `${path.basename(dirent.name, '.vue')}_${language}.md`);
        if (!result?.content) {
          throw new Error('The generated content is empty.');
        }
        await fsp.writeFile(filePath, result.content, 'utf8');
        console.log(chalk.green(`Document has been successfully generated and saved at ${filePath}`));
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
  const outputDir = path.resolve(process.cwd(), output);
  if (!fs.existsSync(outputDir)) {
    await fsp.mkdir(outputDir, { recursive: true });
  }
  await handleDirectory(directory, outputDir, options);
}
