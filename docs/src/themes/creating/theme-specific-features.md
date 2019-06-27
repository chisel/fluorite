When you scaffold a new theme using the CLI, a utility library is created at `/js/comment-parser.js`. This library allows us to read the HTML comment nodes inside the rendered content and change the elements based on the comment syntax.

## Markdown Comments

The following syntax is valid inside a Markdown file:

```markdown
<!-- singleElementCommand: arguments -->
Markdown paragraph
```

```markdown
<!-- blockCommand: arguments -->
Any number of markdown content
[Link](#)
<!-- /blockCommand -->
```

## Comment Parsing API

The comment parser library exposes the following API:
  - register(command, type, handler): Registers a command with a handler.
    - `command`: The command.
    - `type`: Either `single` or `block`.
    - `handler`: A callback to handle the elements. This callback will be called with two arguments: a single element (if type is `single`) or an array of elements (if type is `block`) and the provided arguments.
  - parse(container): Starts parsing all the elements inside the container, looking for comment nodes and calling registered commands' handlers.

## Defining Comments

We want to register a block command named `responsive` which takes three arguments: `mobile`, `tablet`, and `desktop`. When used, all the content inside this block will be only shown on the specified views. Let's load the comment parser library in our `index.hbs` (before the theme's script) and update `/js/script.js`:

**index.hbs:**
```html
{{! Comment Parser Utility }}
<script src="{{!rootPrefix}}/assets/theme/js/comment-parser.js" charset="utf-8"></script>
```

**/js/script.js:**
```js
// On content loaded:
window.addEventListener('load', () => {

  // Instantiate CommentParser
  const comment = new CommentParser();

  // Register the 'responsive' block command
  comment.register('responsive', 'block', (nodes, args) => {

    // Iterate through each node
    for ( const node of nodes ) {

      if ( ! node.classList ) continue;

      // Get the computed CSS `display` or set to `block` as default
      const display = getComputedStyle(node).display || 'block';

      // Apply the Bootstrap responsive classes
      node.classList.add(`d-${args.includes('mobile') ? display : 'none'}`);
      node.classList.add(`d-sm-${args.includes('mobile') ? display : 'none'}`);
      node.classList.add(`d-md-${args.includes('tablet') ? display : 'none'}`);
      node.classList.add(`d-lg-${args.includes('desktop') ? display : 'none'}`);
      node.classList.add(`d-xl-${args.includes('desktop') ? display : 'none'}`);

    }

  });

  // Parse the content container element
  comment.parse(document.querySelector('.container .row .content'));

});
```

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
