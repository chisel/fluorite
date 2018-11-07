const fs = require('fs-extra');
const path = require('path');
const Renderer = require(path.join(__dirname, 'renderer.js'));
const Server = require(path.join(__dirname, 'server.js'));

class Fluorite {

  constructor() {

    this._handlers = {};

  }

  get config() {

    return this._config;

  }

  get options() {

    return {
      basePath: this._basePath
    };

  }

  load(configPath) {

    this._basePath = configPath ? path.dirname(configPath) : '.';

    this._readConfig(configPath ? path.basename(configPath) : 'flconfig.json')
    .then(config => {

      this._emit('update', 'Config was loaded');

      this._config = config;
      this._server = new Server(config.serverOptions);
      this._config.serverOptions = this._server.options;

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
    let themeConfig = {};
    let css, template, helpers;
    let warnings = [];

    // See if index.hbs exists
    if ( ! fs.existsSync(path.join(__dirname, 'themes', themeName, 'index.hbs')) )
      return this._emit('error', new Error(`Could not find index.hbs of theme ${themeName}!`));

    // See if styles.scss exists
    if ( ! fs.existsSync(path.join(__dirname, 'themes', themeName, 'styles.scss')) )
      return this._emit('error', new Error(`Could not find styles.scss of theme ${themeName}!`));

    // Load theme's config file (if any)
    if ( fs.existsSync(path.join(__dirname, 'themes', themeName, 'config.json')) )
      themeConfig = require(path.join(__dirname, 'themes', themeName, 'config.json'));

    // Prepare theme's flavor (if any)
    if ( themeConfig.hasFlavors ) {

      const selectedFlavor = flavorName || themeConfig.defaultFlavor;

      // See if any flavor is selected
      if ( ! selectedFlavor ) return this._emit('error', new Error(`No flavor selected for theme ${themeName} since theme has no default flavor!`));

      // See if flavor sass file exists
      if ( ! fs.existsSync(path.join(__dirname, 'themes', themeName, 'flavors', `_${selectedFlavor}.scss`)) )
        return this._emit('error', new Error(`Cannot find the ${selectedFlavor} flavor's .scss file of theme ${themeName}!`));

      // Copy flavor file to _final.scss
      try {

        await fs.writeFile(path.join(__dirname, 'themes', themeName, 'flavors', '_final.scss'), await fs.readFile(path.join(__dirname, 'themes', themeName, 'flavors', `_${selectedFlavor}.scss`), { encoding: 'utf8' }));

      }
      catch (error) {

        return this._emit('error', new Error('Could not generate final flavor!\n' + error));

      }

    }

    // Read index.hbs
    try {

      template = await fs.readFile(path.join(__dirname, 'themes', themeName, 'index.hbs'), { encoding: 'utf8' });

    }
    catch (error) {

      return this._emit('error', new Error(`Could not read index.hbs!\n${error}`));

    }

    // Register theme's Handlebars helpers (if any)
    if ( fs.existsSync(path.join(__dirname, 'themes', themeName, 'hbs-helpers.js')) ) {

      try {

        helpers = require(path.join(__dirname, 'themes', themeName, 'hbs-helpers.js'));

        // Register helpers
        this._renderer.registerHelpers(helpers);

      }
      catch (error) {

        return this._emit('error', new Error(`Could not import theme's Handlebars helpers!\n${error}`));

      }

    }

    // Compile SASS to CSS
    try {

      let result = await this._renderer.compileSass(path.join(__dirname, 'themes', themeName, 'styles.scss'));

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

      await fs.emptyDir(outputDirPath);

    }
    catch (error) {

      return this._emit('error', new Error(`Could not create/clear output directory at ${outputDirPath}!\n${error}`));

    }

    let templateData = [];

    // Generate template data for each version
    for ( const version of this._config.rendererOptions.versions ) {

      let versionTemplateData;

      // Generate template data
      if ( this._config.rendererOptions.multiPage ) {

        versionTemplateData = this._generateMultiPageTemplateData(this._config.rendererOptions, version, this._config.blueprint);

      }
      else {

        versionTemplateData = this._generateTemplateData(this._config.rendererOptions, version);

      }

      templateData.push(versionTemplateData);

    }

    await fs.writeJson('templateData.json', templateData, { spaces: 2 });

    let hasVersions = this._config.rendererOptions.versions.length > 1 || this._config.rendererOptions.versions[0] !== '*';

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

      // Write styles.css
      try {

        await fs.writeFile(path.join(finalPath, 'styles.css'), css);

      }
      catch (error) {

        return this._emit('error', new Error(`Could not write styles.css at ${path.join(finalPath, 'styles.css')}!\n${error}`));

      }

      // Copy all assets
      if ( themeConfig.assets ) {

        try {

          for ( const asset of themeConfig.assets ) {

            await fs.copy(path.join(__dirname, 'themes', themeName, asset), path.join(finalPath, asset));

          }

        }
        catch (error) {

          return this._emit('error', `Could not copy theme assets!\n${error}`);

        }

      }

      // Single page
      if ( ! this._config.rendererOptions.multiPage ) {

        // Render and write index.html
        try {

          await fs.writeFile(path.join(finalPath, 'index.html'), this._renderer.renderHandlebars(template, templateData[i]));

        }
        catch (error) {

          return this._emit('error', new Error(`Could not generate doc!\n${error}`));

        }

      }
      else {

        // Render and write the root index.html
        try {

          await fs.writeFile(path.join(finalPath, 'index.html'), this._renderer.renderHandlebars(template, templateData[i][0]));

        }
        catch (error) {

          return this._emit('error', new Error(`Could not generate doc!\n${error}`));

        }

        // Build the rest of the documentation recursively
        try {

          await this._generateMultiPageDocs(finalPath, templateData[i], template);

        }
        catch (error) {

          return this._emit('error', `Could not generate doc!\n${error}`);

        }

      }

    }

    this._emit('finished', warnings);

  }

  async _generateMultiPageDocs(finalPath, templateData, template) {

    for ( const pageData of templateData ) {

      // Skip root
      if ( ! pageData.path.length ) continue;

      const dirPath = this._resolveSectionPath(pageData.path);

      // Create directory
      try {

        await fs.ensureDir(path.join(finalPath, dirPath));

      }
      catch (error) {

        throw error;

      }

      // Render and write index.html
      try {

        await fs.writeFile(path.join(finalPath, dirPath, 'index.html'), this._renderer.renderHandlebars(template, pageData));

      }
      catch (error) {

        throw error;

      }

    }

  }

  _resolveSectionPath(sectionPath) {

    let resolved = '';
    let selectedSection = this._config.blueprint;

    for ( const index of sectionPath.split('/') ) {

      if ( selectedSection.constructor === Array ) selectedSection = selectedSection[index];
      else selectedSection = selectedSection.sub[index];

      resolved = resolved + '/' + this._renderer.urlFriendly(selectedSection.title);

    }

    return resolved;

  }

  _getSectionByPath(path) {

    let selectedSection = this._config.blueprint;

    for ( const index of path ) {

      if ( selectedSection.constructor === Array ) selectedSection = selectedSection[index];
      else selectedSection = selectedSection.sub[index];

    }

    return selectedSection;

  }

  _emit(event, ...args) {

    if ( ! this._handlers.hasOwnProperty(event) ) return;

    for ( const handler of this._handlers[event] ) {

      handler(...args);

    }

  }

  async serve(port) {

    this._emit('update', 'Serving the docs...');

    // See if outputDir is set
    if ( ! this._config.outputDir || typeof this._config.outputDir !== 'string' || ! this._config.outputDir.trim() )
      return this._emit('error', new Error('No outputDir set on config!'));

    try {

      port = await this._server.serve(path.resolve(path.join(this._basePath, this._config.outputDir)), port);

      this._emit('finished', port);

    }
    catch (error) {

      return this._emit('error', new Error(`Could not serve the docs!\n${error}`));

    }

  }

  async _readConfig(configPath) {

    let config;

    // Load flconfig.json
    try {

      config = require(path.resolve(path.join(this._basePath, configPath)));

    }
    catch (error) {

      throw error;

    }

    // Initialize a new renderer with the renderer options
    this._renderer = new Renderer(config.rendererOptions);
    // Update the renderer options on flconfig.json with the final resolved renderer options
    config.rendererOptions = this._renderer.options;

    // Load the blueprint (read all contents)
    try {

      config.blueprint = await this._loadBlueprint(config.blueprint, config.basePath);

    }
    catch (error) {

      throw error;

    }

    // Load root content (if any)
    if ( config.rootContent ) {

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
      if ( ext.toLowerCase() === '.json' ) return require(path.resolve(path.join(this._basePath, basePath || '', contentPath)));

    }
    catch (error) {

      throw new Error('Could not load content at "' + path.resolve(path.join('.', basePath || '', contentPath)) + '"!\n' + error);

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

          this._parseSectionContent(subSection, false, previousTitles.concat(section.title));

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
      if ( typeof raw === 'string' ) section.content.push(this._renderer.renderMarkdown(raw, previousTitles.concat(section.title)));

      // API
      if ( typeof raw === 'object' ) {

        try {

          await this._finalizeRawAPI(raw);

        }
        catch (error) {

          throw error;

        }

        section.content.push(this._renderer.renderAPI(raw, previousTitles.concat(section.title)));

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

        this._loadExternalAPIFiles(raw.request);

      }
      catch (error) {

        throw error;

      }

    }

    if ( raw.response && raw.response.body ) {

      if ( raw.response.body.constructor === Object ) raw.response.body = [raw.response.body];

      // Load external files
      try {

        this._loadExternalAPIFiles(raw.response);

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

            this._loadExternalAPIFiles(example.request);

          }
          catch (error) {

            throw error;

          }

        }

        if ( example.response && example.response.body ) {

          if ( example.response.body.constructor === Object ) example.response.body = [example.response.body];

          // Load external files
          try {

            this._loadExternalAPIFiles(example.response);

          }
          catch (error) {

            throw error;

          }

        }

      }

    }

  }

  async _loadExternalAPIFiles(object) {

    for ( const body of object.body ) {

      if ( body.externalFile ) {

        const ext = path.extname(body.externalFile);

        try {

          if ( ext === '.json' ) body.model = require(path.resolve(path.join(this._basePath, body.externalFile)));
          if ( ext === '.xml' ) body.model = (await fs.readFile(path.resolve(path.join(this._basePath, body.externalFile)), { encoding: 'utf8' })).trim();

        }
        catch (error) {

          throw error;

        }

        delete body.externalFile;

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

    const data = {};

    data.title = this._config.title || '';
    data.multiPage = this._config.rendererOptions.multiPage;
    data.version = version === '*' ? 'All' : version;

    if ( linksRelativeTo ) {

      data.versions = rendererOptions.versions.map(version => {

        return {
          version: version === '*' ? 'All' : version,
          link: '../'.repeat(linksRelativeTo.length + 1) + (version === '*' ? 'all' : version) + (linksRelativeTo.length ? this._resolveSectionPath(linksRelativeTo.join('/')) : '/')
        };

      });

    }

    if ( data.multiPage ) data.path = linksRelativeTo.join('/');

    if ( this._config.hasOwnProperty('themeOptions') )
      data.extended = this._config.themeOptions;

    data.sections = [];
    data.contents = [];

    // Section index to enable location-awareness for _generateSectionTemplateData
    let index = 0;

    for ( const section of this._config.blueprint ) {

      // If not included in version
      if ( ! this._isIncludedInVersion(section.version, version) ) continue;

      const sectionData = this._generateSectionTemplateData(version, [index++], section, null, linksRelativeTo);

      data.sections.push(sectionData);

      // Generate section content data for this page if page is singular (no multipage)
      if ( ! data.multiPage ) data.contents = data.contents.concat(this._generateSectionContentTemplateData(section, version, sectionData));

    }

    // Generate specific section content for this page (multipage)
    if ( data.multiPage ) data.contents = this._generateMultiPageSectionContentTemplateData(linksRelativeTo, data);

    return data;

  }

  _generateMultiPageSectionContentTemplateData(path, pageData) {

    // If root
    if ( ! path.length ) {

      // Set page title
      pageData.pageTitle = this._config.title;

      return [{ title: this._config.title, content: this._config.rootContent, type: typeof this._config.rootContent === 'string' ? 'doc': 'api' }];

    }

    const selectedSection = this._getSectionByPath(path);

    // Set page title
    pageData.pageTitle = selectedSection.title;

    return selectedSection.content.map(content => {

      return {
        title: selectedSection.title,
        content: content,
        type: typeof content === 'string' ? 'doc' : 'api'
      };

    });

  }

  _generateSectionContentTemplateData(section, version, sectionData) {

    let contents = [];

    // Generate content data
    for ( const content of section.content ) {

      contents.push({
        title: section.title,
        id: sectionData.link.substr(1),
        content: content,
        type: typeof content === 'string' ? 'doc' : 'api'
      });

      // Recur if section has sub-sections
      if ( section.sub ) {

        for ( let i = 0; i < section.sub.length; i++ ) {

          if ( ! this._isIncludedInVersion(section.sub[i].version, version) ) continue;

          contents = contents.concat(this._generateSectionContentTemplateData(section.sub[i], version, sectionData.sub[i]));

        }

      }

    }

    return contents;

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

      data.link = this._resolveNavigation(this._findPath(linksRelativeTo, sectionPath), linksRelativeTo);

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

    if ( version === "*" ) return true;

    const condition = version.match(/^[<>]?[=]?/)[0];
    const semver = version.substr(condition.length).split('.');
    const targetSemver = target.split('.');

    if ( ! condition ) return version === target;
    if ( condition[1] === '=' && semver.join('.') == target ) return true;

    for ( let i = 0; i < targetSemver.length; i++ ) {

      const diff = targetSemver[i] - semver[i];

      if ( condition[0] === '>' ) {

        if ( ! diff ) continue;

        return diff > 0;

      }

      if ( condition[0] === '<' ) {

        if ( ! diff ) continue;

        return diff < 0;

      }

    }

    return false;

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

  _resolveNavigation(navigation, target) {

    // Navigation to self
    if ( navigation[0] === '.' ) return './';

    let link = [];
    let navigated = target.slice(0);
    let selectedSection = this._config.blueprint;
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

}

module.exports = Fluorite;
