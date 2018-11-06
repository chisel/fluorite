# Fluorite

Fluorite is an easy-to-use API documentation generator, built to allow rapid development of API documentations (RESTful and other types of APIs) while being flexible in design.

Fluorite encourages modular structures, therefore, the documentation is made of different modules glued together using a JSON configuration file (flconfig.json). Modules are either JSON files (for defining RESTful API routes) or pure Markdown (for other documentations), all loaded into one or more HTML pages to form the documentation.

# Installation

  - Make sure you have Node.js and NPM installed
  - Install Fluorite globally: `npm install @chisel/fluorite -g`

# Quick Start

  - Create a new project: `fl new <name>` (example `fl new docs`)
  - Inside the project directory run: `fl build`
  - Serve: `fl serve`
  - Visit `http://localhost:6001`

# Configuration

# Documentation Structure

# Themes

Several themes come installed with Fluorite, each providing a different layout with multiple flavors (dark, light, etc.). However, if none suits your needs, you can easily develop one using Handlebars.js for templating and SASS for creating configurable designs (aka flavors).
