'use strict';

angular.module('user', [])
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'src/user/login.html',
        controller: ['GOOGLE_AUTH', function (GOOGLE_AUTH) {
          this.link = GOOGLE_AUTH;
        }],
        controllerAs: 'login',
        resolve: {
          $title: function () { return 'Login'; }
        }
      })
      .state('settlement', {
        url: '/settlements?token&user',
        resolve: {
          user: ['$state', 'authService', '$stateParams', 'userService',
            function($state, authService, $stateParams, userService ) {
            authService.saveToken($stateParams.token);
            var parsed = authService.parseJwt($stateParams.token);
            return userService.setCurrentUser(parsed.sub).then(function (user) {
              $state.go('home');
            }, function (err) {console.log(err)});
          }]
        }
      })
      .state('logout', {
        url: '/logout',
        // controller: ['authService', '$state', function (authService, $state) {
        //   authService.logout();
        //   $state.go('login');
        // }]
        resolve: {
          data: ['$q', '$timeout', '$state', 'authService',
            function($q, $timeout, $state, authService) {
            var deferred = $q.defer();
            authService.logout();
            $timeout(function () {
              $state.go('login');
              // window.location = URL + '/login.html';
              deferred.resolve();
            });
            return deferred.promise;
          }]
        }
      })
      ;
  }])
  .service('userService', ['Restangular', '$rootScope', '$q', function (Restangular, $rootScope, $q) {
    this.setCurrentUser = function (userId) {
      if($rootScope.currentUser) {
        return $q.when($rootScope.currentUser);
      }

      return Restangular.one('users', userId).get().then(function (user) {
        if (Array.isArray(user)) user = user[0];
        $rootScope.currentUser = user;
        $rootScope.$emit('currentUser',user);
        return user;
      });
    };
  }]);
