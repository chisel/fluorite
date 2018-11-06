const express = require('express');
const _ = require('lodash');

class Server {

  constructor(options) {

    this._options = _.merge({
      port: 6001
    }, options || {});

  }

  get options() {

    return this._options;

  }

  serve(root, port) {

    return new Promise((resolve, reject) => {

      const app = express();

      app.use(express.static(root));

      app.listen(port || this._options.port, (error) => {

        if ( error ) return reject(error);

        resolve(port || this._options.port);

      });

    });

  }

}

module.exports = Server;
