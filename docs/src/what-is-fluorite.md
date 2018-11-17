Fluorite is a documentation tool based on Markdown and JSON objects. Using Fluorite, you can create stunning looking HTML documentations at ease.

## Why?

Because every documentation tool out there is either too hard/complex to work with or limited to a specific design and layout. In order to generate the desired documentation, one must choose a tool based on its output layout and design while surrendering to its limitations and complexities, and edit the hell out of the generated HTML to look somewhat similar to what was intended for it to look like. But...

Fluorite is designed to be as flexible as possible, meaning it is not limited to **any** design or layout. Powered by Handlebars templating language, Fluorite themes are the ones who decide what the generated HTML would look like. They can even introduce new features using techniques such as parsing HTML comments inside the documentation content to interpret parts of it differently. Such behaviors are present in the themes that come pre-installed on Fluorite. For example, the right pane feature of the Onyx theme is completely based on HTML comments inside the Markdown content and independent from any Fluorite mechanism.

The other problem is that if we intend the generated documentation to look exactly like the website we already have built, using other documentation tools require editing the output which can be a time consuming task and might not even resemble the desired look in the end! Since Fluorite themes are flexible, one can easily create a new theme by just building **one single HTML page** (often reuse most of the already-built HTML and CSS of their website) and achieve the **exact** desired look. With this ability, your documentation pages are never bound to look different than the design of your website.

## How Does It Work?

Fluorite defines the documentation content as different sections. Each section may contain one or more content files written in Markdown and/or JSON (for REST API only) and may contain sub-sections. These sections together form the blueprint of your documentation (defined in a configuration file).

With that in mind, in order to generate the documentation we can adopt the following workflow:
  1. Write all the documentation content in Markdown and JSON
  2. Define the blueprint by grouping our contents into sections
  3. Use a theme or make our own
  4. Generate the documentation

The next section gives you a taste of Fluorite by demonstrating a quick way to generate some documentation.

---

### Technologies Used

  - [Marked](https://github.com/markedjs/marked) for parsing Markdown
  - [Handlebars](https://handlebarsjs.com/) for HTML templating
  - [SASS](https://sass-lang.com/) for CSS preprocessing
  - [Prism.js](https://prismjs.com/) for syntax highlighting
  - [Autoprefixer](https://github.com/postcss/autoprefixer) for vendor-prefixing CSS
  - [Uglify ES](https://github.com/mishoo/UglifyJS2/tree/harmony) for minifying JS
  - [Clean CSS](https://github.com/jakubpawlowicz/clean-css) for minifying CSS
