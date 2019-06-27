Handlebars helpers should be defined inside the `hbs-helpers.js` file. The module exports a key pair value object where keys are helper names and values are functions. Let's register the helpers we used in the previous section inside our template:

**hbs-helpers.js:**
```js
module.exports = {

  getIndentation: (level) => `${40 + (level * 20)}px`,

  isTopSection: (level) => level === 0

};
```

We can also define Handlebars partials inside `hbs-partials.js`. This module exports a key pair value where keys are partial names and values are the partial string. The following is an example:

```js
module.exports = {

  partialName: '<div>Partial element.</div>'

};
```

Since our theme doesn't use any Handlebars partials, we can delete this file.

We'll define our theme's additional feature in the [next section]({{versionRootPrefix}}/themes/creating-a-new-theme/theme-specific-features): **Responsive Markdown**!
