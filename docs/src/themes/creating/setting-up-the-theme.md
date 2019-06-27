The first step is to scaffold a new theme using the CLI. We're going to name the theme "plain":
```
fl theme new plain
```

This will create the directory `fluorite-theme-plain` which will contain the following files:
```
fluorite-theme-plain/
├── flavors/
│   ├── _dark.scss
│   └── _light.scss
├── js/
│   ├── comment-parser.js
│   └── script.js
├── config.json
├── hbs-helpers.js
├── hbs-partials.js
├── index.hbs
└── styles.scss
```

We'll cover all those files in the next sections, but for now, our theme's structure is ready.

Next step is to [configure the theme]({{versionRootPrefix}}/themes/creating-a-new-theme/theme-configuration).
