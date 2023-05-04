The documentation content consists of JSON/YAML files for documenting REST APIs and Markdown files for any other types of documentation. These content files are presented as sections defined inside the configuration file and can be bundled together.

## Sections

A section is a group of content files defined inside the `flconfig.json` file. Each section can contain one or more content files and any number of sub sections. At least one content file must be defined inside each section along with a title for that section.

### Example Section Definition

<!-- tab-group -->
<!-- tab: flconfig.json -->
```json
{
  "blueprint": [
    { "title": "Section 1", "content": ["docs/doc1.md", "docs/api1.json"] }
  ]
}
```
<!-- /tab -->
<!-- tab: flconfig.yaml -->
```yaml
blueprint:
  - title: Section 1
    content:
      - docs/doc1.md
      - docs/api1.json
```
<!-- /tab -->
<!-- /tab-group -->

## Versioning

Each section can target a direct version or a range of versions using the `version` property of their definition object. This allows them to be included or excluded in specific versions of the generated documentation.

To target a specific version, write the exact version as the value of the `version` property. You can also target multiple versions by passing an array of versions.

To target a range of versions for a section, you can use any of the following combinations:
  - Use any of `>`, `<`, `>=`, and `<=` at the start of a version to define a range (e.g. `<=3.0.0`, `>1.4.0`).
  - Use `x` to match any number in the version segment (e.g. `1.x`, `1.5.x`).
  - Use multiple versions (an array of strings) with matching notations to define a strict range (e.g. `version: ['>=1.0.0', '<3.5.0']`)

> If the version property is missing on a section definition, that section will be included in all versions of the documentation.

> The ranged targeting only supports semantic versions and might not work with any other versioning systems.

You can define which versions of the documentation should be generated at `rendererOptions.versions`.

### Example Section Definition With Versioning

<!-- tab-group -->
<!-- tab: flconfig.json -->
```json
{
  "blueprint": [
    { "title": "Section 1", "content": ["docs/doc1-v4.md", "docs/api1.json"], "version": "4.x" },
    { "title": "Section 1", "content": ["docs/doc1.md", "docs/api1.json"], "version": [">=1", "<4"] },
    { "title": "Section 1", "content": "docs/doc1.md", "version": "<1.0.0" }
  ],
  "rendererOptions": {
    "versions": ["0.0.5", "1.0.2", "2.3.9", "3.1.12", "4.0.2"]
  }
}
```
<!-- /tab -->
<!-- tab: flconfig.yaml -->
```yaml
blueprint:
  - title: Section 1
    content: 
      - docs/doc1.md
      - docs/api1.json
    version: "4.x"
  - title: Section 1
    content:
      - docs/doc1.md
      - docs/api1.json
    version:
      - ">=1"
      - "<4"
  - title: Section 1
    content: docs/doc1.md
    version: "<1.0.0"
rendererOptions:
  versions:
    - "0.0.5"
    - "1.0.2"
    - "2.3.9"
    - "3.1.12"
    - "4.0.2"
```
<!-- /tab -->
<!-- /tab-group -->