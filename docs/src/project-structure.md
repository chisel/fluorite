A Fluorite project has the following possible components:

  - **flconfig.json**: The configuration file dictating how the documentation should be generated.
  - **Contents**: Content files are declared inside the configuration file and can be placed anywhere (even outside of the project directory). Though, they're typically placed in the `src` directory.
    - **Markdown**: `.md` files which contain sections of the documentation.
    - **Markdown Assets**: Any assets for the Markdown documentation which are referenced inside the documentation and declared inside the configuration file (usually images). These files will be copied to the content assets directory upon generating the documentation. [Learn how to use content assets]({{versionRootPrefix}}/contents/assets).
    - **REST API**: JSON files which document REST APIs.
    - **API Assets**: Any external files that are referenced in a REST API documentation (XML or JSON data models.)
  - **Theme Assets**: Files that are copied to the theme assets directory upon generating the documentation, declared in the configuration file (e.g. favicons, logos, etc.)

A typical Fluorite project directory structure:

```
flconfig.json
src/
  assets/
    theme/
      favicon.png
      logo.svg
    contents/
      image1.jpg
      image2.jpg
  section1.md
  section2.md
  api1.json
  api2.json
```

> The `flconfig.json` file does not have to be placed at the project root since the CLI has the option to provide a custom path, overriding the default behavior of looking for configuration files at the project root.

## Output Directory

The output directory is defined inside the configuration file and can have four possible directory structures based on the project settings.

> The output directory structure is usually not of significant importance, unless you are creating a theme from scratch.

Assuming the example above as the content files, the following is all the possible directory structures:

**Single page with one version**
```
dist/
  index.html
  assets/
    theme/
      styles.css
      images/
        favicon.png
        logo.svg
    contents/
      image1.jpg
      image2.jpg
```

**Single page with versions 1.0.0, 1.2.0, and all**
```
dist/
  all/
    index.html
  1.0.0/
    index.html
  1.2.0/
    index.html
  assets/
    theme/
      styles.css
      images/
        favicon.png
        logo.svg
    contents/
      image1.jpg
      image2.jpg
```

**Multipage with one version**
```
dist/
  index.html
  section1/
    index.html
  section2/
    index.html
  assets/
    theme/
      styles.css
      images/
        favicon.png
        logo.svg
    contents/
      image1.jpg
      image2.jpg
```

**Multipage with versions 1.0.0, 1.2.0, and all**
```
dist/
  all/
    index.html
    section1/
      index.html
    section2/
      index.html
  1.0.0/
    index.html
    section1/
      index.html
    section2/
      index.html
  1.2.0/
    index.html
    section1/
      index.html
    section2/
      index.html
  assets/
    theme/
      styles.css
      images/
        favicon.png
        logo.svg
    contents/
      image1.jpg
      image2.jpg
```

> The placement of theme assets are decided by the theme itself. The following example uses the placement of the pre-installed theme Onyx.
