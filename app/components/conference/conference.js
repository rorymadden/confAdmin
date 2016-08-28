
// import conferenceTemplate from './conference.html';
// import confSelectorTemplate from './conferenceSelector.html';

angular.module('conference', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conference', {
      url: '/conference/:confId',
      // templateUrl: conferenceTemplate,
      templateUrl: 'conference/conference.html',
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
        $title: ['conference', function (conference) { return conference.name + ' ' + conference.year; }]
      }
    })
    ;

})
.directive('conferenceSelector', function () {
  return {
    restrict: 'E',
    // templateUrl: confSelectorTemplate,
    templateUrl: 'conference/conferenceSelector.html',
    controller: function ($rootScope, $state, $scope, $stateParams) {
      'ngInject';

      var self = this;
      $rootScope.$on('conferences', function (event, conferences) {
        self.conferences = conferences;
      });
      $rootScope.$on('conference', function (event, conference) {
        self.conferenceId = conference._id;
      });

      $rootScope.$on('currentUser', function (event, user) {
        self.user = user;
      });

      this.goToConference = function () {
        $state.go('conference', {confId: this.conferenceId});
      };
    },
    controllerAs: 'confSelector'
  };
})
.controller('ConferenceCtrl', function (conferences, conference, $rootScope) {
  'ngInject';
//   this.user =
//   $rootScope.$on('currentUser', function (event, user) {
//     this.user = user;
//   });
  $rootScope.$emit('conferences', conferences);
  $rootScope.$emit('conference', conference);
})
;
