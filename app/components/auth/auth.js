'use strict';

// import angularJwt from 'angular-jwt';

angular.module('auth', ['angular-jwt'])
  .factory('authInterceptor', function (API, authService) {
    'ngInject';

    return {
      // automatically attach Authorization header
      request: function(config) {
        var token = authService.getToken();
        if(config.url.indexOf(API) === 0 && token) {
          config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
      }
    };
  })
  .service('authService', function ($window, jwtHelper, $rootScope) {
    'ngInject';

    var self = this;

    // Add JWT methods here
    self.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    };

    self.saveToken = function(token) {
      $window.localStorage['jwtToken'] = token;
    };

    self.getToken = function() {
      return $window.localStorage['jwtToken'];
    };

    self.isAuthed = function() {
      var token = self.getToken();
      if(token) {
        var params = self.parseJwt(token);
        return Math.round(new Date().getTime()) <= params.exp;
      } else {
        return false;
      }
    };

    self.logout = function() {
      $window.localStorage.removeItem('jwtToken');
      $rootScope.currentUser = null;
      $rootScope.conference = null;
    };

    self.getUserFromToken = function () {
      var token = self.getToken();
      if(token) {
        var params = self.parseJwt(token);
        return params.sub;
      } else {
        return null;
      }
    }

    self.getRole = function () {
      var token = self.getToken();
      if(token) {
        var params = self.parseJwt(token);
        return params.permissions;
      } else {
        return null;
      }
    }
  })
  .directive('access', function (authService) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        'ngInject';

        // Hide by default
        $element.addClass('ng-hide');

        // maybe there are multiple roles who have access
        var roles = $attrs.access.split(',');

        if(roles.indexOf(authService.getRole()) !== -1) {
          $element.removeClass('ng-hide');
        }
      }
    }
  });
