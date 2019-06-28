The configuration is done by a JSON file called `flconfig.json` which usually sits at the project root. The first and the most important part of it is the blueprint.

## Blueprint

The blueprint is an array of section objects which indicate the documentation structure. A section object can have the following properties:

  - `required` **title**: A string containing the title of the section.
  - `required` **content**: The path or an array of paths (relative to `flconfig.json`) to Markdown or JSON files which should be used as the section content.
  - `optional` **version**: The version of the section, either the exact version or a semantic version notation (e.g. `<1.0.0`, `<=1.0.0`, `>1.0.0`, `>=1.0.0`, or `*` to include in all versions.) Defaults to `*`.
  - `optional` **sub**: An array of section objects to define as the sub-sections of the current section.

### Blueprint Example

```json
{
  "blueprint": [
    { "title": "Section 1", "content": "docs/section1.md" },
    { "title": "Section 2", "content": "docs/section2.md", "sub": [
      { "title": "Section 2.1", "content": "docs/section2-1.md" },
      { "title": "Section 2.2", "content": "docs/section2-2-deprecated.md", "version": "<1.0.0" },
      { "title": "Section 2.2", "content": "docs/section2-2.md", "version": ">=1.0.0" }
    ]}
  ]
}
```

## Options

The following properties are defined on the root level of the configuration file, siblings of the `blueprint` property:

  - `required` **title**: The title of the documentation.
  - `optional` **basePath**: Like cwd, a base path for all the content paths (relative to `flconfig.json`). This path will be prepended to all content paths (including content assets) except for the paths inside theme options.
  - `optional` **rootContent**: A path to a Markdown or JSON content file to use as the root content (only required when `rendererOptions.multiPage` is `true` and ignored if `false`).
  - `optional` **contentAssets**: An object containing the declaration of content assets (e.g. images used inside the Markdown file.) Keys are paths to the files or directories containing the assets (relative to `flconfig.json`) and values are paths to directories or filenames where the content should be copied to (relative to `/assets/contents/` at the generated documentation root.) [Learn more about declaring and using content assets]({{versionRootPrefix}}/contents/assets/).
  - `required` **outputDir**: The path of the output directory where the generated documentation should reside at relative to `flconfig.json`.
  - `optional` **exclusions**: An array of filenames to exclude from deletion inside the output directory (all hidden files or directories that start with `.` are excluded by default.)
  - `optional` **rendererOptions**: Namespace for renderer options.
    - `optional` **theme**: The name of an installed theme to use. Defaults to `onyx`.
    - `optional` **flavor**: The name of the theme flavor (if any) to use. Defaults to the selected theme's default flavor.
    - `optional` **multiPage**: A boolean indicating if the documentation should be broken down into multiple pages for each section (and sub sections) or should be all generated in one single page. Defaults to `false`. [Learn more about the output structure]({{versionRootPrefix}}/project-structure#project-structure-output-directory).
    - `optional` **versions**: An array of strings defining the versions of the documentation. Each version will only contain the sections which have defined a target version. Defaults to `*` for all sections. [Learn more about versioning]({{versionRootPrefix}}/contents#versioning).
    - `optional` **hideEmptyColumns**: A boolean indicating if empty columns of tables generated from JSON files for REST APIs should be hidden. Defaults to `false`.
    - `optional` **rootVersionLinksOnly**: A boolean indicating if links generated for each version of the documentation at each section page should be only linked to the root of a different version or be linked to the same section of a different version if possible (Fluorite will try to locate the section on the other versions based on the blueprint structure, but a match is not guaranteed.) Will be ignored if `multiPage` is `false` and/or if there are no more than one versions defined. Defaults to `false`.
    - `optional` **minifyJS**: A boolean indicating if the theme's JavaScript assets should be minified or not (will ignore any assets with the `.min.js` extension.) Defaults to `true`.
    - `optional` **minifyCSS**: A boolean indicating if the theme's CSS assets should be minified or not (will ignore any assets with the `.min.css` extension.) Defaults to `true`.
  - `optional` **themeOptions**: A namespace for any configuration that the selected theme has defined as an extension to the `flconfig.json` (e.g. favicons, logos, etc.)
  - `optional` **serverOptions**: A namespace for the server options.
    - `optional` **port**: The port number on which the generated documentation should be served. Defaults to `6001`.

### Example

Directory structure:
```
flconfig.json
src/
  assets/
    contents/
      images/
        logo-on-section1.jpg
    theme/
      favicon.png
  section1.md
  rest-api.json
  welcome.md
```

flconfig.json:
```json
{
  "title": "My Documentation",
  "basePath": "src",
  "rootContent": "welcome.md",
  "contentAssets": {
    "assets/contents/images": "images"
  },
  "blueprint": [
    { "title": "Section 1", "content": "section1.md", "version": "0.5.2" },
    { "title": "Section 1", "content": ["section1.md", "rest-api.json"], "version": ">=1.0.0" }
  ],
  "rendererOptions": {
    "theme": "my-personal-theme",
    "multiPage": true,
    "versions": [
      "0.5.2",
      "1.0.0"
    ]
  },
  "themeOptions": {
    "favicon": "src/assets/theme/favicon.png"
  },
  "serverOptions": {
    "port": 6002
  }
}
```
