import fs from 'fs';
import path from 'path';

export function getExample(): string | null {
  const cwd = process.cwd();
  const configPath = path.resolve(cwd, '.documentwriter');

  if (!fs.existsSync(configPath)) {
    return null;
  }

  const configContent = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf-8' }));

  if (!configContent) {
    return null;
  }

  const examplePath = path.resolve(cwd, configContent.example);

  if (!fs.existsSync(examplePath)) {
    return null;
  }

  const exampleContent = fs.readFileSync(examplePath, { encoding: 'utf-8' });
  return exampleContent;
}
