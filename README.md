# Fluorite

Fluorite is an easy-to-use API documentation generator built to rapidly create a single-page documentation for RESTful API (or any other type of documentation) while being flexible in design.

Fluorite encourages modular structures, therefore, the documentation is made of different modules glued together using a JSON configuration file (called the skeleton). Modules are either JSON files (for defining RESTful API routes) or pure Markdown (for other documentations), all loaded into one HTML page to form the documentation.

# Installation

  - Make sure you have Node.js and NPM installed
  - Clone this repo inside a terminal: `git clone git@github.com:chisel/fluorite.git`
  - cd into the cloned repo: `cd fluorite`
  - Install dependencies: `npm install`

# Building

  - Build the documentation: `npm run build`
  - Serve: `npm run serve`
  - Visit `http://localhost:6001`
