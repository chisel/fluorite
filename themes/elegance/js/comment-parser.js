CommentParser = function() {

  this._registry = {};

  this.register = function(name, type, action) {

    this._registry[name] = { type: type, action: action };
  };

  this.parse = function(container) {

    if ( ! Node ) Node = {};

    if ( ! Node.COMMENT_NODE ) Node.COMMENT_NODE = 8;

    var selection = [];
    var selectingParams;
    var selectingName;

    for ( let i = 0; i < container.childNodes.length; i++ ) {

      var node = container.childNodes[i];

      if ( node.nodeType === Node.COMMENT_NODE ) {

        var name = node.data.trim().match(/([\/a-z0-9-_]+)(:\s*(.+,?)+)?/i);
        var params;

        if ( ! name ) {

          continue;

        }
        else {

          if ( name[3] ) params = name[3].replace(/\s+/g, '').split(',');

          name = name[1].trim();

        }

        var closing = false;

        if ( name.substr(0, 1) === '/' ) {

          closing = true;
          name = name.slice(1);

        }

        var comment = this._registry[name];

        if ( ! comment ) continue;

        if ( comment.type === 'single' ) {

          comment.action(node.nextElementSibling, params);

        }
        else if ( comment.type === 'block' ) {

          if ( closing && selectingName === name ) {

            comment.action(selection, selectingParams);

            selectingName = null;
            selectingParams = null;
            selection = [];

            continue;

          }

          selectingName = name;
          selectingParams = params;

        }

      }
      else {

        if ( selectingName ) selection.push(node);

      }

    }

  };

};
