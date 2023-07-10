import chalk from 'chalk';
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
        console.log(chalk.green(`Config ${keyToSet} set to ${value}`));
      } else if (keyToSet) {
        console.log(chalk.red(`Invalid key. Please use ${VALID_KEYS.join(', ')}.`));
      } else {
        console.log(chalk.red('Please specify a valid key.'));
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
        console.log(chalk.cyan(`Config ${keyToGet} is ${value}`));
      } else if (keyToGet) {
        console.log(chalk.red(`Invalid key. Please use ${VALID_KEYS.join(', ')}.`));
      } else {
        console.log(chalk.red('Please specify a valid key.'));
      }
    });

  subCmd
    .command('list')
    .description('List all configs')
    .action(() => {
      const configs = listConfigs();
      console.log(chalk.cyan("Here's the config:\n"));
      configs.forEach(([k, v]) => console.log(chalk.white(`${k}: ${v}`)));
    });
}
