'use strict';
// import speakersTemplate from './speakers.html';
// import speakerFormTemplate from './speakerForm.html';

angular.module('speakers', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conference.speakers', {
      url: '/speakers',
      // templateUrl: speakersTemplate,
      templateUrl: 'speakers/speakers.html',
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
      // templateUrl: speakerFormTemplate,
      templateUrl: 'speakers/speakerForm.html',
      controller: 'SpeakerFormCtrl as speakerCtrl',
      resolve: {
        $title: function () { return 'Create a New Speaker'; },
        speaker: function () { return {} }
      },


    })
    .state('conference.speakers.speaker', {
      url: '/:speakerId',
      // templateUrl: speakerFormTemplate,
      templateUrl: 'speakers/speakerForm.html',
      controller: 'SpeakerFormCtrl as speakerCtrl',
      resolve: {
        speaker: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).one('speakers', $stateParams.speakerId).get(function (speaker) {
            return speaker;
          });


        },
        // $title: function () { return 'Edit Speaker: ' + speaker.first + ' ' + speaker.last; },
        $title: function () { return 'Edit Speaker'; },
      }
    })
    ;
})
.controller('SpeakersCtrl', function (speakers, Restangular, $state, $stateParams, $mdMedia, $mdDialog, $rootScope, imageService) {
  'ngInject';
  var self = this;
  // this.speakers = Restangular.copy(speakers);
  this.speakers = speakers;

  $rootScope.$on('speakerChange', function (event, speaker) {
    var newSpeaker = true;
    self.speakers.map(function (s, index) {
      if(s._id === speaker._id) {
        newSpeaker = false;
        self.speakers.splice(index, 1, speaker);
      }
    });
    if (newSpeaker) self.speakers.push(speaker);
  });
  $rootScope.$on('removedSpeaker', function (event, speaker) {
    self.speakers = self.speakers.filter(function (s) {
      if(s._id !== speaker._id) return true;
    });
  });


  // hide inactive by default
  this.activeFlag = true;
  this.toggleActive = function () {
    this.activeFlag = !this.activeFlag;
  }

  this.query = {
    order: 'last',
    limit: 30,
    page: 1
  };

  this.confirmPublication = function(ev, speaker) {
    var action = speaker.published ? 'un-publish' : 'publication';
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm ' + action)
          .textContent('Confirm ' + action + ' of ' + speaker.first + ' ' + speaker.last)
          .ariaLabel('Speaker ' + action)
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      speaker.published = !speaker.published;
      if (!speaker.published) {
        speaker.one('unpublish').get().then(function () {

        }, function (err) {
          speaker.published = !speaker.published;
          $mdDialog.show(
             $mdDialog.alert()
              .parent(angular.element(document.querySelector('#speakerList')))
              .clickOutsideToClose(true)
              .title('Cannot Unpublish')
              .textContent(err)
              .ariaLabel('Unpublish Error')
              .ok('Got it!')
              .targetEvent(ev)
            );
        });
      }
      else {
        speaker.save();
      }
    });
  };

  this.removeSpeaker = function(ev, speaker) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm De-activation')
          .textContent('Confirm de-activation of ' + speaker.first + ' ' + speaker.last)
          .ariaLabel('Speaker De-activation')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      speaker.remove().then(function () {
        //update the active flag against the speaker
        speaker.active = false;
      }, function (err) {
        $mdDialog.show(
           $mdDialog.alert()
            .parent(angular.element(document.querySelector('#speakerList')))
            .clickOutsideToClose(true)
            .title('Cannot De-activate')
            .textContent(err)
            .ariaLabel('Unpublish Error')
            .ok('Got it!')
            .targetEvent(ev)
          );
      });
    });
  };

  this.reactivateSpeaker = function (speaker) {
    speaker.active = true;
    speaker.save();

  }

  this.toggleImage = function (speaker, fieldName) {
    //check if the image is ok
    if (speaker[fieldName]) {
      imageService.removeImage({
        className: 'Speaker',
        fieldName: fieldName,
        name: speaker.first + ' ' + speaker.last,
        object: speaker
      });
    } else {
      imageService.uploadImage({
        className: 'Speaker',
        fieldName: fieldName,
        alt: speaker.first + ' ' + speaker.last + ': ' + speaker.company,
        object: speaker
      }, function (err, imageDetails) {
        if (err) {
          // TODO: present error to the user
          console.log(err);
        }
        else {
          console.log(imageDetails);
          speaker[fieldName] = imageDetails;
          speaker.save();
        }
      });
    }
  }
})

.controller('SpeakerFormCtrl', function (speaker, Restangular, $state, $stateParams, COUNTRIES, $rootScope) {
  'ngInject';

  this.countries = COUNTRIES;

  var newSpeaker = true;
  this.speaker = Restangular.copy(speaker);

  // same controller used for new speakers and editing speakers
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
        // push the new speaker into the parent speakers list.
        $rootScope.$emit('speakerChange', speaker);
        $state.go('conference.speakers');
      });
    }
    else {
      this.speaker.put().then(function (speaker) {
        $rootScope.$emit('speakerChange', speaker);
        $state.go('conference.speakers');
      });
    }
  };

  // this.removeSpeaker = function () {
  //   Restangular.one('conferences', $stateParams.confId).one('speakers', $stateParams.speakerId).remove().then(function (speaker) {
  //     $rootScope.$emit('removeSpeaker', speaker);
  //     $state.go('conference.speakers');
  //   });
  // };

})
.filter('countryCode', function (COUNTRIES) {
  'ngInject';

  return function (countryCode) {
    var country = COUNTRIES.filter(function (country) {
      return country.code === countryCode;
    });
    return country[0].country;
  };
})
.filter('photoIcon', function ($sce) {
  'ngInject';

  return function (photo, alt, icon) {
    var imageClass = photo ? 'success' : '';
    var icon = '<md-icon md-font-set="material-icons" class="material-icons ' + imageClass + '" alt="' + alt + '">' + icon + '</md-icon>';
    return $sce.trustAsHtml(icon);
  };
})
;
