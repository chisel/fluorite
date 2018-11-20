The documentation content consists of JSON files (for REST API documentation) and Markdown (any type of documentation). These content files are presented as sections defined inside the configuration file.

## Sections

A section is a group of content files defined inside the `flconfig.json` file. Each section can contain one or more content files and any number of sub sections. At least one content file must be defined inside each section along with a title of that section.

### Example section definition

**flconfig.json**
```json
{
  "blueprint": [
    { "title": "Section 1", "content": ["docs/section1-1.md", "docs/section2-1.json"] }
  ]
}
```
