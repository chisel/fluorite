The theme configuration file `config.json` is used to define some theme behaviors.

```json
{
  "hasFlavors": true,
  "defaultFlavor": "dark",
  "assets": ["js"],
  "userAssets": {
    "favicon-ico": "images/",
    "favicon-16x16": "images/",
    "favicon-32x32": "images/",
    "favicon-70x70": "images/",
    "favicon-144x144": "images/",
    "favicon-150x150": "images/",
    "favicon-310x150": "images/",
    "favicon-310x310": "images/",
    "favicon-180x180": "images/",
    "favicon-192x192": "images/",
    "favicon-512x512": "images/",
    "manifest": "images/",
    "mask-icon": "images/",
    "msapplication-config": "images/"
  }
}
```

Let's take a look at each property:
  - **hasFlavors**: A boolean indicating the theme has flavors.
  - **defaultFlavor**: The name of the default flavor.
  - **assets**: An array of files and directories declaring theme assets that need to be copied over.
  - **userAssets**: User assets declaration object. We'll cover this in the next sections.

We'll change the `defaultFlavor` to `light` and that would make the configuration good for now. We'll come back to change a few stuffs later in the next sections.

Next, we should learn about [theme assets declaration]({{versionRootPrefix}}/themes/creating-a-new-theme/theme-assets).
