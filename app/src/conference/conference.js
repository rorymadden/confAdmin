angular.module('conference', [])
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('conference', {
      url: '/conference/:confId',
      templateUrl: 'src/conference/conference.html',
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
    
}])
.controller('ConferenceCtrl', ['', function () {
  
}])


;