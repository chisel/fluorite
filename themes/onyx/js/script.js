window.onload = () => {

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

  // Build the right pane
  window.rightPane = new RightPane();

  window.rightPane.init();

};

// Close the slider menu when the view width grows beyond the Bootstrap's md breakpoint
window.onresize = () => {

  if ( window.innerWidth >= 768 ) {

    document.getElementById('sliderMenu').classList.remove('show');
    document.getElementById('sliderMenuShadow').classList.remove('show');
    document.getElementsByTagName('body')[0].classList.remove('no-scroll');

  }

};

// Toggle the slider menu
function toggleMenu() {

  document.getElementById('sliderMenu').classList.toggle('show');
  document.getElementById('sliderMenuShadow').classList.toggle('show');
  document.getElementsByTagName('body')[0].classList.toggle('no-scroll');

}
