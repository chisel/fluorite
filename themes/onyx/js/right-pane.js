RightPane = function() {

  this.asideGroups = [];
  this.middlePane = document.querySelector('div.middle-pane');
  this.rightPane = document.querySelector('div.right-pane');

  // Selects all elements between aside comments, adds them to the right pane and hides them from the middle pane using Bootstrap class names
  this.init = () => {

    let selecting = false;
    let asideGroup;

    if ( ! Node ) Node = {};

    if ( ! Node.COMMENT_NODE ) Node.COMMENT_NODE = 8;

    // Select nodes and hide them from the middle pane
    for ( const node of this.middlePane.childNodes ) {

      // If node is aside comment
      if ( node.nodeType === Node.COMMENT_NODE && node.data.trim() === 'aside' ) {

        // If not already selecting, create a new group
        if ( ! selecting ) {

          asideGroup = {
            nodes: [],
            alignTo: node.previousElementSibling,
            id: this.asideGroups.length
          };

        }

        selecting = true;

      }
      // If node is /aside comment
      else if ( node.nodeType === Node.COMMENT_NODE && node.data.trim() === '/aside' ) {

        // If not selecting
        if ( ! selecting ) continue;

        selecting = false;

        // Add the group to aside groups
        this.asideGroups.push(asideGroup);

        asideGroup = null;

      }
      // If any other node while selecting
      else if ( selecting ) {

        asideGroup.nodes.push(node.cloneNode(true));

        if ( node.classList ) {

          node.classList.add('d-block');
          node.classList.add('d-lg-none');

        }

      }

    }

    // If still selecting after iterating through all the nodes (no /aside comment found for the last aside comment)
    if ( selecting && asideGroup ) this.asideGroups.push(asideGroup);

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
    this.recalcGroups();

    // Add event listener to onresize for re-calculating the top margins
    window.addEventListener('resize', () => {

      this.recalcGroups();

    });

    console.log(this.asideGroups)

  };

  // Recalculates the top margins of all aside groups
  this.recalcGroups = () => {

    let preTop = 0;

    for ( const group of this.asideGroups ) {

      preTop = this.setTopMargin(preTop, group);

    }

  };

  // Calculates and sets the top margin on the given aside group and returns the new preTop value
  this.setTopMargin = (preTop, group) => {

    const margin = (group.alignTo ? group.alignTo.offsetTop : 0) - preTop;

    group.element.style.marginTop = (margin >= 0 ? margin : 0) + 'px';

    return margin + group.element.offsetHeight;

  };

};
