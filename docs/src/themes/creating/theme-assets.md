Theme assets are files that are referenced inside our main `index.hbs` file, therefore, must be copied over to the final generated directories.

Since we want to use Bootstrap to make our theme responsive, we need to do a few things:
  1. Head over to [Bootstrap's download page](https://getbootstrap.com/docs/4.3/getting-started/download/) and download the minified CSS and JS files.
  2. Unzip the file and copy `/js/bootstrap.bundle.min.js` to the `js` directory of our theme.
  3. Create a folder named `css` in our theme root directory and copy `/css/bootstrap.min.css` into it.
  4. Add the `css` directory in `assets` array inside `config.json` to declare the `css` directory as a theme asset.
  5. [Download JQuery](https://jquery.com/download/) and copy `jquery-3.4.1.min.js` to the `js` directory (your JQuery version might be different.)

All theme assets will be copied to the `/assets/theme` directory at the root of the documentation, therefore, all links inside `index.hbs` must be referenced by `{{!rootPrefix}}/assets/theme/` followed by the desired path. With that in mind, let's load Bootstrap and JQuery inside `index.hbs`'s head tag:

```html
...
{{#if extended.theme-color}}<meta name="theme-color" content="{{extended.theme-color}}">{{/if}}

{{! Load JQuery }}
<script src="{{!rootPrefix}}/assets/theme/jquery-3.4.1.min.js"></script>

{{! Load Bootstrap }}
<link rel="stylesheet" href="{{!rootPrefix}}/assets/theme/css/bootstrap.min.css">
<script src="{{!rootPrefix}}/assets/theme/js/bootstrap.bundle.min.js" charset="utf-8"></script>

{{! Load theme's compiled SASS }}
<link rel="stylesheet" href="{{!rootPrefix}}/assets/theme/styles.css">
...
```

Just like with the markdown content, there are two variables available to `index.hbs`:
  - `{{!rootPrefix}}`: Used for prefixing all links to the root directory of the documentation.
  - `{{!versionRootPrefix}}`: Used for prefixing all links to the root directory of the current version of the documentation.

Since both theme assets and user assets are copied to the root directory and are shared in all versions of the documentation, we should use `{{!rootPrefix}}` whenever we're referencing any of them.

## User Assets

Themes can extend the Fluorite configuration through `themeOptions`. Normally, any data the user defines under `themeOptions` will be passed to the template API as the `extended` object (which will be covered soon), but in some cases themes may want to let the user input some files (favicon, manifest, etc.) which needs some special handling. Since those files need to be copied into the generated documentation, we can declare those `themeOptions` extensions as user assets inside our theme configuration file.

Replace the `userAssets` object in `config.json` with the following values:
```json
{
  "favicon-ico": "images/"
}
```

The above configuration tells Fluorite to copy the file provided in `flconfig.json`'s `themeOptions['favicon-ico']` to the `/assets/user/images` directory. We can access this file through the template API's `extended['favicon-ico']` inside our Handlebars template.

Your final theme config should look like the following:

**config.json:**
```json
{
  "hasFlavors": true,
  "defaultFlavor": "light",
  "assets": [
    "js",
    "css"
  ],
  "userAssets": {
    "favicon-ico": "images/"
  }
}
```

In the [next section]({{versionRootPrefix}}/themes/creating-a-new-theme/theme-flavors) we'll take a look at our theme's flavors.
