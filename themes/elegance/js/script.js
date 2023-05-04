function getScrollPercent(offset) {

  var h = document.documentElement,
      b = document.body,
      st = 'scrollTop',
      sh = 'scrollHeight';

  return Math.min(((h[st]||b[st]) - offset) / ((h[sh]||b[sh]) - (h.clientHeight + offset)) * 100, 100);

}

function recalcNavHeight() {

  var navElement = document.querySelector('nav');
  var navContainerElement = document.querySelector('nav .nav-container.active');

  // If desktop view
  if ( window.getComputedStyle(navElement).position !== 'relative' ) {

    navElement.style.height = 'auto';
    navElement.style.minHeight = 'auto';

  }
  else {

    navElement.style.minHeight = window.getComputedStyle(navContainerElement).height;

  }

}

function applyScrollChanges() {

  var brandHeight = document.querySelector('header .brand').clientHeight;
  var progressBarContainer = document.querySelector('header .progress-bar-container');
  var progressBar = document.querySelector('header .progress-bar-container > .progress-bar');
  var navContainer = document.querySelector('nav > .nav-container#navigationList');
  var headerBrand = document.querySelector('header .brand');
  var versionsDropdown = document.querySelector('.versions-dropdown');

  if ( headerBrand.getBoundingClientRect().bottom <= 3 ) {

    navContainer.classList.add('header-out-of-view');

    if ( progressBarContainer ) {

      progressBarContainer.classList.add('show');
      progressBar.style.width = `${getScrollPercent(brandHeight - 3)}%`;

    }

    if ( versionsDropdown ) versionsDropdown.classList.remove('open');

  }
  else {

    navContainer.classList.remove('header-out-of-view');

    if ( progressBarContainer ) {

      progressBarContainer.classList.remove('show');
      progressBar.style.width = `0%`;

    }

  }

}

function selectContentTab(el) {

  // Get element index
  var tabIndex = Array.prototype.slice.call(el.parentElement.children).indexOf(el);

  // Set CSS classes
  var tabs = el.parentElement.children;
  var views = el.parentElement.parentElement.parentElement.parentElement.querySelector('.content-views').children;

  for ( let i = 0; i < tabs.length; i++ ) {

    if ( i === tabIndex ) {

      tabs[i].classList.add('selected');
      views[i].classList.add('show');

    }
    else {

      tabs[i].classList.remove('selected');
      views[i].classList.remove('show');

    }

  }

  // Set separator
  var separator = tabs[tabIndex].parentElement.parentElement.querySelector('.content-separator');
  var tabRect = tabs[tabIndex].getBoundingClientRect();
  var containerRect = tabs[tabIndex].parentElement.parentElement.getBoundingClientRect();

  separator.style.width = tabRect.width + 'px';
  separator.style.marginLeft = (tabRect.left - containerRect.left) + 'px';

}

function toggleVersionsDropdown(el, event) {

  el.classList.toggle('open');
  event.stopImmediatePropagation();
  event.stopPropagation();
  event.preventDefault();

}

function stopClickBubbling(event) {

  event.stopImmediatePropagation();
  event.stopPropagation();

}

function closeVersionsList() {

  var versionsDropdown = document.querySelector('.versions-dropdown');

  if ( versionsDropdown ) versionsDropdown.classList.remove('open');

}

function postLoadProcess() {

  // Enable responsive Markdown
  var commentParser = new CommentParser();

  // Create responsive content
  commentParser.register('responsive', 'block', function(nodes, breakpoints) {

    for ( var i = 0; i < nodes.length; i++ ) {

      var node = nodes[i];

      if ( ! node.classList ) continue;

      var display = getComputedStyle(node).display || 'block';

      node.classList.add(`display-mobile-${breakpoints.indexOf('mobile') !== -1 ? display : 'none'}`);
      node.classList.add(`display-tablet-${breakpoints.indexOf('tablet') !== -1 ? display : 'none'}`);
      node.classList.add(`display-desktop-${breakpoints.indexOf('desktop') !== -1 ? display : 'none'}`);

    }

  });

  commentParser.register('tab-group', 'block', (nodes, params, self) => {

    const commentParser = new CommentParser();

    // Create tabs container
    const tabsContainerElement = document.createElement('DIV');
    const tabsElement = document.createElement('DIV');
    const contentTabsContainer = document.createElement('DIV');
    const contentTabGroup = document.createElement('DIV');
    const contentTabSeparators = document.createElement('DIV');
    const contentSeparator = document.createElement('DIV');
    const viewsElement = document.createElement('DIV');

    // Assign classes
    tabsContainerElement.classList.add('content-tab-view');
    tabsElement.classList.add('content-tabs');
    contentTabsContainer.classList.add('content-tabs-container');
    contentTabGroup.classList.add('content-tab-group');
    contentTabSeparators.classList.add('content-separators');
    contentSeparator.classList.add('content-separator');
    viewsElement.classList.add('content-views');

    commentParser.register('tab', 'block', (nodes, name) => {

      // Create tab element
      const tabElement = document.createElement('DIV');

      // Configure tab element
      tabElement.classList.add('content-tab');
      tabElement.innerText = name;
      tabElement.onclick = () => selectContentTab(tabElement);

      // Add tab element to its container
      contentTabGroup.appendChild(tabElement);

      // Create view element
      const viewElement = document.createElement('DIV');

      // Configure view element
      viewElement.classList.add('content-view', 'content-spacing');

      for ( const node of nodes )
        viewElement.appendChild(node);

      // Add view element its container
      viewsElement.appendChild(viewElement);

    });

    // Add child elements
    contentTabsContainer.appendChild(contentTabGroup);
    contentTabSeparators.appendChild(contentSeparator);
    contentTabsContainer.appendChild(contentTabSeparators);
    tabsElement.appendChild(contentTabsContainer);
    tabsContainerElement.appendChild(tabsElement);
    tabsContainerElement.appendChild(viewsElement);

    // Add main container to page
    self.parentElement.insertBefore(tabsContainerElement, self);

    // Process tab group nodes
    commentParser.processNodes(nodes, true, true);

  });

  commentParser.processSelector('article', false);

  // Apply .img-block to <img> which are the only child of a <p> without any text
  var imgs = document.querySelectorAll('article > p > img:only-child');

  for ( var i = 0; i < imgs.length; i++ ) {

    if ( ! imgs[i].parentElement.innerText.trim() ) imgs[i].classList.add('img-block');

  }

  // Wrap tables
  var tables = document.getElementsByTagName('table');

  for ( var i = 0; i < tables.length; i++ ) {

    var table = tables[i];
    var wrapper = document.createElement('div');
    wrapper.classList.add('table-container');
    if ( table.classList.contains('no-header') ) wrapper.classList.add('no-header');

    table.parentElement.insertBefore(wrapper, table);
    wrapper.appendChild(table);

  }

  // Remove custom scrollbar stylings in Mac
  if ( navigator?.userAgent?.toLowerCase().match(/mac\s*os/) ) {

    document.querySelector('nav > .nav-container#navigationList').classList.remove('custom-scroller');
    var dropdownContainer = document.querySelector('.dropdown-container');
    var tableContainers = document.querySelectorAll('.table-container');
    var codeBlocks = document.getElementsByTagName('pre');
    var contentTabs = document.querySelectorAll('.content-tabs');

    if ( dropdownContainer ) dropdownContainer.classList.add('no-custom-scroller');

    for ( var i = 0; i < tableContainers.length; i++ ) {

      tableContainers[i].classList.add('no-custom-scroller');

    }

    for ( var i = 0; i < codeBlocks.length; i++ ) {

      codeBlocks[i].classList.add('no-custom-scroller');

    }

    for ( var i = 0; i < contentTabs.length; i++ ) {

      contentTabs[i].classList.remove('custom-scroller');

    }

  }

  // Select all content tab views to first tab
  var firstTabs = document.querySelectorAll('article .content-tab-view .content-tab:nth-child(1)');

  for ( let i = 0; i < firstTabs.length; i++ ) {

    selectContentTab(firstTabs[i]);

  }

}

function toggleMobileMenu(menuItem, listId) {

  // Close menu
  if ( menuItem.classList.contains('active') ) {

    document.querySelector('nav').classList.remove('open');
    menuItem.classList.remove('active');

  }
  // Open menu
  else {

    // Reset all nav containers to inactive
    var navLists = document.querySelectorAll('nav .nav-container');

    for ( var i = 0; i < navLists.length; i++ ) {

      navLists[i].classList.remove('active');

    }

    // Set the linked nav container to active
    document.getElementById(listId).classList.add('active');

    // Reset all menu items to inactive
    var menuItems = document.querySelectorAll('.mobile-options .mobile-option');

    for ( var i = 0; i < menuItems.length; i++ ) {

      menuItems[i].classList.remove('active');

    }

    // Set the current menu item to active
    menuItem.classList.add('active');

    // Recalculate nav height
    recalcNavHeight();
    // Open nav
    document.querySelector('nav').classList.add('open');

  }

}

window.addEventListener('load', postLoadProcess);
window.addEventListener('load', recalcNavHeight);
window.addEventListener('scroll', applyScrollChanges);
window.addEventListener('resize', applyScrollChanges);
window.addEventListener('resize', recalcNavHeight);
document.addEventListener('click', closeVersionsList);
