function AppConfig($httpProvider, $stateProvider, AppConstants, $urlRouterProvider, RestangularProvider, $mdThemingProvider) {
  'ngInject';

  // allow cors requests
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $httpProvider.interceptors.push('authInterceptor');

  $mdThemingProvider.theme('default')
    .primaryPalette('green')
    .accentPalette('red');

  RestangularProvider.setBaseUrl(AppConstants.API);
  RestangularProvider.setRestangularFields({
    id: "_id"
  });

  // For any unmatched url, redirect to /
  $urlRouterProvider.otherwise('/');

}

export default AppConfig;
