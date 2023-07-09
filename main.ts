import commander from 'commander';

import { name, version } from './package.json';

import { writeDocument } from './src/modules/writer';
import { handleProgram } from './src/commands/config';

const program = new commander.Command();

program.name(name);
program.version(version);

program
  .option('-o, --output', 'Directory to output')
  .option('-v', '--version', 'Version of Vue')
  .option('-l', '--language', 'Document language')
  .argument('<input-path>', 'The input path which contains the Vue components, should be a directory.')
  .action(async () => {
    const options = program.opts();
    const inputPath = program.args[0];
    await writeDocument(inputPath, options);
  });

handleProgram(program);

program.parse();
