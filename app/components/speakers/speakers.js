'use strict';
import speakersTemplate from './speakers.html';
import speakerFormTemplate from './speakerForm.html';

angular.module('speakers', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conference.speakers', {
      url: '/speakers',
      templateUrl: speakersTemplate,
      controller: 'SpeakersCtrl as speakers',
      resolve: {
        $title: function () { return 'Speakers'; },
        speakers: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('speakers').getList();
        }
      }
    })
    .state('conference.speakers.new', {
      url: '/new',
      templateUrl: speakerFormTemplate,
      controller: 'CreateSpeakerCtrl as speakerCtrl',
      resolve: {
        $title: function () { return 'Create a New Speaker'; }
      },
      speaker: function () { return {} }

    })
    .state('conference.speakers.speaker', {
      url: '/:speakerId',
      templateUrl: speakerFormTemplate,
      controller: 'SpeakerCtrl as speakerCtrl',
      resolve: {
        speaker: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('speakers').getList();
        },
        $title: function () { return 'Edit Speaker: ' + speaker.first + ' ' + speaker.last; },
      }
    })
    ;
})
.controller('SpeakersCtrl', function (speakers, Restangular, $state, $stateParams, $mdMedia, $mdDialog) {
  'ngInject';
  var self = this;
  this.speakers = Restangular.copy(speakers); //TODO: see if we are editing from here?

  this.query = {
    order: 'last',
    limit: 30,
    page: 1
  };
})

.controller('SpeakerFormCtrl', function (speaker, Restangular, $state, $stateParams) {
  'ngInject';

  var newSpeaker = true;
  this.speaker = Restangular.copy(speaker);
  if (this.speaker.first) newSpeaker = false;

  this.saveSpeaker = function () {
    // var imageUploads = {
    //   profilePic: false,
    //   companyLogo: false
    // };
    //
    // if (this.speaker.profilePic && this.speaker.profilePic !== speaker.profilePic) imageUploads.profilePic = true;
    // if (this.speaker.companyLogo && this.speaker.companyLogo !== speaker.companyLogo) imageUploads.companyLogo = true;
    //
    // imageService.uploadImage({
    //
    // })
    // create a new
    if (newSpeaker) {
      Restangular.one('conferences', $stateParams.confId).all('speakers').post(this.speaker).then(function (speaker) {
        $state.go('conference.speakers.speaker', {speakerId: speaker._id});
      });
    }
    else {
      Restangular.one('conferences', $stateParams.confId).one('speakers', $stateParams.speakerId).put(this.speaker).then(function (speaker) {
        $state.go('conference.speakers');
      });
    }
  };

  this.removeSpeaker = function () {
    Restangular.one('conferences', $stateParams.confId).one('speakers', $stateParams.speakerId).remove().then(function (speaker) {
      $state.go('conference.speakers');
    });
  }
})
.filter('countryCode', function (countries) {
  'ngInject';

  return function (countryCode) {
    var country = countries.filter(function (country) {
      return country.code === countryCode;
    });
    return country[0].country;
  };
})
;
