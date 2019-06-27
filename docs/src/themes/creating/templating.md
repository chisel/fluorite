If you have followed the previous steps correctly, your theme directory should have the following structure:
```
fluorite-theme-plain/
├── css/
│   └── bootstrap.min.css
├── js/
│   ├── bootstrap.bundle.min.js
│   ├── comment-parser.js
│   ├── jquery-3.4.1.min.js
│   └── script.js
├── _palette.scss
├── config.json
├── hbs-helpers.js
├── hbs-partials.js
├── index.hbs
└── styles.scss
```

Before we start templating, we need to understand how Fluorite generates each page of our documentation and what data is available to our template. That's all covered in [template API]({{versionRootPrefix}}/api-reference/template-api).

Using the template API, we can finally start to create our template.

## Adding The Favicon

Insert the favicon user asset inside the head tag (replacing the scaffolded favicons):

**index.hbs:**
```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  {{! Set the page title }}
  <title>{{title}}</title>
  {{! Favicon }}
  {{#if extended.favicon-ico}}<link rel="shortcut icon" href="{{!rootPrefix}}{{extended.favicon-ico}}">{{/if}}
  {{! Load JQuery }}
  <script src="{{!rootPrefix}}/assets/theme/js/jquery-3.4.1.min.js"></script>
  {{! Load Bootstrap }}
  <link rel="stylesheet" href="{{!rootPrefix}}/assets/theme/css/bootstrap.min.css">
  <script src="{{!rootPrefix}}/assets/theme/js/bootstrap.bundle.min.js" charset="utf-8"></script>
  {{! Load theme's compiled SASS }}
  <link rel="stylesheet" href="{{!rootPrefix}}/assets/theme/styles.css">
</head>
```
`extended.favicon-ico` prefixed with `{{!rootPrefix}}` will link to the favicon file provided by the user inside `themeOptions`. If it was not provided, this line will be skipped.

## Creating The Header

Next, we'll create the header of the theme:

**index.hbs:**
```html
<body>
  <div class="header">
    <span class="title">{{title}}</span>
    {{#if extended.subtitle}}<span class="subtitle d-none d-md-block">{{extended.subtitle}}</span>{{/if}}
  </div>
</body>
```

**styles.scss:**
```scss
@import 'flavors/final';
@import url('https://fonts.googleapis.com/css?family=Ubuntu+Condensed&display=swap');

html,
body {
  height: 100%;
  margin: 0px;
  display: flex;
  flex-direction: column;
  font-family: 'Ubuntu Condensed', sans-serif;
}

body {
  background-color: $color-background;
  color: $color-text;
  display: flex;
  position: relative;
  font-size: 1.2rem;
}

.header {
  display: flex;
  width: 100%;
  padding: 30px 50px;
  font-size: 40px;
  background-color: $color-header-background;
  text-transform: uppercase;
  span.title {
    color: $color-header-title;
    margin-right: 20px;
  }
  span.subtitle {
    color: $color-header-subtitle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

## Adding The Index Pane

We're going to use the `sections` array of the template API to build our index pane. Add the following code to `index.hbs` body tag after the header:

**index.hbs:**
```html
<div class="container no-gutters p-0">
  <div class="row no-gutters">
    <div class="index col-md-4 d-none d-md-flex">
      {{#each sections}}
        <a href="{{link}}" class="section{{#if (isTopSection level)}} top{{/if}}" style="padding-left: {{getIndentation level}};">
          {{title}}
        </a>
      {{/each}}
    </div>
    <div class="col-12 col-md-8">

    </div>
  </div>
</div>
```

And the following styles:

**styles.scss:**
```scss
.container {
  min-height: calc(100% - 120px);
  min-width: 100%;
  .row {
    min-height: 100%;
  }
}

.index {
  background-color: $color-index-background;
  border-right: 1px solid $color-index-border;
  flex-direction: column;
  padding: 20px 0;
  max-width: 500px;
  .section {
    padding: 0 10px 0 40px;
    font-size: 28px;
    color: $color-text-header-secondary;
    &.top {
      margin-top: 20px;
      color: $color-text-header;
    }
  }
}
```

We have used two Handlebars helpers `isTopSection` and `getIndentation` to apply the `.top` class to the main sections and increase the indentation for nested sections. We'll register these helpers in the next section.

## Responsive Index Pane

So far the index pane looks good, but, it's hidden in the mobile view since we don't have enough room to show it side-by-side. We're going to add a menu icon, a secondary hidden index, and a script for toggling it. Let's start with the menu icon first. Update the header:

**index.hbs:**
```html
<div class="header">
  <svg xmlns="http://www.w3.org/2000/svg" class="menu-icon d-md-none" width="60" height="60" viewBox="0 0 24 24" onclick="toggleIndex()">
    <path fill="none" d="M0 0h24v24H0V0z"/>
    <path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/>
  </svg>
  <span class="title">{{title}}</span>
  {{#if extended.subtitle}}<span class="subtitle d-none d-md-block">{{extended.subtitle}}</span>{{/if}}
</div>
```

**styles.scss:**
```scss
svg.menu-icon {
  margin-right: 40px;
  path:nth-child(2) {
    fill: $color-header-title;
  }
}
```

Then, we'll render a second index under the `.container` that will be shown only when the icon is clicked:

**index.hbs:**
```html
<div id="indexMenu" class="index full-index d-flex d-md-none hide">
  {{#each sections}}
    <a href="{{link}}" class="section{{#if (isTopSection level)}} top{{/if}}" style="padding-left: {{getIndentation level}};">
      {{title}}
    </a>
  {{/each}}
</div>
```

**styles.scss:**
```scss
.full-index {
  max-width: 100%;
  border: none;
  width: 100%;
  min-height: 100%;
}

.hide {
  display: none !important;
}
```

Then add `id="hideOnMobile"` on `.container > .row` so the page content gets hidden when the menu is open.

Finally, we'll define the `toggleIndex()` method inside our theme script at `/js/script.js`:

**/js/script.js:**
```js
function toggleIndex() {

  document.getElementById('indexMenu').classList.toggle('hide');
  document.getElementById('hideOnMobile').classList.toggle('hide');

}
```

And load the script in the head tag:

**index.hbs:**
```html
{{! Load theme's script }}
<script src="{{!rootPrefix}}/assets/theme/js/script.js"></script>
```

## Inserting The Content

The final thing to do is to insert the rendered content. Update the second `div` under `.row` to the following code:

**index.hbs:**
```html
<div class="col-12 col-md-8 content">
  {{#each contents}}
    <h1 id="{{id}}">{{title}}</h1>
    <hr>
    {{#each content}}
      {{{value}}}
    {{/each}}
  {{/each}}
</div>
```

And add the style:

**styles.scss:**
```scss
.content {
  padding: 40px 60px !important;
}
```

## Result

You should end up with the following files:

**index.hbs:**
```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    {{! Set the page title }}
    <title>{{title}}</title>
    {{! Favicon }}
    {{#if extended.favicon-ico}}<link rel="shortcut icon" href="{{rootPrefix}}{{extended.favicon-ico}}">{{/if}}
    {{! Load JQuery }}
    <script src="{{rootPrefix}}/assets/theme/js/jquery-3.4.1.min.js"></script>
    {{! Load Bootstrap }}
    <link rel="stylesheet" href="{{rootPrefix}}/assets/theme/css/bootstrap.min.css">
    <script src="{{rootPrefix}}/assets/theme/js/bootstrap.bundle.min.js" charset="utf-8"></script>
    {{! Load theme's compiled SASS }}
    <link rel="stylesheet" href="{{rootPrefix}}/assets/theme/styles.css">
    {{! Load theme's script }}
    <script src="{{rootPrefix}}/assets/theme/js/script.js"></script>
  </head>
  <body>
    <div class="header">
      <svg xmlns="http://www.w3.org/2000/svg" class="menu-icon d-md-none" width="60" height="60" viewBox="0 0 24 24" onclick="toggleIndex()">
        <path fill="none" d="M0 0h24v24H0V0z"/>
        <path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/>
      </svg>
      <span class="title">{{title}}</span>
      {{#if extended.subtitle}}<span class="subtitle d-none d-md-block">{{extended.subtitle}}</span>{{/if}}
    </div>
    <div class="container no-gutters p-0">
      <div id="indexMenu" class="index full-index d-flex d-md-none hide">
        {{#each sections}}
          <a href="{{link}}" class="section{{#if (isTopSection level)}} top{{/if}}" style="padding-left: {{getIndentation level}};">
            {{title}}
          </a>
        {{/each}}
      </div>
      <div id="hideOnMobile" class="row no-gutters">
        <div class="index col-md-4 d-none d-md-flex">
          {{#each sections}}
            <a href="{{link}}" class="section{{#if (isTopSection level)}} top{{/if}}" style="padding-left: {{getIndentation level}};">
              {{title}}
            </a>
          {{/each}}
        </div>
        <div class="col-12 col-md-8 content">
          {{#each contents}}
            <h1 id="{{id}}">{{title}}</h1>
            <hr>
            {{#each content}}
              {{{value}}}
            {{/each}}
          {{/each}}
        </div>
      </div>
    </div>
  </body>
</html>
```

**styles.scss:**
```scss
@import 'flavors/final';
@import url('https://fonts.googleapis.com/css?family=Ubuntu+Condensed&display=swap');

html,
body {
  height: 100%;
  margin: 0px;
  display: flex;
  flex-direction: column;
  font-family: 'Ubuntu Condensed', sans-serif;
}

body {
  background-color: $color-background;
  color: $color-text;
  display: flex;
  position: relative;
  font-size: 1.2rem;
}

.header {
  display: flex;
  width: 100%;
  padding: 30px 50px;
  font-size: 40px;
  background-color: $color-header-background;
  text-transform: uppercase;
  span.title {
    color: $color-header-title;
    margin-right: 20px;
  }
  span.subtitle {
    color: $color-header-subtitle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.container {
  min-height: calc(100% - 120px);
  min-width: 100%;
  .row {
    min-height: 100%;
  }
}

.index {
  background-color: $color-index-background;
  border-right: 1px solid $color-index-border;
  flex-direction: column;
  padding: 20px 0;
  max-width: 500px;
  .section {
    padding: 0 10px 0 40px;
    font-size: 28px;
    color: $color-text-header-secondary;
    &.top {
      margin-top: 20px;
      color: $color-text-header;
    }
  }
}

svg.menu-icon {
  margin-right: 40px;
  path:nth-child(2) {
    fill: $color-header-title;
  }
}

.full-index {
  max-width: 100%;
  border: none;
  width: 100%;
  min-height: 100%;
}

.hide {
  display: none !important;
}

.content {
  padding: 40px 60px !important;
}
```

**/js/script.js:**
```js
function toggleIndex() {

  document.getElementById('indexMenu').classList.toggle('hide');
  document.getElementById('hideOnMobile').classList.toggle('hide');

}
```

In the [next section]({{versionRootPrefix}}/themes/creating-a-new-theme/helpers-and-partials) we'll register our Handlebars helpers.
