const fs = require('fs-extra');
const yaml = require('yaml-import');
const path = require('path');
const _ = require('lodash');
const os = require('os');
const semver = require('semver');
const Renderer = require(path.join(__dirname, 'renderer.js'));
const Server = require(path.join(__dirname, 'server.js'));
const redirectTemplate = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=./{{REDIRECT_TO}}/" />
  </head>
  <body>
    Redirecting...
  </body>
</html>`.trim();

class Fluorite {

  constructor() {

    this._handlers = {};

  }

  get config() {

    return this._originalConfig;

  }

  get options() {

    return {
      basePath: this._basePath,
      themeConfig: this._themeConfig
    };

  }

  load(configPathOrObject) {

    this._basePath = configPathOrObject && typeof configPathOrObject === 'string' ? path.dirname(configPathOrObject) : '.';

    this._readConfig(configPathOrObject && typeof configPathOrObject === 'string' ? path.basename(configPathOrObject) : configPathOrObject)
    .then(config => {

      this._emit('update', 'Config was loaded');

      this._config = config;
      this._server = new Server(config.serverOptions);
      this._config.serverOptions = this._server.options;
      // Determine theme directory
      if ( fs.existsSync(path.join(__dirname, 'themes', this._config.rendererOptions.theme)) )
        this._config.themeDir = path.join(__dirname, 'themes');
      else if ( fs.existsSync(path.join(os.homedir(), '.fluorite', 'themes', this._config.rendererOptions.theme)) )
        this._config.themeDir = path.join(os.homedir(), '.fluorite', 'themes');
      else
        this._config.themeDir = null;

      // Load theme's config file (if any)
      const themeDirectory = path.join(this._config.themeDir, this._config.rendererOptions.theme);

      if ( fs.existsSync(path.join(themeDirectory, 'config.json')) )
        this._themeConfig = this._require(path.join(themeDirectory, 'config.json'));
      else if ( fs.existsSync(path.join(themeDirectory, 'config.yaml')) )
        this._themeConfig = yaml.read(path.join(themeDirectory, 'config.yaml'));
      else if ( fs.existsSync(path.join(themeDirectory, 'config.yml')) )
        this._themeConfig = yaml.read(path.join(themeDirectory, 'config.yml'));

      this._emit('ready');

    })
    .catch(error => this._emit('error', error));

    return this;

  }

  on(event, cb) {

    if ( ! this._handlers.hasOwnProperty(event) ) this._handlers[event] = [];

    this._handlers[event].push(cb);

    return this;

  }

  async generate() {

    this._emit('update', 'Generating the docs...');

    // See if outputDir is set
    if ( ! this._config.outputDir || typeof this._config.outputDir !== 'string' || ! this._config.outputDir.trim() )
      return this._emit('error', new Error('No outputDir set on config!'));

    // See if root content is provided when multipage is on
    if ( this._config.rendererOptions.multiPage && ! this._config.rootContent )
      return this._emit('error', new Error('No root content provided for multi-page rendering!'));

    // Parse all raw contents to HTML or API Objects
    try {

      await this._parseConfigSections(this._config);
      await this._parseSectionContent(null, true);

    }
    catch (error) {

      return this._emit('error', error);

    }

    const themeName = this._config.rendererOptions.theme;
    const flavorName = this._config.rendererOptions.flavor;
    let themeConfig = {}, css, template, helpers, partials, userAssets = {}, warnings = [];

    // See if index.hbs exists
    if ( ! fs.existsSync(path.join(this._config.themeDir, themeName, 'index.hbs')) )
      return this._emit('error', new Error(`Could not find index.hbs of theme ${themeName}!`));

    // See if styles.scss exists
    if ( ! fs.existsSync(path.join(this._config.themeDir, themeName, 'styles.scss')) )
      return this._emit('error', new Error(`Could not find styles.scss of theme ${themeName}!`));

    // Load theme's config file (if any)
    const themeDir = path.join(this._config.themeDir, themeName);
    
    if ( fs.existsSync(path.join(themeDir, 'config.json')) )
      themeConfig = this._require(path.join(this._config.themeDir, themeName, 'config.json'));
    else if ( fs.existsSync(path.join(themeDir, 'config.yaml')) )
      themeConfig = yaml.read(path.join(this._config.themeDir, themeName, 'config.yaml'));
    else if ( fs.existsSync(path.join(themeDir, 'config.yml')) )
      themeConfig = yaml.read(path.join(this._config.themeDir, themeName, 'config.yml'));

    this._themeConfig = _.cloneDeep(themeConfig);

    // Prepare theme's flavor (if any)
    if ( themeConfig.hasFlavors ) {

      const selectedFlavor = flavorName || themeConfig.defaultFlavor;
      this._selectedFlavor = selectedFlavor;

      // See if any flavor is selected
      if ( ! selectedFlavor ) return this._emit('error', new Error(`No flavor selected for theme ${themeName} since theme has no default flavor!`));

      // See if flavor sass file exists
      if ( ! fs.existsSync(path.join(this._config.themeDir, themeName, 'flavors', `_${selectedFlavor}.scss`)) )
        return this._emit('error', new Error(`Cannot find the ${selectedFlavor} flavor's .scss file of theme ${themeName}!`));

      // Copy flavor file to _final.scss
      try {

        await fs.writeFile(path.join(this._config.themeDir, themeName, 'flavors', '_final.scss'), await fs.readFile(path.join(this._config.themeDir, themeName, 'flavors', `_${selectedFlavor}.scss`), { encoding: 'utf8' }));

      }
      catch (error) {

        return this._emit('error', new Error('Could not generate final flavor!\n' + error));

      }

    }

    // Read index.hbs
    try {

      template = await fs.readFile(path.join(this._config.themeDir, themeName, 'index.hbs'), { encoding: 'utf8' });

    }
    catch (error) {

      return this._emit('error', new Error(`Could not read index.hbs!\n${error}`));

    }

    // Register theme's Handlebars helpers (if any)
    if ( fs.existsSync(path.join(this._config.themeDir, themeName, 'hbs-helpers.js')) ) {

      try {

        helpers = this._require(path.join(this._config.themeDir, themeName, 'hbs-helpers.js'));

        // Register helpers
        this._renderer.registerHelpers(helpers);

      }
      catch (error) {

        return this._emit('error', new Error(`Could not import theme's Handlebars helpers!\n${error}`));

      }

    }

    // Register theme's Handlebars partials (if any)
    if ( fs.existsSync(path.join(this._config.themeDir, themeName, 'hbs-partials.js')) ) {

      try {

        partials = this._require(path.join(this._config.themeDir, themeName, 'hbs-partials.js'));

        // Register partials
        this._renderer.registerPartials(partials);

      }
      catch (error) {

        return this._emit('error', new Error(`Could not import theme's Handlebars partials!\n${error}`));

      }

    }

    // Compile SASS to CSS
    try {

      let result = await this._renderer.compileSass(path.join(this._config.themeDir, themeName, 'styles.scss'));

      // Save warnings
      warnings = result.warnings().map(warning => warning.toString());

      css = result.css;

    }
    catch (error) {

      return this._emit('error', new Error(`Could not compile styles.scss!\n${error}`));

    }

    // Create output directory if needed or delete it's content if already exists
    const outputDirPath = path.resolve(path.join(this._basePath, this._config.outputDir));

    try {

      // Ensure directory
      await fs.ensureDir(outputDirPath);

      // Scan the directory for files
      const outputFiles = await fs.readdir(outputDirPath);
      const promises = [];

      // Remove all files and directories (ignoring any paths that start with a dot)
      for ( const file of outputFiles ) {

        if ( file.match(/^\..+$/) ) continue;
        if ( this._config.exclusions && this._config.exclusions.length && this._config.exclusions.includes(file) ) continue;

        promises.push(fs.remove(path.join(outputDirPath, file)));

      }

      await Promise.all(promises);

    }
    catch (error) {

      return this._emit('error', new Error(`Could not create/clear output directory at ${outputDirPath}!\n${error}`));

    }

    // Write styles.css
    try {

      await fs.ensureDir(path.join(outputDirPath, 'assets', 'theme'));

      await fs.writeFile(path.join(outputDirPath, 'assets', 'theme', 'styles.css'), css);

    }
    catch (error) {

      return this._emit('error', new Error(`Could not write styles.css at ${path.join(outputDirPath, 'assets', 'styles.css')}!\n${error}`));

    }

    // Copy all theme assets
    if ( themeConfig.assets ) {

      try {

        for ( const asset of themeConfig.assets ) {

          await fs.copy(path.join(this._config.themeDir, themeName, asset), path.join(outputDirPath, 'assets', 'theme', asset));

        }

      }
      catch (error) {

        return this._emit('error', `Could not copy theme assets!\n${error}`);

      }

    }

    // Copy all user assets
    if ( themeConfig.userAssets && this._config.themeOptions ) {

      try {

        for ( const assetName in themeConfig.userAssets ) {

          // If asset is not provided
          if ( ! this._config.themeOptions[assetName] ) continue;

          const assetPath = path.join(themeConfig.userAssets[assetName], path.basename(this._config.themeOptions[assetName]));

          await fs.copy(path.resolve(path.join(this._basePath, this._config.themeOptions[assetName])), path.join(outputDirPath, 'assets', 'theme', assetPath));

          // Add asset to template data
          userAssets[assetName] = '/assets/theme/' + assetPath.replace(/\\/g, '/');

        }

      }
      catch (error) {

        return this._emit('error', `Could not copy user assets!\n${error}`);

      }

    }

    // Copy all content assets
    if ( this._config.contentAssets ) {

      try {

        await fs.ensureDir(path.resolve(path.join(this._basePath, this._config.outputDir, 'assets', 'contents')));

      }
      catch (error) {

        return this._emit('error', new Error(`Could not create content assets directory!\n${error}`));

      }

      for ( const assetFilename in this._config.contentAssets ) {

        const assetPath = path.resolve(path.join(this._basePath, this._config.basePath || '', assetFilename));
        const assetDest = path.resolve(path.join(this._basePath, this._config.outputDir, 'assets', 'contents', this._config.contentAssets[assetFilename]));

        try {

          await fs.copy(assetPath, assetDest);

        }
        catch (error) {

          return this._emit('error', new Error(`Could not copy content asset from ${assetFilename} to ${assetDest}!\n${error}`));

        }

      }

    }

    let templateData = [];

    // Generate template data for each version
    for ( const version of this._config.rendererOptions.versions ) {

      let versionTemplateData;

      // Generate template data
      if ( this._config.rendererOptions.multiPage ) {

        versionTemplateData = this._generateMultiPageTemplateData(this._config.rendererOptions, version, this._getBlueprintByVersion(version));

      }
      else {

        versionTemplateData = this._generateTemplateData(this._config.rendererOptions, version);

      }

      templateData.push(versionTemplateData);

    }

    let hasVersions = this._config.rendererOptions.versions.length > 1;

    // Generate the documentation
    for ( let i = 0; i < this._config.rendererOptions.versions.length; i++ ) {

      const version = this._config.rendererOptions.versions[i];

      let finalPath = path.join(outputDirPath, hasVersions ? (version === '*' ? 'all' : version) : '');

      // Create version directory if needed
      try {

        if ( hasVersions ) await fs.ensureDir(finalPath);

      }
      catch (error) {

        return this._emit('error', new Error(`Could not create directory at ${finalPath}!`));

      }

      // Single page
      if ( ! this._config.rendererOptions.multiPage ) {

        // Render and write index.html
        try {

          await fs.writeFile(path.join(finalPath, 'index.html'), this._renderer.renderHandlebars(template, this._finalizeTemplateData(templateData[i], userAssets)));

        }
        catch (error) {

          return this._emit('error', new Error(`Could not generate doc!\n${error}`));

        }

      }
      else {

        // Render and write the root index.html
        try {

          await fs.writeFile(path.join(finalPath, 'index.html'), this._renderer.renderHandlebars(template, this._finalizeTemplateData(templateData[i][0], userAssets)));

        }
        catch (error) {

          return this._emit('error', new Error(`Could not generate doc!\n${error}`));

        }

        // Build the rest of the documentation recursively
        try {

          await this._generateMultiPageDocs(finalPath, templateData[i], template, userAssets, version);

        }
        catch (error) {

          return this._emit('error', `Could not generate doc!\n${error}`);

        }

      }

    }

    // Create index.html for redirecting if needed
    if ( hasVersions && ! this._config.rendererOptions.noRedirect ) {

      try {

        let defaultVersion = this._config.rendererOptions.defaultVersion;

        // If default version is wrong
        if ( defaultVersion && ! this._config.rendererOptions.versions.includes(defaultVersion) ) {

          warnings.push(`Invalid default version "${defaultVersion}"! Latest version will be used for the redirect.`);
          defaultVersion = undefined;

        }

        const redirectTo = (defaultVersion === '*' ? 'all' : defaultVersion) || this._config.rendererOptions.versions
        .map(version => version === '*' ? 'all' : version)
        .reduce((a,b) => a > b ? a : b);

        await fs.writeFile(path.resolve(outputDirPath, 'index.html'), redirectTemplate.replace('{{REDIRECT_TO}}', redirectTo), { encoding: 'utf-8' });

      }
      catch (error) {

        return this._emit('error', new Error(`Could not create index.html for redirection!\n${error}`));

      }

    }

    // Minify the output
    this._emit('update', 'Minifying the generated files...');

    let outputFiles;

    // Scan the output directory for JS, CSS, and HTML files
    try {

      outputFiles = await this._scanDir(outputDirPath);

    }
    catch (error) {

      return this._emit('error', error);

    }

    outputFiles = outputFiles.filter(filename => ['.js', '.css'].includes(path.extname(filename)));

    // Minify all the files (all .min files will be ignored)
    try {

      await this._renderer.minify(outputFiles);

    }
    catch (error) {

      this._emit('error', new Error(`Could not minify the generated files!\n${error}`));

    }

    this._emit('finished', warnings);

  }

  async serve(port) {

    this._emit('update', 'Serving the docs...');

    // See if outputDir is set
    if ( ! this._config.outputDir || typeof this._config.outputDir !== 'string' || ! this._config.outputDir.trim() )
      return this._emit('error', new Error('No outputDir set on config!'));

    try {

      port = await this._server.serve(path.resolve(path.join(this._basePath, this._config.outputDir)), port);

      this._emit('served', path.resolve(path.join(this._basePath, this._config.outputDir)), port);

    }
    catch (error) {

      return this._emit('error', new Error(`Could not serve the docs!\n${error}`));

    }

  }

  _emit(event, ...args) {

    if ( ! this._handlers.hasOwnProperty(event) ) return;

    for ( const handler of this._handlers[event] ) {

      handler(...args);

    }

  }

  async _readConfig(configPathOrObject) {

    let config;

    // Load flconfig.json
    try {

      // If path provided
      if ( typeof configPathOrObject === 'string' ) {

        const extension = path.extname(configPathOrObject).toLowerCase();

        // If JSON file
        if ( extension === '.json' )
          config = this._require(path.resolve(this._basePath, configPathOrObject));
        // If YAML file
        else if ( extension === '.yaml' || extension === '.yml' )
          config = yaml.read(path.resolve(this._basePath, configPathOrObject));
        // If unsupported extension
        else
          throw new Error(`Invalid config file extension "${extension}"!`);

      }
      // If object provided
      else if ( configPathOrObject && typeof configPathOrObject === 'object' && configPathOrObject.constructor === Object )
        config = _.cloneDeep(configPathOrObject);
      // If nothing provided
      else {

        // If flconfig.json exists
        if ( fs.existsSync(path.resolve(this._basePath, 'flconfig.json')) )
          config = this._require(path.resolve(this._basePath, 'flconfig.json'));
        // If flconfig.yaml exists
        else if ( fs.existsSync(path.resolve(this._basePath, 'flconfig.yaml')) )
          config = yaml.read(path.resolve(this._basePath, 'flconfig.yaml'));
        // If flconfig.yml exists
        else if ( fs.existsSync(path.resolve(this._basePath, 'flconfig.yml')) )
          config = yaml.read(path.resolve(this._basePath, 'flconfig.yml'));
        // If none of the files exist
        else
          throw new Error('Could not find a Flourite config file!');

      }

    }
    catch (error) {

      throw error;

    }

    // Initialize a new renderer with the renderer options
    this._renderer = new Renderer(config.rendererOptions);
    // Update the renderer options on flconfig.json with the final resolved renderer options
    config.rendererOptions = this._renderer.options;

    this._originalConfig = _.cloneDeep(config);

    // Load the blueprint (read all contents)
    try {

      config.blueprint = await this._loadBlueprint(config.blueprint, config.basePath);

    }
    catch (error) {

      throw error;

    }

    // Load root content (if any)
    if ( config.rootContent && config.rendererOptions.multiPage ) {

      try {

        config.rootContent = await this._loadContent(config.basePath, config.rootContent);

      }
      catch (error) {

        throw error;

      }

    }

    return config;

  }

  async _loadBlueprint(blueprint, basePath) {

    const loaded = [];

    // Read each section definition in blueprint
    for ( const definition of blueprint ) {

      const section = {
        title: definition.title,
        raw: [],
        version: definition.version || '*' // Default version
      };

      // Recur if section has a sub-section
      if ( definition.hasOwnProperty('sub') && typeof definition.sub === 'object' && definition.sub.constructor === Array ) {

        section.sub = await this._loadBlueprint(definition.sub, basePath);

      }

      // Load array of contents
      if ( typeof definition.content === 'object' && definition.content.constructor === Array ) {

        for ( const contentPath of definition.content ) {

          try {

            section.raw.push(await this._loadContent(basePath, contentPath));

          }
          catch (error) {

            throw error;

          }

        }

      }
      // Load single content
      else if ( typeof definition.content === 'string' ) {

        try {

          section.raw.push(await this._loadContent(basePath, definition.content));

        }
        catch (error) {

          throw error;

        }

      }
      else {

        throw new Error('Invalid content on section ' + definition.title + '!');

      }

      // Add the resolved section to loaded array
      loaded.push(section);

    }

    return loaded;

  }

  async _loadContent(basePath, contentPath) {

    // Get extension name
    const ext = path.extname(contentPath);

    // Load the content from file
    try {

      if ( ext.toLowerCase() === '.md' ) return await fs.readFile(path.resolve(path.join(this._basePath, basePath || '', contentPath)), { encoding: 'utf8' });
      if ( ext.toLowerCase() === '.json' ) return this._require(path.resolve(path.join(this._basePath, basePath || '', contentPath)));
      if ( ext.toLowerCase() === '.yaml' ) return yaml.read(path.resolve(path.join(this._basePath, basePath || '', contentPath)));
      if ( ext.toLowerCase() === '.yml' ) return yaml.read(path.resolve(path.join(this._basePath, basePath || '', contentPath)));

    }
    catch (error) {

      throw new Error('Could not load content at "' + path.resolve(path.join(this._basePath, basePath || '', contentPath)) + '"!\n' + error);

    }

    throw new Error('Content type not supported: ' + contentPath);

  }

  async _parseConfigSections(config) {

    for ( const section of config.blueprint ) {

      // Parse sections
      try {

        await this._parseSectionContent(section);

      }
      catch (error) {

        throw error;

      }

    }

  }

  async _parseSectionContent(section, root, previousTitles) {

    previousTitles = previousTitles || [];

    // Root content
    if ( root ) {

      // Skip if multi-page is off
      if ( ! this._config.rendererOptions.multiPage ) return;

      // Markdown
      if ( typeof this._config.rootContent === 'string' ) this._config.rootContent = this._renderer.renderMarkdown(this._config.rootContent);

      // API
      if ( typeof this._config.rootContent === 'object' ) {

        try {

          await this._finalizeRawAPI(this._config.rootContent);

        }
        catch (error) {

          throw error;

        }

        this._config.rootContent = this._renderer.renderAPI(this._config.rootContent);

      }

      return;

    }

    // Recur if section has sub-sections
    if ( section.sub ) {

      for ( const subSection of section.sub ) {

        try {

          await this._parseSectionContent(subSection, false, previousTitles.concat(section.title));

        }
        catch (error) {

          throw new Error(`Could not parse content of section ${subSection.title}!\n${error}`);

        }

      }

    }

    // Parse section content
    section.content = [];

    for ( const raw of section.raw ) {

      // Markdown
      if ( typeof raw === 'string' ) section.content.push(this._renderer.renderMarkdown(raw, ! this._config.rendererOptions.multiPage ? previousTitles.concat(section.title) : undefined));

      // API
      if ( typeof raw === 'object' ) {

        try {

          await this._finalizeRawAPI(raw);

        }
        catch (error) {

          throw error;

        }

        section.content.push(this._renderer.renderAPI(raw, ! this._config.rendererOptions.multiPage ? previousTitles.concat(section.title) : undefined));

      }

    }

    // Delete the raw content
    delete section.raw;

  }

  async _finalizeRawAPI(raw) {

    // Convert object bodies to arrays with a single item
    if ( raw.request && raw.request.body ) {

      if ( raw.request.body.constructor === Object ) raw.request.body = [raw.request.body];

      // Load external files
      try {

        await this._loadExternalAPIFiles(raw.request);

      }
      catch (error) {

        throw error;

      }

    }

    if ( raw.response && raw.response.body ) {

      if ( raw.response.body.constructor === Object ) raw.response.body = [raw.response.body];

      // Load external files
      try {

        await this._loadExternalAPIFiles(raw.response);

      }
      catch (error) {

        throw error;

      }

    }

    if ( raw.examples ) {

      for ( const example of raw.examples ) {

        if ( example.request && example.request.body ) {

          if ( example.request.body.constructor === Object ) example.request.body = [example.request.body];

          // Load external files
          try {

            await this._loadExternalAPIFiles(example.request, 'value');

          }
          catch (error) {

            throw error;

          }

        }

        if ( example.response && example.response.body ) {

          if ( example.response.body.constructor === Object ) example.response.body = [example.response.body];

          // Load external files
          try {

            await this._loadExternalAPIFiles(example.response, 'value');

          }
          catch (error) {

            throw error;

          }

        }

      }

    }

  }

  async _loadExternalAPIFiles(object, key) {

    for ( const body of object.body ) {

      if ( body.externalFile ) {

        const ext = path.extname(body.externalFile);

        try {

          if ( ext === '.json' ) body[key || 'model'] = this._require(path.resolve(path.join(this._basePath, body.externalFile)));
          if ( ext === '.yaml' || ext === '.yml' ) body[key || 'model'] = yaml.read(path.resolve(path.join(this._basePath, body.externalFile)));
          if ( ext === '.xml' ) body[key || 'model'] = (await fs.readFile(path.resolve(path.join(this._basePath, body.externalFile)), { encoding: 'utf8' })).trim();

        }
        catch (error) {

          throw error;

        }

        delete body.externalFile;

      }

    }

  }

  async _generateMultiPageDocs(finalPath, templateData, template, userAssets, version) {

    for ( const pageData of templateData ) {

      // Skip root
      if ( ! pageData.path.length ) continue;

      const dirPath = this._resolveSectionPath(pageData.path, version);

      // Create directory
      try {

        await fs.ensureDir(path.join(finalPath, dirPath));

      }
      catch (error) {

        throw error;

      }

      // Render and write index.html
      try {

        await fs.writeFile(path.join(finalPath, dirPath, 'index.html'), this._renderer.renderHandlebars(template, this._finalizeTemplateData(pageData, userAssets)));

      }
      catch (error) {

        throw error;

      }

    }

  }

  _generateMultiPageTemplateData(rendererOptions, version, blueprint, pathPrefix, rootGenerated) {

    // Empty array for path prefix if it's the outer call
    pathPrefix = pathPrefix || [];

    let data = [];
    let index = 0;

    // Generate a template data for root
    if ( ! rootGenerated ) data.push(this._generateTemplateData(rendererOptions, version, []));

    // Generate a template data for each section with links relative to that section
    for ( const section of blueprint ) {

      // If not included in version
      if ( ! this._isIncludedInVersion(section.version, version) ) continue;

      data.push(this._generateTemplateData(rendererOptions, version, pathPrefix.concat(index)));

      if ( section.sub ) {

        data = data.concat(this._generateMultiPageTemplateData(rendererOptions, version, section.sub, pathPrefix.concat(index), true));

      }

      index++;

    }

    return data;

  }

  _generateTemplateData(rendererOptions, version, linksRelativeTo) {

    linksRelativeTo = linksRelativeTo || [];

    const data = {};

    data.title = this._config.title || '';
    data.multiPage = this._config.rendererOptions.multiPage;
    data.version = version === '*' ? 'All' : version;

    if ( rendererOptions.versions.length > 1 ) {

      data.versions = rendererOptions.versions.map(targetVersion => {

        return {
          version: targetVersion === '*' ? 'All' : targetVersion,
          // link: '../'.repeat(linksRelativeTo.length + 1) + (version === '*' ? 'all' : version) + (linksRelativeTo.length && ! rendererOptions.rootVersionLinksOnly ? this._resolveSectionPath(linksRelativeTo.join('/'), version) : '/')
          link: this._generateVersionLink(version, targetVersion, linksRelativeTo, rendererOptions.rootVersionLinksOnly)
        };

      });

    }

    if ( data.multiPage ) data.path = linksRelativeTo.join('/');

    if ( this._config.hasOwnProperty('themeOptions') )
      data.extended = _.clone(this._config.themeOptions);

    data.sections = [];
    data.contents = [];

    // Section index to enable location-awareness for _generateSectionTemplateData
    let index = 0;

    for ( const section of this._getBlueprintByVersion(version) ) {

      // If not included in version
      // if ( ! this._isIncludedInVersion(section.version, version) ) continue;

      const sectionData = this._generateSectionTemplateData(version, [index++], section, null, linksRelativeTo);

      data.sections.push(sectionData);

      // Generate section content data for this page if page is singular (no multipage)
      if ( ! data.multiPage ) data.contents = data.contents.concat(this._generateSectionContentTemplateData(section, version, sectionData));

    }

    // Generate specific section content for this page (multipage)
    if ( data.multiPage ) data.contents = this._generateMultiPageSectionContentTemplateData(linksRelativeTo, data);

    return data;

  }

  _finalizeTemplateData(pageData, userAssets) {

    // Flatten sections
    let flattened = [];
    let index = 0;

    for ( const section of pageData.sections ) {

      flattened.push({
        title: section.title,
        link: section.link,
        level: 0,
        path: index + '',
        selected: (index + '') === pageData.path
      });

      if ( section.sub ) flattened = flattened.concat(this._flattenSubSections(pageData, section.sub, [index]));

      index++;

    }

    pageData.sections = flattened;

    // Attach user assets
    if ( _.keys(userAssets).length ) pageData.extended = _.merge(pageData.extended, userAssets);

    // Attach theme flavor
    pageData.themeFlavor = this._selectedFlavor;

    // Generate root prefix
    if ( ! pageData.versions ) pageData.rootPrefix = ['.'];
    else pageData.rootPrefix = ['..'];

    if ( pageData.path ) pageData.path.split('/').map(() => pageData.rootPrefix.push('..'));

    pageData.rootPrefix = pageData.rootPrefix.join('/');

    // Generate version root prefix
    pageData.versionRootPrefix = pageData.versions ? pageData.rootPrefix + `/${pageData.version.toLowerCase()}` : pageData.rootPrefix;

    // Inject root prefix on all content
    for ( const content of pageData.contents ) {

      for ( const c of content.content ) {

        if ( c.type === 'doc' ) {

          c.value = c.value.replace(/%7B%7BrootPrefix%7D%7D/g, pageData.rootPrefix)
                           .replace(/{{rootPrefix}}/g, pageData.rootPrefix)
                           .replace(/%7B%7BversionRootPrefix%7D%7D/g, pageData.versionRootPrefix)
                           .replace(/{{versionRootPrefix}}/g, pageData.versionRootPrefix)
                           .replace(/%7B%7B!rootPrefix%7D%7D/g, '{{rootPrefix}}')
                           .replace(/{{!rootPrefix}}/g, '{{rootPrefix}}')
                           .replace(/%7B%7B!versionRootPrefix%7D%7D/g, '{{versionRootPrefix}}')
                           .replace(/{{!versionRootPrefix}}/g, '{{versionRootPrefix}}');

        }

      }

    }

    return pageData;

  }

  _generateMultiPageSectionContentTemplateData(path, pageData) {

    // If root
    if ( ! path.length ) {

      // Set page title
      pageData.pageTitle = this._config.title;

      return [{
        title: this._config.title,
        id: this._renderer.urlFriendly(this._config.title),
        content: [{
          value: this._config.rootContent,
          type: typeof this._config.rootContent === 'string' ? 'doc': 'api'
        }]
      }];

    }

    const selectedSection = this._getSectionByPath(path, pageData.version);

    // Set page title
    pageData.pageTitle = selectedSection.title;

    const sectionContent = {
      title: selectedSection.title,
      id: this._renderer.urlFriendly(selectedSection.title),
      content: []
    };

    for ( const content of selectedSection.content ) {

      sectionContent.content.push({
        type: typeof content === 'string' ? 'doc' : 'api',
        value: content
      });

    }

    return [sectionContent];

  }

  _generateSectionContentTemplateData(section, version, sectionData) {

    let subContents = [];
    let sectionContent = {
      title: section.title,
      id: sectionData.link.substr(1),
      content: []
    };

    // Generate content data
    for ( const content of section.content ) {

      sectionContent.content.push({
        type: typeof content === 'string' ? 'doc' : 'api',
        value: content
      });

      // Recur if section has sub-sections
      if ( section.sub ) {

        for ( let i = 0; i < section.sub.length; i++ ) {

          if ( ! this._isIncludedInVersion(section.sub[i].version, version) ) continue;

          subContents = subContents.concat(this._generateSectionContentTemplateData(section.sub[i], version, sectionData.sub[i]));

        }

      }

    }

    return [sectionContent].concat(subContents);

  }

  _generateSectionTemplateData(version, sectionPath, section, previousTitles, linksRelativeTo) {

    const data = {};

    data.title = section.title;

    // Generate link
    // For single page (only anchors)
    if ( ! this._config.rendererOptions.multiPage ) {

      data.link = `#${this._renderer.urlFriendly(section.title, previousTitles)}`;

    }
    // For multi-page (links relative to a section/page)
    else {

      data.link = this._resolveNavigation(version, this._findPath(linksRelativeTo, sectionPath), linksRelativeTo);

    }

    // Recur if section has sub-section
    if ( section.sub ) {

      data.sub = [];

      let index = 0;

      for ( const subSection of section.sub ) {

        // Skip section if not included in version
        if ( ! this._isIncludedInVersion(subSection.version, version) ) continue;

        data.sub.push(this._generateSectionTemplateData(version, sectionPath.concat(index++), subSection, (previousTitles || []).concat(section.title), linksRelativeTo));

      }

      if ( ! data.sub.length ) delete data.sub;

    }

    return data;

  }

  _isIncludedInVersion(version, target) {

    // Validation
    if ( target === "*" ) return true;
    if ( ! version ) return true;
    if ( typeof version !== 'string' && (typeof version !== 'object' || version.constructor !== Array) )
      return false;

    // Sanitization
    const range = typeof version === 'string' ? [version] : version;

    let isInVersion = true;

    for ( const req of range )
      isInVersion = isInVersion && semver.satisfies(target, req);

    return isInVersion;

  }

  _findPath(a, b) {

    // Navigation to self
    if ( a.join('/') === b.join('/') ) return ['.'];

    // If navigation from root
    if ( ! a.length ) return b;

    // Calculate length difference
    let aDiff = a.length - b.length;
    let bDiff = b.length - a.length;

    // For comparison
    let aComp = a.slice(0);
    let bComp = b.slice(0);
    let common = null;

    let navigation = [];

    // Extract aligned parents for comparison
    if ( aDiff >= 0 ) {

      aComp.splice(-aDiff);

    }
    else {

      bComp.splice(-bDiff);

    }

    // Find common ancestor
    for ( let i = 0; i < aComp.length; i++ ) {

      if ( aComp[i] === bComp[i] ) common = i;
      else break;

    }

    // Navigate back to the common ancestor on a
    if ( a.length - 1 !== common )
      navigation = navigation.concat('../'.repeat(a.length - (common === null ? 0 : common + 1)).slice(0, -1).split('/'));

    // Navigate forward from common ancestor on b
    navigation = navigation.concat(common !== null ? b.slice(common + 1) : b);

    return navigation;

  }

  _resolveNavigation(version, navigation, target) {

    // Navigation to self
    if ( navigation[0] === '.' ) return './';

    let link = [];
    let navigated = target.slice(0);
    let selectedSection = this._getBlueprintByVersion(version);
    let firstNavigation = true;

    // Navigate on target with section titles
    for ( const nav of navigation ) {

      // Navigate back
      if ( nav === '..' ) {

        navigated.splice(-1);
        link.push(nav);

      }
      else {

        if ( firstNavigation ) {

          // Select the section currently left on navigated
          for ( const nav of navigated ) {

            if ( selectedSection.constructor === Array ) selectedSection = selectedSection[nav];
            else selectedSection = selectedSection.sub[nav];

          }

          firstNavigation = false;

        }

        // Navigate forward
        if ( selectedSection.constructor === Array ) selectedSection = selectedSection[nav];
        else selectedSection = selectedSection.sub[nav];

        link.push(this._renderer.urlFriendly(selectedSection.title));

      }

    }

    // Add . to the link if the first item is not ..
    if ( link.length && link[0] !== '..' ) link.unshift('.');

    return link.join('/') + '/';

  }

  _getBlueprintByVersion(version) {

    if ( version.toLowerCase() === 'all' ) return this._config.blueprint;

    let blueprint = [];

    // Filter sections by version
    for ( const section of this._config.blueprint ) {

      if ( ! this._isIncludedInVersion(section.version, version) ) continue;

      const cloned = _.cloneDeep(section);

      // Filter sub-sections by version recursively
      this._filterBlueprintSubSectionsByVersion(cloned.sub, version);

      blueprint.push(cloned);

    }

    return blueprint;

  }

  _filterBlueprintSubSectionsByVersion(blueprint, version) {

    if ( ! blueprint ) return;

    for ( let i = 0; i < blueprint.length; i++ ) {

      if ( this._isIncludedInVersion(blueprint[i].version, version) ) {

        this._filterBlueprintSubSectionsByVersion(blueprint[i].sub, version);
        continue;

      }

      blueprint.splice(i, 1);
      i--;

    }

  }

  _flattenSubSections(pageData, subSections, pathPrefix) {

    let flattened = [];
    let index = 0;

    for ( const section of subSections ) {

      const temp = {
        title: section.title,
        link: section.link,
        path: pathPrefix.concat(index).join('/'),
        selected: pathPrefix.concat(index).join('/') === pageData.path
      };

      temp.level = temp.path.split('/').length - 1;

      flattened.push(temp);

      if ( section.sub ) flattened = flattened.concat(this._flattenSubSections(pageData, section.sub, pathPrefix.concat(index)));

      index++;

    }

    return flattened;

  }

  _resolveSectionPath(sectionPath, version) {

    let resolved = '';
    let selectedSection = this._getBlueprintByVersion(version);

    for ( const index of sectionPath.split('/') ) {

      if ( selectedSection.constructor === Array ) selectedSection = selectedSection[index];
      else selectedSection = selectedSection.sub[index];

      if ( version && (! selectedSection || ! this._isIncludedInVersion(selectedSection.version, version)) ) return '/';

      resolved = resolved + '/' + this._renderer.urlFriendly(selectedSection.title);

    }

    return resolved;

  }

  _getSectionByPath(path, version) {

    let selectedSection = this._getBlueprintByVersion(version);

    for ( const index of path ) {

      if ( selectedSection.constructor === Array ) selectedSection = selectedSection[index];
      else selectedSection = selectedSection.sub[index];

    }

    return selectedSection;

  }

  _generateVersionLink(currentVersion, targetVersion, relativeTo, rootOnly) {

    if ( currentVersion === targetVersion ) return '.';

    const targetRootLink = '../'.repeat(relativeTo.length + 1) + (targetVersion === '*' ? 'all' : targetVersion) + '/';

    if ( rootOnly || ! relativeTo.length ) return targetRootLink;

    // Check if current path (relativeTo) exists on the targetVersion and they're the same page
    if ( this._pathExistsOnVersion(relativeTo, targetVersion) && this._resolveSectionPath(relativeTo.join('/'), currentVersion) === this._resolveSectionPath(relativeTo.join('/'), targetVersion) )
      return (targetRootLink + this._resolveSectionPath(relativeTo.join('/'), targetVersion)).replace(/\/+/g, '/');

    return targetRootLink.replace(/\/+/g, '/');

  }

  _pathExistsOnVersion(path, version) {

    let selectedSection = this._getBlueprintByVersion(version);

    for ( const index of path ) {

      if ( selectedSection.constructor === Object ) selectedSection = selectedSection.sub;

      if ( ! selectedSection ) return false;

      selectedSection = selectedSection[index];

      if ( ! selectedSection ) return false;

    }

    return true;

  }

  _require(path) {

    delete require.cache[require.resolve(path)];

    return require(path);

  }

  async _scanDir(dirname) {

    let list;
    let files = [];

    try {

      list = await fs.readdir(path.resolve(dirname));

    }
    catch (error) {

      throw error;

    }

    for ( const item of list ) {

      let stats;

      try {

        stats = await fs.stat(path.resolve(path.join(dirname, item)));

      }
      catch (error) {

        throw error;

      }

      if ( stats.isDirectory() ) {

        files = files.concat(await this._scanDir(path.resolve(path.join(dirname, item))));

      }
      else {

        files.push(path.resolve(path.join(dirname, item)));

      }

    }

    return files;

  }

}

module.exports = Fluorite;
