You can build and serve the documentation through the Node.js API, which can be useful if you need to integrate these operations into your build process using task runners. However, theme management, scaffolding, and watching the files are only possible through the CLI.

## Local Installation

```
npm install @chisel/fluorite
```

**CommonJS Module:**
```js
const Fluorite = require('fluorite');
const fl = new Fluorite();

fl.load('path/to/flconfig.json');
```

**ES Module/TypeScript:**
```ts
import Fluorite from 'fluorite';
const fl = new Fluorite();

fl.load('path/to/flconfig.json');
```

## API

  - `fl.load(configPath)`: Loads Fluorite and the config file. Returns a reference to the Fluorite object for chaining.
  - `fl.generate()`: Starts building the docs. Returns a promise.
  - `fl.serve(port)`: Serves the generated docs on the specified port. Returns a promise.
  - `fl.on(eventName, callback)`: Registers an event handler. Returns a reference to the Fluorite object for chaining.
  - `fl.config`: Returns the loaded `flconfig.json` object.
  - `fl.options`: Returns an object with these properties:
    - `basePath`: The path prefix where the `flconfig.json` is located.
    - `themeConfig`: The theme configuration object.

### Events

The following events may occur during the Fluorite lifecycle:
  - `ready`: Occurs when Fluorite finishes loading all the necessary components.
  - `update`: Occurs whenever the state of Fluorite changes. Calls the callback with a string message describing the update.
  - `error`: Occurs when an error is thrown. Calls the callback with an error object.
  - `finished`: Occurs when Fluorite has finished generating the docs. Calls the callback with an array of warning messages (if any).
  - `served`: Occurs when Fluorite starts to serve the docs. Calls the callback with the output directory path and the port number.

### Usage Example

**Building the docs and serving them on port 6001:**
```js
const Fluorite = require('fluorite');
const fl = new Fluorite();
const configPath = 'path/to/config';

fl.load(configPath)
.on('ready', () => fl.generate())
.on('finished', () => fl.serve(6001))
.on('served', () => console.log('Serving the docs at localhost:6001'))
.on('error', error => console.log(error));
```
