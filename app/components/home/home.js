'use strict';
// import homeTemplate from './home.html';

angular.module('home', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('home', {
      url: '/',
      // templateUrl: homeTemplate,
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl as home',
      resolve: {
        $title: function () { return 'Home'; },
        conferences: ['Restangular', function (Restangular) {
          return Restangular.all('conferences').getList();
        }],
        //           news: ['$http', function ($http) {
//             // var options = {
//             //   responseType: 'json',
//             //   'Content-Type': 'application/json'
//             // };
//             return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=4&q=http%3A%2F%2Fblog.exportleadership.com%2Frss%2Findex.xml&callback=JSON_CALLBACK');
//           }]
      }
    })
    ;
})
.controller('HomeCtrl', function (conferences, Restangular, $state, $rootScope) {
  'ngInject';

  $rootScope.$emit('conferences', conferences);

  // to populate the conference list
  this.showCreate= false;
  this.showCreateForm = function () {
    this.showCreate = true;
  };

  this.hideCreateForm = function () {
    this.newConference = {}; // wipe the conference if closed
    this.showCreate = false;
  };

  this.newConference = {};

  this.createConference = function () {
    Restangular.all('conferences').post(this.newConference).then(function (conference) {
    $state.go('conference', {confId: conference._id});
    });
  };
})
;
