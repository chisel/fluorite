The documentation content consists of JSON files for documenting REST APIs and Markdown files for any other types of documentation. These content files are presented as sections defined inside the configuration file and can be bundled together.

## Sections

A section is a group of content files defined inside the `flconfig.json` file. Each section can contain one or more content files and any number of sub sections. At least one content file must be defined inside each section along with a title for that section.

### Example Section Definition

**flconfig.json**
```json
{
  "blueprint": [
    { "title": "Section 1", "content": ["docs/doc1.md", "docs/api1.json"] }
  ]
}
```

## Versioning

Each section can target a direct version or a range of versions using the `version` property of their definition object. This allows them to be included or excluded in specific versions of the generated documentation. To target a specific version, write the exact version as the value of the `version` property, and to target a range of versions, use one of the following notations at the beginning of the version: `<`, `<=`, `>`, and `=>`.

> If the version property is missing on a section definition, that section will be included in all versions of the documentation.

> The ranged targeting only supports semantic versions and might not work with any other versioning systems.

You can define which versions of the documentation should be generated at `rendererOptions.versions`.

### Example Section Definition With Versioning

**flconfig.json**
```json
{
  "blueprint": [
    { "title": "Section 1", "content": ["docs/doc1.md", "docs/api1.json"], "version": ">=1.0.0" },
    { "title": "Section 1", "content": "docs/doc1.md", "version": "<1.0.0" }
  ],
  "rendererOptions": {
    "versions": ["0.0.5", "1.0.2"]
  }
}
```
