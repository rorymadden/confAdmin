'use strict';

angular.module('auth', ['angular-jwt'])
  .factory('authInterceptor', ['API', 'authService', function (API, authService) {
    return {
      // automatically attach Authorization header
      request: function(config) {
        var token = authService.getToken();
        if(config.url.indexOf(API) === 0 && token) {
          config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
      },

      // If a token was sent back, save it
      response: function(res) {
        //TODO: if token fails then try to get token again
        // if(res.config.url.indexOf(API) === 0 && res.params.token) {
        //   authService.saveToken(res.params.token);
        // }

        return res;
      },
    }
  }])
  .service('authService', ['$window', 'jwtHelper', function ($window, jwtHelper) {
    var self = this;

    // Add JWT methods here
    self.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    }

    self.saveToken = function(token) {
      $window.localStorage['jwtToken'] = token;
    }

    self.getToken = function() {
      return $window.localStorage['jwtToken'];
    }

    self.isAuthed = function() {
      var token = self.getToken();
      if(token) {
        var date = jwtHelper.getTokenExpirationDate(token);
        var params = self.parseJwt(token);
        return Math.round(new Date().getTime() / 1000) <= params.exp;
      } else {
        return false;
      }
    }

    self.logout = function() {
      $window.localStorage.removeItem('jwtToken');
    }
  }]);
