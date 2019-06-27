The CLI takes the following commands:

  - `new <name>` or `n <name>`: Scaffolds a new Fluorite project by the given name.
  - `build` or `b`: Builds the docs using the `flconfig.json` inside the current directory or the specified config file. Options:
    - `--config` or `-c`: Specifies the path to the config file.
  - `serve` or `s`: Serves the generated docs on port `6001` or the specified port (either through CLI option or the `serverOptions` of the config file). Looks for `flconfig.json` in the current directory unless specified by the CLI option. Options:
    - `--port` or `-p`: Specifies the server port.
    - `--config` or `-c`: Specifies the path to the config file.
    - `--watch` or `-w`: Starts watching the config file and all the input files and rebuilds the docs if files are changed.
  - `theme new <themename>` or `t new <themename>`: Scaffolds a new Fluorite theme by the given name.
  - `theme add <themename>` or `t add <themename>`: Installs a Fluorite theme by the directory name (refer to [theme installation]({{versionRootPrefix}}/themes/installation) for examples.) Options:
    - `--as` or `-a`: A new name for the theme to be installed as.
  - `theme remove <themename>` or `t remove <themename>`: Uninstalls a theme by the given name.

## Usage Example

**Scaffold a new project, build, serve, and watch the docs:**
```
fl new docs
cd docs
fl build
fl serve --watch
```
