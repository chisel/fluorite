#!/usr/bin/env node

const path = require('path');
const fsx = require('fs-extra');
const program = require('commander');
const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;
const fl = new (require(path.join(__dirname, '../fluorite.js')))();

program
  .version(require(path.join(__dirname, '../package.json')).version, '-v --version')

program
  .command('build')
  .alias('b')
  .description('builds the docs in the output directory')
  .option('-c --config <config>', 'a custom path to the flconfig.json file')
  .action(cmd => {

    const spinner = new Spinner();
    spinner.setSpinnerString(18);
    spinner.setSpinnerTitle(`${chalk.yellow('%s')} Loading Fluorite...`);
    spinner.start();

    fl.load(cmd.config)
      .on('update', msg => spinner.setSpinnerTitle(`${chalk.yellow('%s')} ${msg}`))
      .on('ready', () => fl.generate())
      .on('finished', warnings => {

        spinner.stop(true);

        if ( warnings && warnings.length ) {

          for ( const warn of warnings ) {

            console.log(chalk.yellow(warn));

          }

        }

        console.log(chalk.greenBright('Docs generated at', path.resolve(path.join(fl.options.basePath, fl.config.outputDir))));

      })
      .on('error', error => {

        spinner.stop(true);
        console.log(chalk.redBright(error));

      });

  });

program
  .command('serve')
  .alias('s')
  .description('serves the built docs from the output directory')
  .option('-p --port [port]', 'the port number to start the local server on')
  .option('-c --config <config>', 'a custom path to the flconfig.json file')
  .action(cmd => {

    const spinner = new Spinner();
    spinner.setSpinnerString(18);
    spinner.setSpinnerTitle(`${chalk.yellow('%s')} Loading Fluorite...`);
    spinner.start();

    fl.load(cmd.config)
      .on('update', msg => spinner.setSpinnerTitle(`${chalk.yellow('%s')} ${msg}`))
      .on('ready', () => fl.serve(cmd.port))
      .on('finished', port => {

        spinner.stop(true);
        console.log(chalk.blueBright(`Docs are being served on localhost:${port}`));

      })
      .on('error', error => {

        spinner.stop(true);
        console.log(chalk.redBright(error));

      });

  });

program
  .command('new <name>')
  .alias('n')
  .description('creates a new Fluorite project')
  .action((name, cmd) => {

    const spinner = new Spinner(`${chalk.yellow('%s')}`);
    spinner.setSpinnerString(18);
    spinner.setSpinnerTitle(`${chalk.yellow('%s')} Creating new project '${name}'...`);
    spinner.start();

    const finalPath = path.resolve(path.join('.', name));
    const quickStartMarkdown = 'This is the quick start.';
    const flconfig = {
      title: 'Fluorite',
      basePath: './fldocs',
      outputDir: 'docs',
      blueprint: [
        { title: 'Quick Start', content: 'quick-start.md' }
      ]
    };

    fsx.ensureDir(finalPath)
    .then(() => {

      return fsx.writeJson(path.join(finalPath, 'flconfig.json'), flconfig, { spaces: 2 });

    })
    .then(() => {

      return fsx.ensureDir(path.join(finalPath, 'fldocs'));

    })
    .then(() => {

      return fsx.writeFile(path.join(finalPath, 'fldocs', 'quick-start.md'), quickStartMarkdown);

    })
    .then(() => {

      spinner.stop(true);
      console.log(chalk.greenBright(`Fluorite project ${name} created`));

    })
    .catch(error => {

      spinner.stop(true);
      console.log(chalk.redBright(error));

    });

  });

program.parse(process.argv);
