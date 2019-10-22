(function mobileNavigationHandler() {
  const navMain = document.querySelector('.page-header');
  const navToggle = document.querySelector('.page-header__nav-mobile');

  navToggle.addEventListener('click', function () {
    if (navMain.classList.contains('page-header__nav-mobile--closed')) {
      navMain.classList.remove('page-header__nav-mobile--closed');
      navMain.classList.add('page-header__nav-mobile--opened');
    } else {
      navMain.classList.remove('page-header__nav-mobile--opened');
      navMain.classList.add('page-header__nav-mobile--closed');
    }
  });
}());