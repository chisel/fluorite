const marked = require('marked');
const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/');
const sass = require('sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const Handlebars = require('handlebars');
const _ = require('lodash');

class Renderer {

  constructor(options) {

    this._options = _.merge({
      theme: 'onyx',
      hideEmptyColumns: false,
      multiPage: false,
      versions: ['*']
    }, options || {});

    // Install Prism languages
    loadLanguages([
      'abap',
      'actionscript',
      'ada',
      'apacheconf',
      'apl',
      'applescript',
      'arduino',
      'arff',
      'asciidoc',
      'asm6502',
      'aspnet',
      'autohotkey',
      'autoit',
      'bash',
      'basic',
      'batch',
      'bison',
      'brainfuck',
      'bro',
      'c',
      'csharp',
      'cpp',
      'coffeescript',
      'clojure',
      'crystal',
      'csp',
      'css-extras',
      'd',
      'dart',
      'diff',
      'django',
      'docker',
      'eiffel',
      'elixir',
      'elm',
      'erb',
      'erlang',
      'fsharp',
      'flow',
      'fortran',
      'gedcom',
      'gherkin',
      'git',
      'glsl',
      'go',
      'graphql',
      'groovy',
      'haml',
      'handlebars',
      'haskell',
      'haxe',
      'http',
      'hpkp',
      'hsts',
      'ichigojam',
      'icon',
      'inform7',
      'ini',
      'io',
      'j',
      'java',
      'jolie',
      'json',
      'julia',
      'keyman',
      'kotlin',
      'latex',
      'less',
      'liquid',
      'lisp',
      'livescript',
      'lolcode',
      'lua',
      'makefile',
      'markdown',
      'markup-templating',
      'matlab',
      'mel',
      'mizar',
      'monkey',
      'n4js',
      'nasm',
      'nginx',
      'nim',
      'nix',
      'nsis',
      'objectivec',
      'ocaml',
      'opencl',
      'oz',
      'parigp',
      'parser',
      'pascal',
      'perl',
      'php',
      'php-extras',
      'plsql',
      'powershell',
      'processing',
      'prolog',
      'properties',
      'protobuf',
      'pug',
      'puppet',
      'pure',
      'python',
      'q',
      'qore',
      'r',
      'jsx',
      'tsx',
      'renpy',
      'reason',
      'rest',
      'rip',
      'roboconf',
      'ruby',
      'rust',
      'sas',
      'sass',
      'scss',
      'scala',
      'scheme',
      'smalltalk',
      'smarty',
      'sql',
      'soy',
      'stylus',
      'swift',
      'tap',
      'tcl',
      'textile',
      'tt2',
      'twig',
      'typescript',
      'vbnet',
      'velocity',
      'verilog',
      'vhdl',
      'vim',
      'visual-basic',
      'wasm',
      'wiki',
      'xeora',
      'xojo',
      'xquery',
      'yaml'
    ]);

    // Set marked options
    marked.setOptions({
      // Prism syntax highlighter for code blocks
      highlight: (code, lang) => Prism.highlight(code, Prism.languages[lang || 'markup'], lang || 'markup')
    });

    // Define Handlebars helpers
    Handlebars.registerHelper('rootPrefix', (path) => {

      if ( ! path ) return '.';

      return '../'.repeat(path.split('/').length).slice(0, -1);

    });

  }

  registerHelpers(helpers) {

    if ( ! helpers ) return;

    for ( const helperName in helpers ) {

      if ( typeof helpers[helperName] !== 'function' ) continue;

      Handlebars.registerHelper(helperName, helpers[helperName]);

    }

  }

  get options() {

    return this._options;

  }

  renderMarkdown(raw, headerPrefix) {

    if ( headerPrefix ) headerPrefix = this.urlFriendly('', headerPrefix);

    return marked(raw, { headerPrefix: headerPrefix || '' });

  }

  renderAPI(raw, headerPrefix) {

    let api = {};

    api.info = this._renderAPIInfo(raw.title, raw.description, headerPrefix);
    if ( raw.auth ) api.auth = { enabled: raw.auth.enabled, content: this._renderAuth(raw.auth, headerPrefix) };
    if ( raw.path ) api.path = this._renderAPIPath(raw.path, raw.method, headerPrefix);
    if ( raw.params ) api.params = this._renderAPIParameters(raw.params, headerPrefix);
    if ( raw.queries ) api.queries = this._renderAPIQueryParameters(raw.queries, headerPrefix);

    if ( raw.request ) {

      api.request = {};

      if ( raw.request.body ) {

        api.request.body = [];

        for ( const body of raw.request.body ) {

          api.request.body.push({
            type: body.type,
            model: body.type === 'application/json' || body.type === 'application/xml' ? this._renderAPIBodyCodeBlock(body, headerPrefix) : body.type === 'multipart/form-data' || body.type === 'x-www-form-urlencoded' ? this._renderAPIBodyTable(body, headerPrefix) : this._renderAPIBodyDescription(body, headerPrefix)
          });

        }

        api.request.bodyTitle = this._renderAPIBodyTitle(false, headerPrefix);

      }

      if ( raw.request.headers ) api.request.headers = this._renderAPIHeaders(raw.request.headers, false, headerPrefix);
      if ( raw.request.cookies ) api.request.cookies = this._renderAPICookies(raw.request.cookies, false, headerPrefix);

    }

    if ( raw.response ) {

      api.response = {};

      if ( raw.response.body ) {

        api.response.body = [];

        for ( const body of raw.response.body ) {

          api.response.body.push({
            type: body.type,
            model: body.type === 'application/json' || body.type === 'application/xml' ? this._renderAPIBodyCodeBlock(body, headerPrefix) : body.type === 'multipart/form-data' || body.type === 'x-www-form-urlencoded' ? this._renderAPIBodyTable(body, headerPrefix) : this._renderAPIBodyDescription(body, headerPrefix)
          });

        }

        api.response.bodyTitle = this._renderAPIBodyTitle(true);

      }

      if ( raw.response.headers ) api.response.headers = this._renderAPIHeaders(raw.response.headers, true, headerPrefix);
      if ( raw.response.cookies ) api.response.cookies = this._renderAPICookies(raw.response.cookies, true, headerPrefix);

    }

    if ( raw.examples ) {

      api.examples = [];

      for ( const example of raw.examples ) {

        let apiExample = {};

        apiExample.title = this._renderAPIExampleTitle(headerPrefix);
        apiExample.path = this._renderAPIPath(example.path, raw.method, headerPrefix);

        if ( example.request ) {

          apiExample.request = {};

          if ( example.request.body ) {

            apiExample.request.body = [];

            for ( const body of example.request.body ) {

              apiExample.request.body.push({
                type: body.type,
                value: body.type === 'multipart/form-data' || body.type === 'w-xxx-form-urlencoded' ? this._renderAPIExampleBodyTable(body, headerPrefix) : body.type === 'application/json' || body.type === 'application/xml' ? this._renderAPIExampleBodyCodeBlock(body, headerPrefix) : this._renderAPIBodyDescription(body, headerPrefix)
              });
            }

            apiExample.request.bodyTitle = this._renderAPIBodyTitle(false, headerPrefix);

          }

          if ( example.request.headers ) apiExample.request.headers = this._renderAPIExampleHeaders(example.request.headers, false, headerPrefix);
          if ( example.request.cookies ) apiExample.request.cookies = this._renderAPIExampleCookies(example.request.cookies, false, headerPrefix);

        }

        if ( example.response ) {

          apiExample.response = {};

          if ( example.response.status ) apiExample.response.status = this._renderAPIStatus(example.response.status, headerPrefix);

          if ( example.response.body ) {

            apiExample.response.body = [];

            for ( const body of example.response.body ) {

              apiExample.response.body.push({
                type: body.type,
                value: body.type === 'multipart/form-data' || body.type === 'w-xxx-form-urlencoded' ? this._renderAPIExampleBodyTable(body, headerPrefix) : body.type === 'application/json' || body.type === 'application/xml' ? this._renderAPIExampleBodyCodeBlock(body, headerPrefix) : this._renderAPIBodyDescription(body, headerPrefix)
              });
            }

            apiExample.response.bodyTitle = this._renderAPIBodyTitle(true, headerPrefix);

          }

          if ( example.response.headers ) apiExample.response.headers = this._renderAPIExampleHeaders(example.response.headers, true, headerPrefix);
          if ( example.response.cookies ) apiExample.response.cookies = this._renderAPIExampleCookies(example.response.cookies, true, headerPrefix);

        }

        api.examples.push(apiExample);

      }

    }

    return api;

  }

  async compileSass(filename) {

    return await postcss([autoprefixer]).process(sass.renderSync({ file: filename }).css, { from: undefined });

  }

  urlFriendly(title, prefixes, separator) {

    let path = '';

    if ( prefixes ) {

      for ( const prefix of prefixes ) {

        path += this.urlFriendly(prefix) + (separator || '-');

      }

    }

    return path + title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  }

  renderHandlebars(source, data) {

    const template = Handlebars.compile(source);

    return template(data);

  }

  _renderAPIInfo(title, description, headerPrefix) {

    let md = '';

    if ( title ) md += `### ${title}\n\n`;
    if ( description ) md += `${description}\n\n---\n\n`;

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIPath(path, method, headerPrefix) {

    let md = '#### Path\n\n';

    if ( method ) md += `<span class="rest-method">${method.toUpperCase()}</span>`;
    if ( path ) md += `${path}\n\n`;

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAuth(auth, headerPrefix) {

    if ( ! auth.description ) return '';

    let md = '#### Authentication\n\n' + auth.description + '\n\n';

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIParameters(params, headerPrefix) {

    let md = '#### URL Parameters\n\n';

    md += this._renderTable({ name: 'Name', type: 'Type', description: 'Description' }, params, headerPrefix);

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIQueryParameters(queries, headerPrefix) {

    let md = '#### Query Parameters\n\n';

    md += this._renderTable({ name: 'Name', type: 'Type', required: 'Required', description: 'Description' }, queries, headerPrefix);

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIHeaders(headers, response, headerPrefix) {

    let md = `#### ${response ? 'Response ' : ''}Headers\n\n`;

    md += this._renderTable({ name: 'Name', description: 'Description' }, headers, headerPrefix);

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPICookies(cookies, response, headerPrefix) {

    let md = `#### ${response ? 'Response ' : ''}Cookies\n\n`;

    md += this._renderTable({ name: 'Name', description: 'Description' }, cookies, headerPrefix);

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderTable(headers, rows, headerPrefix) {

    const columns = _.keys(headers);
    const columnNames = _.values(headers);

    if ( this._options.hideEmptyColumns ) {

      for ( const column of _.keys(headers) ) {

        let hasColumn = false;

        for ( const row of rows ) {

          if ( row[column] ) hasColumn = true;

        }

        if ( ! hasColumn ) {

          let columnIndex = columns.indexOf(column);

          columns.splice(columnIndex, 1);
          columnNames.splice(columnIndex, 1);

        }

      }

      if ( ! columns.length ) return '';

    }

    let md = `|${columnNames.join('|')}|\n${'|:-'.repeat(columns.length)}|\n`;

    for ( const row of rows ) {

      md += '|';

      for ( const column of columns ) {

        md += `${row[column] === undefined ? '' : row[column]}|`;

      }

      md += '\n';

    }

    md += '\n';

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIBodyTitle(response, headerPrefix) {

    const md = `#### ${response ? 'Response ' : ''}Body\n\n`;

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIBodyCodeBlock(body, headerPrefix) {

    let md = '```' + (body.type === 'application/json' ? 'json' : 'xml') + '\n';

    if ( typeof body.model === 'object' ) {

      md += JSON.stringify(body.model, null, 2);

    }
    else {

      md += body.model;

    }

    md += '\n```\n\n';

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIBodyTable(body, headerPrefix) {

    return this._renderTable({ key: 'Key', type: 'Type', required: 'Required', description: 'Description' }, body.model, headerPrefix);

  }

  _renderAPIBodyDescription(body, headerPrefix) {

    const md = body.description + '\n\n';

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIStatus(status, headerPrefix) {

    let md = '#### Status\n\n';

    md += `<span class="server-status">${status}</span> ${this._getServerStatusMessage(status) || ''}\n\n`;

    return this.renderMarkdown(md, headerPrefix);

  }

  _getServerStatusMessage(code) {

    const codes = {
      "100": "Continue",
      "101": "Switching Protocols",
      "102": "Processing",
      "200": "OK",
      "201": "Created",
      "202": "Accepted",
      "203": "Non-Authoritative Information",
      "204": "No Content",
      "205": "Reset Content",
      "206": "Partial Content",
      "207": "Multi-Status",
      "208": "Already Reported",
      "226": "IM Used",
      "300": "Multiple Choices",
      "301": "Moved Permanently",
      "302": "Found",
      "303": "See Other",
      "304": "Not Modified",
      "305": "Use Proxy",
      "307": "Temporary Redirect",
      "308": "Permanent Redirect",
      "400": "Bad Request",
      "401": "Unauthorized",
      "402": "Payment Required",
      "403": "Forbidden",
      "404": "Not Found",
      "405": "Method Not Allowed",
      "406": "Not Acceptable",
      "407": "Proxy Authentication Required",
      "408": "Request Timeout",
      "409": "Conflict",
      "410": "Gone",
      "411": "Length Required",
      "412": "Precondition Failed",
      "413": "Request Entity Too Large",
      "414": "Request-URI Too Long",
      "415": "Unsupported Media Type",
      "416": "Requested Range Not Satisfiable",
      "417": "Expectation Failed",
      "418": "I'm a teapot",
      "420": "Enhance Your Calm",
      "422": "Unprocessable Entity",
      "423": "Locked",
      "424": "Failed Dependency",
      "425": "Reserved for WebDAV",
      "426": "Upgrade Required",
      "428": "Precondition Required",
      "429": "Too Many Requests",
      "431": "Request Header Fields Too Large",
      "444": "No Response",
      "449": "Retry With",
      "450": "Blocked by Windows Parental Controls",
      "451": "Unavailable For Legal Reasons",
      "499": "Client Closed Request",
      "500": "Internal Server Error",
      "501": "Not Implemented",
      "502": "Bad Gateway",
      "503": "Service Unavailable",
      "504": "Gateway Timeout",
      "505": "HTTP Version Not Supported",
      "506": "Variant Also Negotiates",
      "507": "Insufficient Storage",
      "508": "Loop Detected",
      "509": "Bandwidth Limit Exceeded",
      "510": "Not Extended",
      "511": "Network Authentication Required",
      "598": "Network read timeout error",
      "599": "Network connect timeout error"
    };

    return codes[code + ''];

  }

  _renderAPIExampleTitle(headerPrefix) {

    const md = '### Examples\n\n';

    return this.renderMarkdown(md, headerPrefix);

  }

  _renderAPIExampleBodyCodeBlock(body, headerPrefix) {

    return this._renderAPIBodyCodeBlock({
      type: body.type,
      model: body.value
    }, headerPrefix);

  }

  _renderAPIExampleBodyTable(body, headerPrefix) {

    const rows = [];

    for ( const key in body.value ) {

      rows.push({
        key: key,
        value: body.value[key]
      });

    }

    return this._renderTable({ key: 'Key', value: 'Value' }, rows, headerPrefix);

  }

  _renderAPIExampleHeaders(headers, response, headerPrefix) {

    let md = `#### ${response ? 'Response ' : ''}Headers\n\n`;
    const rows = [];

    for ( const key in headers ) {

      rows.push({
        name: key,
        value: headers[key]
      });

    }

    return this.renderMarkdown(md, headerPrefix) + this._renderTable({ name: 'Name', value: 'Value' }, rows, headerPrefix);

  }

  _renderAPIExampleCookies(cookies, response, headerPrefix) {

    let md = `#### ${response ? 'Response ' : ''}Cookies\n\n`;
    const rows = [];

    for ( const key in cookies ) {

      rows.push({
        name: key,
        value: cookies[key]
      });

    }

    return this.renderMarkdown(md, headerPrefix) + this._renderTable({ name: 'Name', value: 'Value' }, rows, headerPrefix);

  }

}

module.exports = Renderer;
