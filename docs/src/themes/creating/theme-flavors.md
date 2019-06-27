Theme flavors are partial SASS files containing variables that control the colors used inside the main stylesheet. These files must be created inside the `flavors` directory to be registered by Fluorite. Keep in mind that the name of each partial SASS file will be the name of the flavor.

It is also required to set `hasFlavors` and `defaultFlavors` properties to proper values in our theme config file.

When the documentation is being generated, Fluorite copies the selected flavor file to `/flavors/_final.scss` before transpiling the `styles.scss`. This means that we should always import `flavors/final` in `styles.scss` as the final determined flavor. This behavior is present to avoid bundling unnecessary CSS into the final stylesheet.

Since the flavors are already defined and imported into `styles.scss` and the configuration is done, we can define the variables we need for the flavors. Let's create our color palette using SASS maps and update the flavor files:

**/_palette.scss:**
```scss
$palette: (
  color-gray-darkest: #252930,
  color-gray-darker: #2e333a,
  color-gray-dark: #343a41,
  color-gray-light: #8d939b,
  color-gray-lighter: #d4d7de,
  color-gray-lightest: #edf0f5,
  color-white: #ffffff
);
```

**/flavors/_light.scss:**
```scss
@import '../palette';

$color-header-background: map-get($palette, color-gray-darker);
$color-header-title: map-get($palette, color-white);
$color-header-subtitle: map-get($palette, color-gray-light);
$color-background: map-get($palette, color-white);
$color-index-background: map-get($palette, color-gray-lightest);
$color-index-border: map-get($palette, color-gray-lighter);
$color-text: map-get($palette, color-gray-darker);
$color-text-header: map-get($palette, color-gray-darker);
$color-text-header-secondary: map-get($palette, color-gray-light);
```

**/flavors/_dark.scss:**
```scss
@import '../palette';

$color-header-background: map-get($palette, color-gray-darkest);
$color-header-title: map-get($palette, color-white);
$color-header-subtitle: map-get($palette, color-gray-light);
$color-background: map-get($palette, color-gray-dark);
$color-index-background: map-get($palette, color-gray-darker);
$color-index-border: map-get($palette, color-gray-darkest);
$color-text: map-get($palette, color-white);
$color-text-header: map-get($palette, color-white);
$color-text-header-secondary: map-get($palette, color-gray-light);
```

With the flavors set up, we can get to the main process, [templating]({{versionRootPrefix}}/themes/creating-a-new-theme/templating).
