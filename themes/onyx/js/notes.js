Notes = function() {

  this.middlePane = document.querySelector('div.middle-pane');

  if ( ! Node ) Node = {};

  if ( ! Node.COMMENT_NODE ) Node.COMMENT_NODE = 8;

  for ( const node of this.middlePane.childNodes ) {

    if ( node.nodeType === Node.COMMENT_NODE && node.data.trim().substr(0, 5) === 'note-' ) {

      const nextElement = node.nextElementSibling;

      if ( nextElement ) nextElement.classList.add(node.data.trim());

    }

  }

};
