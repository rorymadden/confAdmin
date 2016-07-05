'use strict';

angular.module('user', [])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      // .state('login', {
      //   url: '/login',
      //   templateUrl: 'src/user/login.html',
      //   resolve: {
      //     $title: function () { return 'Login'; }
      //   }
      // })
      .state('settlement', {
        url: '/settlements?token&user',
        resolve: {
          data: ['$q', '$timeout', '$location', 'authService', '$stateParams',
            function($q, $timeout, $location, authService, $stateParams ) {
            var deferred = $q.defer();
            authService.saveToken($stateParams.token);
            $timeout(function () {
              $location.url('/');
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })
      .state('logout', {
        url: '/logout',
        resolve: {
          data: ['$q', '$timeout', '$location', 'authService', '$stateParams', 'URL',
            function($q, $timeout, $location, authService, $stateParams, URL ) {
            var deferred = $q.defer();
            authService.logout();
            $timeout(function () {
              window.location = URL + '/login.html';
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })
      ;
  }]);
