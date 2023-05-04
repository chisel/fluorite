The theme you're looking at right now is Elegance! This theme is responsive, provides accent color customization through [theme options](#theme-options), and allows writing [responsive Markdown](#responsive-markdown).

<!-- responsive: tablet, desktop -->
![Elegance Preview]({{rootPrefix}}/assets/contents/elegance-desktop.png)
<!-- /responsive -->

<!-- responsive: mobile -->
![Elegance Preview Mobile]({{rootPrefix}}/assets/contents/elegance-mobile.png)
<!-- /responsive -->

## Theme Options

The following properties can be used in the `themeOptions` of `flconfig.json` (all of which are optional):

  - **brandName**: If provided, it would be used at the top of the header and the project title would be shown under it instead.
  - **icon**: A path to an image used as the brand logo/icon.
  - **favicon**: The path to a favicon in `.ico` format.
  - **rootName**: If provided, an item with this name would be added in the navigation menu which links to the root content.
  - **hideProgressBar**: If true, the scroll progress bar would be hidden.
  - **noSectionTitles**: If true, section title of Markdown documents won't be inserted at the beginning of the section.
  - **accentColor**: A CSS color to use as the accent color (e.g. `#FF5353`, `red`, `rgb(255, 83, 83)`).
  - **accentColorSecondary**: A CSS color to use as the secondary accent color (e.g. `#FF246B`, `pink`, `rgb(255, 36, 107)`).
  - **lottie**: If true, lottie would be loaded in the documentation.

## Theme Specific Features

The Elegance theme uses the [Comment Parser Utility]({{rootPrefix}}/assets/contents/utilities/comment-parser.js) to provide comment-based features for markdown files.

### Responsive Markdown

You can make parts of your markdown content responsive by using the following HTML comment: `<!-- responsive: mobile, tablet, desktop -->` to start a responsive block and `<!-- /responsive -->` to end the block. Any content inside the block will become responsive based on the arguments provided (`mobile`, `tablet`, or `desktop`).

**Example:**
```markdown
This is a markdown document.

<!-- responsive: mobile, tablet -->
This paragraph only shows up in mobile and tablet devices.
<!-- /responsive -->

<!-- responsive: desktop -->
This paragraph only shows up in desktops.
<!-- /responsive -->
```
