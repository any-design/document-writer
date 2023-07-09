import { Command } from 'commander';
import { setConfig, getConfig, listConfigs } from '../modules/config';

const VALID_KEYS = ['azure_openai_endpoint', 'azure_openai_key', 'azure_openai_model'];

export function handleProgram(program: Command) {
  const subCmd = program.command('config').description('Manage AzureOpenAI configs');

  subCmd
    .command('set')
    .arguments('<key> <value>')
    .description('Set a config')
    .action((key: string, value: string) => {
      const keyToSet = key.toLowerCase();
      if (keyToSet && VALID_KEYS.includes(key)) {
        setConfig(keyToSet, value);
        console.log(`Config ${keyToSet} set to ${value}`);
      } else if (keyToSet) {
        console.log(`Invalid key. Please use ${VALID_KEYS.join(', ')}.`);
      } else {
        console.log('Please specify a valid key.');
      }
    });

  subCmd
    .command('get')
    .description('Get a config')
    .arguments('<key>')
    .action((key) => {
      const keyToGet = key.toLowerCase();
      if (keyToGet && VALID_KEYS.includes(keyToGet)) {
        const value = getConfig(keyToGet);
        console.log(`Config ${keyToGet} is ${value}`);
      } else if (keyToGet) {
        console.log(`Invalid key. Please use ${VALID_KEYS.join(', ')}.`);
      } else {
        console.log('Please specify a valid key.');
      }
    });

  subCmd
    .command('list')
    .description('List all configs')
    .action(() => {
      const configs = listConfigs();
      configs.forEach(([k, v]) => console.log(`${k}: ${v}`));
    });
}
