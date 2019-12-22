#!/usr/bin/env node

const path = require('path');
const fsx = require('fs-extra');
const program = require('commander');
const chalk = require('chalk');
const chokidar = require('chokidar');
const Spinner = require('cli-spinner').Spinner;
const fl = new (require(path.join(__dirname, '../fluorite.js')))();

function watchFiles(watcher, fl, config, spinner) {

  if ( watcher ) watcher.close();

  // Get files to watch
  let files = [];

  // Add flconfig.json
  files.push(path.join(fl.options.basePath, 'flconfig.json'));

  // Add rootContent (if any)
  if ( fl.config.rendererOptions.multiPage ) files.push(path.join(fl.options.basePath, fl.config.basePath || '', fl.config.rootContent));

  // Add files in the blueprint
  let subSections = [];
  // Helper
  const addFiles = (section) => {

    if ( typeof section.content === 'string' )
      files.push(path.join(fl.options.basePath, fl.config.basePath || '', section.content));
    else if ( typeof section.content === 'object' && section.content && section.content.constructor === Array )
      files = files.concat(section.content.map(content => path.join(fl.options.basePath, fl.config.basePath || '', content)));

    if ( section.sub ) subSections = subSections.concat(section.sub);

  };

  for ( const section of fl.config.blueprint ) {

    addFiles(section);

  }

  while ( subSections.length ) {

    const section = subSections.pop();

    addFiles(section);

  }

  // Add files in theme options
  if ( fl.options.themeConfig && fl.options.themeConfig.userAssets && fl.config.themeOptions ) {

    const userAssets = Object.keys(fl.options.themeConfig.userAssets);

    for ( const assetName of userAssets ) {

      if ( fl.config.themeOptions[assetName] ) files.push(path.join(fl.options.basePath, fl.config.themeOptions[assetName]));

    }

  }

  // Add all theme files
  files.push(path.resolve(__dirname, '..', 'themes', fl.config.rendererOptions.theme || 'onyx'));

  // Delete identical files
  files = files.filter((file, index) => files.indexOf(file) === index);

  watcher = chokidar.watch(files, { ignoreInitial: true });

  watcher.on('all', (event, path) => {

    // Rebuild
    spinner.setSpinnerTitle(`${chalk.yellow('%s')} Loading Fluorite...`);
    spinner.start();
    fl.load(config);

    // Rewatch
    watchFiles(watcher, fl, config, spinner);

  });

}

program
  .version(require(path.join(__dirname, '../package.json')).version, '-v --version');

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
  .option('-w --watch', 'watches the input files for changes and rebuilds the docs')
  .option('--skip-build', 'skips building the documentation before serving')
  .action(cmd => {

    let served = false;
    let watcher;
    const spinner = new Spinner();
    spinner.setSpinnerString(18);
    spinner.setSpinnerTitle(`${chalk.yellow('%s')} Loading Fluorite...`);
    spinner.start();

    fl.load(cmd.config)
      .on('update', msg => spinner.setSpinnerTitle(`${chalk.yellow('%s')} ${msg}`))
      .on('ready', () => {

        if ( ! served ) {

          if ( ! cmd.skipBuild ) {

            fl.generate()
            .then(() => fl.serve(cmd.port))
            // Handled by on error
            .catch(() => true);

          }
          else {

            fl.serve(cmd.port);

          }

        }
        else fl.generate();

      })
      .on('served', (outputDir, port) => {

        served = true;

        spinner.stop(true);
        console.log(chalk.blueBright(`Docs are being served on localhost:${port}`));

        // Watch files
        if ( cmd.watch ) {

          watchFiles(watcher, fl, cmd.config, spinner);

        }

      })
      .on('finished', () => {

        spinner.stop(true);
        console.log(chalk.greenBright(`Docs were regenerated`));

      })
      .on('error', error => {

        spinner.stop(true);
        console.log(chalk.redBright(error));

        if ( watcher ) watcher.close();

      });

  });

program
  .command('theme <action> <name>')
  .alias('t')
  .option('-a --as <name>', 'a custom name for the theme to be installed as (for add action only)')
  .option('-s --symlink', 'creates a symlink instead of copying the theme (useful for theme development and testing)')
  .description('<action: new> creates a new Fluorite theme, <action: add> installs the given directory as a Fluorite theme, <action: remove> uninstalls a theme')
  .action((action, name, cmd) => {

    if ( action === 'new' ) {

      const spinner = new Spinner(`${chalk.yellow('%s')}`);
      spinner.setSpinnerString(18);
      spinner.setSpinnerTitle(`${chalk.yellow('%s')} Creating new theme '${name}'...`);
      spinner.start();

      const finalName = 'fluorite-theme-' + name.replace(/^fluorite-theme-/, '');
      const finalPath = path.resolve(path.join('.', finalName));

      fsx.copy(path.join(__dirname, '..', '.seed', 'theme'), finalPath)
      .then(() => {

        spinner.stop(true);
        console.log(chalk.greenBright(`Fluorite theme ${finalName} created`));

      })
      .catch(error => {

        spinner.stop(true);
        console.log(chalk.redBright(error));

      });

      return;

    }

    if ( action === 'add' ) {

      const spinner = new Spinner(`${chalk.yellow('%s')}`);
      spinner.setSpinnerString(18);
      spinner.setSpinnerTitle(`${chalk.yellow('%s')} Installing theme '${name}'...`);
      spinner.start();

      let finalName;
      let finalTargetName;

      if ( fsx.existsSync(path.resolve(path.join('.', name))) ) finalName = name;
      else if ( fsx.existsSync(path.resolve(path.join('.', 'fluorite-theme-' + name))) ) finalName = 'fluorite-theme-' + name;

      if ( ! finalName ) {

        spinner.stop(true);
        return console.log(chalk.redBright(`Could not find theme ${name}!`));

      }

      if ( cmd.as ) finalTargetName = cmd.as;
      else finalTargetName = finalName;

      finalTargetName = finalTargetName.replace(/^fluorite-theme-/, '');

      if ( fsx.existsSync(path.join(__dirname, '..', 'themes', finalTargetName)) ) {

        spinner.stop(true);
        return console.log(chalk.redBright(`A theme with name ${finalTargetName} is already installed!`));

      }

      let promise;

      if ( cmd.symlink ) {

        promise = fsx.ensureSymlink(path.resolve(path.join('.', finalName)), path.join(__dirname, '..', 'themes', finalTargetName));

      }
      else {

        promise = fsx.copy(path.resolve(path.join('.', finalName)), path.join(__dirname, '..', 'themes', finalTargetName));

      }

      promise
      .then(() => {

        spinner.stop(true);
        console.log(chalk.greenBright(`Theme ${finalName} was installed${cmd.as ? ' as ' + finalTargetName : ''}`));

      })
      .catch(error => {

        spinner.stop(true);
        console.log(chalk.redBright(error));

      });

      return;

    }

    if ( action === 'remove' ) {

      const spinner = new Spinner(`${chalk.yellow('%s')}`);
      spinner.setSpinnerString(18);
      spinner.setSpinnerTitle(`${chalk.yellow('%s')} Uninstalling theme '${name}'...`);
      spinner.start();

      let finalPath;

      if ( fsx.existsSync(path.join(__dirname, '..', 'themes', name)) ) finalPath = path.join(__dirname, '..', 'themes', name);
      else if ( fsx.existsSync(path.join(__dirname, '..', 'themes', 'fluorite-theme-' + name)) ) finalPath = path.join(__dirname, '..', 'themes', 'fluorite-theme-' + name);

      if ( ! finalPath ) {

        spinner.stop(true);
        return console.log(chalk.redBright(`Could not find theme ${name}!`));

      }

      fsx.remove(finalPath)
      .then(() => {

        spinner.stop(true);
        console.log(chalk.greenBright(`Theme ${name} was uninstalled`));

      })
      .catch(error => {

        spinner.stop(true);
        console.log(chalk.redBright(error));

      });

      return;

    }

    console.log(chalk.redBright(`Unknown action ${action}!`));

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

    fsx.copy(path.join(__dirname, '..', '.seed', 'project'), finalPath)
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
