class CommentParser {

  _registry = {};

  /**
   * Registers a new comment tag to process later
   * @param {string} name Comment tag name
   * @param {string} type Tag type (either 'block' or 'single')
   * @param {string} action Method to process the selected elements
   */
  register(name, type, action) {

    this._registry[name] = { type, action };

  }

  /**
   * Processes all elements selected by the given query selector
   * @param {string} selector A query selector targeting desired elements to process
   * @param {boolean} skipCommentNodes Whether to ignore passing comment nodes to registered actions or not (defaults to true)
   * @param {boolean} rawParams Whether to pass in unprocessed parameters or a processed array of values
   */
  processSelector(selector, skipCommentNodes = true, rawParams = false) {

    for ( const element of document.querySelectorAll(selector) ) {

      this.processNodes(element.childNodes, skipCommentNodes, rawParams);

    }

  }

  /**
   * Processes a list of nodes
   * @param {Node[]} nodes An array or nodes (or iterable node list) to process
   * @param {boolean} skipCommentNodes Whether to ignore passing comment nodes to registered actions or not (defaults to true)
   * @param {boolean} rawParams Whether to pass in unprocessed parameters or a processed array of values
   */
  processNodes(nodes, skipCommentNodes = true, rawParams = false) {

    // Polyfills
    if ( ! Node ) Node = {};
    if ( ! Node.COMMENT_NODE ) Node.COMMENT_NODE = 8;

    let selection = [];
    let selectingParams;
    let selectingName;

    for ( const node of nodes ) {

      // If node is comment
      if ( node.nodeType === Node.COMMENT_NODE ) {

        // Detect name and params from comment node
        let name = node.data.trim().match(/([\/a-z0-9-_]+)(:\s*(.+,?)+)?/i);
        let params = [];
        let closing = false;

        // If no name detected
        if ( ! name ) {

          // If currently selecting elements for an open block comment and not skipping comment nodes, add node to selection
          if ( selectingName && ! skipCommentNodes )
            selection.push(node);
          
          // Skip further processing
          continue;

        }

        // If has params
        if ( name[3] ) {

          if ( ! rawParams )
            params = name[3].replace(/\s+/g, '').split(',');
          else
            params = name[3];

        }

        // Adjust name
        name = name[1].trim();

        // Detect closing tag
        if ( name.substr(0, 1) === '/' ) {

          // Set flag
          closing = true;
          // Re-adjust name
          name = name.slice(1);

        }

        const comment = this._registry[name];

        // If tag is not registered
        if ( ! comment ) {

          // If currently selecting elements for an open block comment and not skipping comment nodes, add node to selection
          if ( selectingName && ! skipCommentNodes )
            selection.push(node);
          
          // Skip further processing
          continue;

        }

        // If single tag
        if ( comment.type === 'single' ) {

          // Run the registered comment action method
          comment.action(node.nextElementSibling, params, node);

        }
        // If block tag
        else if ( comment.type === 'block' ) {

          // If this is a closing tag and already processing inside its block
          if ( closing && selectingName === name ) {

            // Run the registered comment action method
            comment.action(selection, selectingParams, node);

            // Reset selection
            selectingName = null;
            selectingParams = null;
            selection = [];

            // Skip further processing
            continue;

          }

          // Start block mode
          selectingName = name;
          selectingParams = params;

        }

      }
      // If not comment node
      else {

        // If currently selecting elements for an open block comment, add node to selection
        if ( selectingName ) selection.push(node);

      }

    }

  }

}