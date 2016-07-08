angular.module('conference', [])
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('conference', {
      url: '/conference/:confId',
      templateUrl: 'src/conference/conference.html',
      controller: 'ConferenceCtrl as conf',
      resolve: {
        conferences: ['Restangular', function (Restangular) {
          return Restangular.all('conferences').getList();
        }],
        conference: ['conferences', '$stateParams', function (conferences, $stateParams) {
          return conferences.filter(function (conf) {
            return conf._id === $stateParams.confId;
          })[0];
        }],
        user: ['userService', function (userService) {
          return userService.getCurrentUser();
        }],
        $title: ['conference', function (conference) { return conference.name + ' ' + conference.year; }]
      }
    })
    ;
    
}])
.directive('conferenceSelector', function () {
  return {
    restrict: 'E',
    templateUrl: 'src/conference/conferenceSelector.html',
    controller: ['$rootScope', '$state', '$scope', '$stateParams', function ($rootScope, $state, $scope, $stateParams) {
      var self = this;
      $rootScope.$on('conferences', function (event, conferences) {
        self.conferences = conferences;
        // $scope.$apply();
      });
      $rootScope.$on('conference', function (event, conference) {
        self.conferenceId = conference._id;
        // $scope.$apply();
      });
      
      this.goToConference = function () {
        $state.go('conference', {confId: this.conferenceId});
      };
    }],
    controllerAs: 'confSelector'
  };
})
.controller('ConferenceCtrl', ['conferences', 'conference', '$rootScope', 'user', function (conferences, conference, $rootScope, user) {
  this.user = $rootScope.user = user;
  $rootScope.$emit('conferences', conferences);
  $rootScope.$emit('conference', conference);
}])
;