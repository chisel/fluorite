RightPane = function() {

  this.asideGroups = [];
  this.middlePane = document.querySelector('div.middle-pane');
  this.rightPane = document.querySelector('div.right-pane');

  // Selects all elements between aside comments, adds them to the right pane and hides them from the middle pane using Bootstrap class names
  this.init = () => {

    const comment = new CommentParser();

    comment.register('aside', 'block', (nodes) => {

      let group = {
        nodes: [],
        alignTo: nodes && nodes.length && nodes[0].previousElementSibling ? nodes[0].previousElementSibling : null
      };

      for ( const node of nodes ) {

        group.nodes.push(node.cloneNode(true));

        if ( node.classList ) {

          switch (getComputedStyle(node).display) {

            case 'block':
              node.classList.add('d-block');
              break;

            case 'inline-block':
              node.classList.add('d-inline-block');
              break;

            case 'inline':
              node.classList.add('d-inline');
              break;

            case 'table':
              node.classList.add('d-table');
              break;

            case 'table-cell':
              node.classList.add('d-table-cell');
              break;

            case 'table-row':
              node.classList.add('d-table-row');
              break;

            case 'flex':
              node.classList.add('d-flex');
              break;

            case 'inline-flex':
              node.classList.add('d-inline-flex');
              break;

            default:
              node.classList.add('d-block');
              break;

          }

          node.classList.add('d-lg-none');

        }

      }

      this.asideGroups.push(group);

    });

    comment.parse(this.middlePane);

    this.buildRightPane();

  };

  this.buildRightPane = () => {

    // Insert aside groups inside the right pane
    for ( const group of this.asideGroups ) {

      // Create a group element
      group.element = document.createElement('DIV');

      // Add all child nodes to the group
      for ( const node of group.nodes ) {

        group.element.appendChild(node);

      }

      // Delete the nodes
      delete group.nodes;

      // Style the group
      group.element.style.width = "100%";
      group.element.style.display = 'flex';
      group.element.style.flexDirection = 'column';

      // Add the group inside the right pane
      this.rightPane.appendChild(group.element);

    }

    // Calculate top margins
    this.recalcGroups(100);

    // Add event listener to onresize for re-calculating the top margins
    window.addEventListener('resize', () => {

      this.recalcGroups();

    });

  };

  // Recalculates the top margins of all aside groups
  this.recalcGroups = (delay) => {

    setTimeout(() => {

      let preTop = 0;

      for ( const group of this.asideGroups ) {

        preTop = this.setTopMargin(preTop, group);

      }

    }, delay || 5);

  };

  // Calculates and sets the top margin on the given aside group and returns the new preTop value
  this.setTopMargin = (preTop, group) => {

    const margin = (group.alignTo ? group.alignTo.offsetTop : 0) - preTop;

    group.element.style.marginTop = (margin >= 0 ? margin : 0) + 'px';

    return margin + group.element.offsetHeight + preTop;

  };

};
