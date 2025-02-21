//  Load local storage and check for session

// Load local storage
let session = localStorage.getItem('session');

function menuHandler () {
    let menu = document.querySelector('#menu');
    if (menu.classList.contains('closed')) {
        menu.classList.remove('closed');
        menu.classList.add('menu--open');
    } else {
        menu.classList.remove('menu--open');
        menu.classList.add('closed');
    }
}