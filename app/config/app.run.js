function AppRun($rootScope, $state, $mdSidenav, $window, $location, authService) {
    'ngInject';

  // check for correct priviledges
  $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
    if (!authService.isAuthed() && (toState.name !== 'login' && toState.name !== 'settlement')) {
      event.preventDefault();
      $state.go('login');
    }

    // TODO: this errors on first load
    $mdSidenav('left').close();
  });

  // google analytics
  $rootScope.$on('$stateChangeSuccess',
    function(){
      if (!$window.ga){return;}
      $window.ga('send', 'pageview', { page: $location.path() });
    }
  )
}

export default AppRun
