When you scaffold a new theme using the CLI, a utility library is created at `/js/comment-parser.js`. This library allows us to read the HTML comment nodes inside the rendered content and change the elements based on the comment syntax. Make sure to familiarize yourself with [Comment Parser's API]({{versionRootPrefix}}/api-reference/comment-parser-utility) before proceeding.

## Markdown Comments

The following type of comments can be used inside Markdown:

<!-- tab-group -->
<!-- tab: Single Comment -->
```markdown
<!-- single-comment: param1, param2, ... -->
Markdown paragraph
```
<!-- /tab -->
<!-- tab: Block Comment -->
```markdown
<!-- block-comment: param1, param2, ... -->
Multiple markdown content
[Link](#)
<!-- /block-comment -->
```
<!-- /tab -->
<!-- /tab-group -->

## Defining Comments

We want to register a block command named `responsive` which takes these arguments: `mobile`, `tablet`, and `desktop`. When used, all the content inside this block will be only shown on the specified views.

Let's load the comment parser library in our `index.hbs` (before the theme's script) and update `/js/script.js`:

<!-- tab-group -->
<!-- tab: index.hbs -->
```html
{{! Comment Parser Utility }}
<script src="{{!rootPrefix}}/assets/theme/js/comment-parser.js" charset="utf-8"></script>
```
<!-- /tab -->
<!-- tab: /js/script.js -->
```js
// On content loaded:
window.addEventListener('load', () => {

  // Instantiate CommentParser
  const comment = new CommentParser();

  // Register the 'responsive' block command
  comment.register('responsive', 'block', (nodes, params) => {

    // Iterate through each node
    for ( const node of nodes ) {

      if ( ! node.classList ) continue;

      // Get the computed CSS `display` or set to `block` as default
      const display = getComputedStyle(node).display || 'block';

      // Apply the Bootstrap responsive classes
      node.classList.add(`d-${params.includes('mobile') ? display : 'none'}`);
      node.classList.add(`d-sm-${params.includes('mobile') ? display : 'none'}`);
      node.classList.add(`d-md-${params.includes('tablet') ? display : 'none'}`);
      node.classList.add(`d-lg-${params.includes('desktop') ? display : 'none'}`);
      node.classList.add(`d-xl-${params.includes('desktop') ? display : 'none'}`);

    }

  });

  // Process the content container element
  comment.processSelector('.container .row .content');

});
```
<!-- /tab -->
<!-- /tab-group -->

## Result

At this point our theme takes responsive markdown through HTML comments. The following is a usage example:

```markdown
<!-- responsive: tablet, desktop -->
This paragraph will show up on tablet and desktop only.
<!-- /responsive -->
<!-- responsive: mobile -->
This paragraph will only show up on mobile.
<!-- /responsive -->
```

The theme is finally ready. We'll install it in the [next section]({{versionRootPrefix}}/themes/creating-a-new-theme/installation).
