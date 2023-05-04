Sometimes we need to include images, videos, or any other media files inside our Markdown documentation. Since the output HTML of a Fluorite project can have different structures based on the configuration (single page or multipage), and the resulting HTML can be hosted on a server at different directory levels, linking to assets one-way might not work with all the various setups. An absolute path and a relative path both can't single handedly solve this problem, since:
  - An absolute path to the root must be changed manually when the documentation is moved to a different directory level.
  - A relative path will only work if we know what directory level each documentation file is at, and that can change based on the blueprint and the renderer options.

To overcome this problem, Fluorite provides two variables for both Markdown and JSON files:
  - `{{!rootPrefix}}`: A relative path to the root of the project generated for each documentation file considering its current directory level.
  - `{{!versionRootPrefix}}`: A relative path to the root of the current version for each documentation file considering its current directory level.

And allows all assets to be declared inside the `flconfig.json` file. All assets will be copied to `/assets/contents` at the root of the generated documentation. To declare assets, add a property to `contentAssets` with the format `"path-to-source-file-relative-to-basePath-or-flconfig": "path-to-destination-file-relative-to-/assets/contents"`.

With that in mind, we can declare all of our asset files inside the configuration file as below:

**src**
```
/src
  /assets
    /contents
      image.jpg
  markdown-with-assets.md
  index.md
```

**flconfig.json**
```json
{
  "basePath": "src",
  "outputDir": "dist",
  "rootContent": "index.md",
  "contentAssets": {
    "assets/contents": "/"
  },
  "blueprint": [
    { "title": "Section 1", "content": "markdown-with-assets.md", "version": "1.0.0" }
  ],
  "rendererOptions": {
    "multipage": true,
    "versions": ["0.0.5", "1.0.0"]
  }
}
```

**markdown-with-assets.md**
```markdown
This is an image:
![Alt]({{!rootPrefix}}/assets/contents/image.jpg)
```

**generated files**
```
/dist
  /assets
    /contents
      image.jpg
  /0.0.5
    index.html
  /1.0.0
    index.html
    /section-1
      index.html
```

**generated path inside /dist/1.0.0/section-1/index.html**
```html
<img src="../../assets/contents/image.jpg">
```

## Linking To Other Sections

When we are generating a single page documentation, linking to other sections of the documentation is easy. We would use anchors considering the fact that any section's anchor is prefixed with its parents' names. For instance, if we have the following blueprint:

```json
{
  "blueprint": [
    { "title": "Section 1", "content": "section1.md", "sub": [
      { "title": "Section 1-1", "content": "section1-1.md" }
    ]},
    { "title": "Section 2", "content": "section2.md" }
  ]
}
```

We can link to Section 1-1 from Section 2 using the `#section-1-section-1-1` anchor.

Considering the same blueprint but in a multipage documentation, since each section will have its own page, we can link from Section 2 to Section 1-1 using the `{{!versionRootPrefix}}` variable to link to the same version:

```markdown
This is Section 2. Visit [Section 1-1]({{!versionRootPrefix}}/section-1/section-1-1).
```

## Escaping

If for whatever reason you need to escape those two variables, you can insert `!` at the beginning of the variables (that's how we have escaped those variables on this page!)
