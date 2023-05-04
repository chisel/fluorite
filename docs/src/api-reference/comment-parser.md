The Comment Parser Utility is provided to all themes and helps implementing custom features based on parsing the comment tags inside markdown content. Read more about [theme-specific features]({{versionRootPrefix}}/themes/creating-a-new-theme/theme-specific-features).

The `CommentParser` class provides the following methods:
  - `register(name, type, action)`: Registers a new comment tag to process later. Arguments:
    - `name`: Comment tag name.
    - `type`: Tag type (either `block` or `single`).
    - `action`: Method to process the selected elements which takes the following arguments:
      - `nodes`: An array of nodes inside a block comment or a single node after a single comment.
      - `params`: The parameters passed into the comment (either a parsed array or a raw string depending on `rawParams` when parsing comments).
      - `self`: A reference to the single comment or the starting block comment nodes.
  - `processSelector(selector, skipCommentNodes, rawParams)`: Processes all elements selected by the given query selector. Arguments:
    - `selector`: A query selector targeting desired elements to process.
    - `skipCommentNodes`: Whether to ignore passing comment nodes to registered actions or not (defaults to true).
    - `rawParams`: Whether to pass in unprocessed parameters or a processed array of values.
  - `processNodes(nodes, skipCommentNodes, rawParams)`: Processes a list of nodes. Arguments:
    - `nodes`: An array or nodes (or iterable node list) to process.
    - `skipCommentNodes`: Whether to ignore passing comment nodes to registered actions or not (defaults to true).
    - `rawParams`: Whether to pass in unprocessed parameters or a processed array of values.