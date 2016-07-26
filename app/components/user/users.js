'use strict';

import loginTemplate from './login.html';
import widgetTemplate from './userWidget.html';

angular.module('user', [])
  .config(function ($stateProvider) {
    'ngInject';

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: loginTemplate,
        controller: function (AppConstants) {
          'ngInject';
          this.link = AppConstants.GOOGLE_AUTH;
        },
        controllerAs: 'login',
        resolve: {
          $title: function () { return 'Login'; }
        }
      })
      .state('settlement', {
        url: '/settlements?token&user',
        resolve: {
          user: function($state, authService, $stateParams, userService ) {
            'ngInject';
            authService.saveToken($stateParams.token);
            var parsed = authService.parseJwt($stateParams.token);
            return userService.getCurrentUser(parsed.sub).then(function (user) {
              $state.go('home');
            }, function (err) {console.log(err)});
          }
        }
      })
      .state('logout', {
        url: '/logout',
        // controller: ['authService', '$state', function (authService, $state) {
        //   authService.logout();
        //   $state.go('login');
        // }]
        resolve: {
          data: function($q, $timeout, $state, authService) {
            'ngInject';
            var deferred = $q.defer();
            authService.logout();
            $timeout(function () {
              $state.go('login');
              // window.location = URL + '/login.html';
              deferred.resolve();
            });
            return deferred.promise;
          }
        }
      })
      ;
  })
  .service('userService', function (Restangular, $rootScope, $q, authService) {
    'ngInject';
    this.getCurrentUser = function (userId) {
      if($rootScope.currentUser) {
        $rootScope.$emit('currentUser',$rootScope.currentUser);
        return $q.when($rootScope.currentUser);
      }
      if (!userId) {
        userId = authService.getUserFromToken();
      }

      if (userId) {
        return Restangular.one('users', userId).get().then(function (user) {
          if (Array.isArray(user)) user = user[0];
          $rootScope.currentUser = user;
          $rootScope.$emit('currentUser',user);
          return user;
        });
      }


    };

  })
  .directive('userWidget', [function () {
    return {
      restrict: 'E',
      templateUrl: widgetTemplate,
      scope: {
        user: '='
      },
      controller: function ($rootScope, $state) {
        'ngInject';

        var self = this;
        this.showMenu = false;
        this.toggleMenu = function () {
          this.showMenu = !this.showMenu;
        };
        this.user = $rootScope.currentUser;
        $rootScope.$on('currentUser', function (event, user) {
          self.user = user;
        });

        // this.goToConference = function () {
        //   $state.go('conference', {confId: this.conferenceId});
        // };
      },
      controllerAs: 'userWidget'
    };
  }]);
