window.addEventListener('load', () => {

  // Apply .img-block to <img> which are the only child of a <p> without any text
  const imgs = document.querySelectorAll('.middle-pane > p > img:only-child');

  for ( const img of imgs ) {

    if ( ! img.parentElement.innerText.trim() ) img.classList.add('img-block');

  }

  // Initiate SimpleBar on all <pre>
  const codeBlocks = document.getElementsByTagName('pre');

  for ( const codeBlock of codeBlocks ) {

    new SimpleBar(codeBlock);

  }

  const comment = new CommentParser();

  // Create notes
  comment.register('note', 'single', (element, type) => {

    element.classList.add(`note-${type}`);

    const children = [];
    let span = document.createElement('span');

    for ( const child of element.childNodes ) {

      children.push(child);

    }

    for ( const child of children ) {

      span.appendChild(child);

    }

    element.appendChild(span);

  });

  // Create responsive content
  comment.register('responsive', 'block', (nodes, breakpoints) => {

    for ( const node of nodes ) {

      if ( ! node.classList ) continue;

      const display = getComputedStyle(node).display || 'block';

      node.classList.add(`d-${breakpoints.includes('mobile') ? display : 'none'}`);
      node.classList.add(`d-sm-${breakpoints.includes('mobile') ? display : 'none'}`);
      node.classList.add(`d-md-${breakpoints.includes('tablet') ? display : 'none'}`);
      node.classList.add(`d-lg-${breakpoints.includes('desktop') ? display : 'none'}`);
      node.classList.add(`d-xl-${breakpoints.includes('desktop') ? display : 'none'}`);

    }

  });

  comment.parse(document.querySelector('.middle-pane'));

  // Build the right pane
  window.rightPane = new RightPane();

  window.rightPane.init();

  // Select all first body contents
  const firstBodyContentHeaders = document.querySelectorAll('.body-group ul > li:first-child');

  for ( const header of firstBodyContentHeaders ) {

    toggleBodyContent(header, 0);

  }

});

// Close the slider menu when the view width grows beyond the Bootstrap's md breakpoint
window.onresize = () => {

  if ( window.innerWidth >= 768 ) {

    document.getElementById('sliderMenu').classList.remove('show');
    document.getElementById('sliderMenuShadow').classList.remove('show');
    document.getElementsByTagName('body')[0].classList.remove('no-scroll');
    document.getElementsByTagName('html')[0].classList.remove('no-scroll');

  }

};

// Toggle the slider menu
function toggleMenu() {

  document.getElementById('sliderMenu').classList.toggle('show');
  document.getElementById('sliderMenuShadow').classList.toggle('show');
  document.getElementsByTagName('body')[0].classList.toggle('no-scroll');
  document.getElementsByTagName('html')[0].classList.toggle('no-scroll');

}

function toggleSection(chevron) {

  chevron.parentElement.nextElementSibling.classList.toggle('hide');
  chevron.children[0].classList.toggle('closed');

}

// Toggle the body group contents
function toggleBodyContent(element, index) {

  const group = element.parentElement.parentElement;
  const headers = group.children[0].children;

  let indexCounter1 = 0;

  for ( const header of headers ) {

    if ( indexCounter1 === index ) header.classList.add('selected');
    else header.classList.remove('selected');

    indexCounter1++;

  }

  const contents = group.children[1].children;
  let indexCounter2 = 0;

  for ( const content of contents ) {

    if ( indexCounter2 === index ) content.classList.add('show');
    else content.classList.remove('show');

    indexCounter2++;

  }

  window.rightPane.recalcGroups();

}
