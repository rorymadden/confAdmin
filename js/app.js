'use strict';


/**
 * @ngdoc overview
 * @name conferenceMgmtApp
 * @description
 * # conferenceMgmtApp
 *
 * Main module of the application.
 */

angular
  .module('conferenceMgmtApp', [
    'ngAnimate',
    // 'ngCookies',
    'ngMessages',
    'ngMaterial',
    'ngSanitize',
    'ngAria',
    'ui.router',
    'ui.router.title',
    'restangular',
    'ngFileUpload',
    'templates',
    'constants',
    'collapse',

    'app.filters',
    'home',
    'user',
    'auth',
    'speakers',
    'sponsors',
    'sessions',
    'agendas',
    // 'streams',
    'conference',
    'venues',
    'imageMgr'
  ])

  .config(function ($httpProvider, $stateProvider, API, $urlRouterProvider, RestangularProvider, $mdThemingProvider) {
    'ngInject';

    // allow cors requests
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push('authInterceptor');

    $mdThemingProvider.theme('default')
     .primaryPalette('green')
     .accentPalette('red');

    RestangularProvider.setBaseUrl(API);
    RestangularProvider.setRestangularFields({
      id: "_id"
    });

    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise('/');

  }
)
  .run(function ($rootScope, $state, $window, $location, authService ,$mdSidenav) {
      'ngInject';

    // check for correct priviledges
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      if (!authService.isAuthed() && (toState.name !== 'login' && toState.name !== 'settlement')) {
        event.preventDefault();
        $state.go('login');
      }

      // TODO: this errors on first load
      $mdSidenav('left').close();
    });

    // google analytics
    $rootScope.$on('$stateChangeSuccess',
      function(){
        if (!$window.ga){return;}
        $window.ga('send', 'pageview', { page: $location.path() });
      }
    )
  })

  .controller('AppCtrl', function ($rootScope, $scope, userService, $mdSidenav) {
    'ngInject';

    var self = this;
    this.currentUser = userService.getCurrentUser();
    $rootScope.$on('conference', function (event, conference) {
      self.conference = conference;
    });

    this.toggleMenu = function () {
      $mdSidenav('left').toggle();
    };
  })
  ;
angular.module('templates', []);
//   .controller('SpeakersController', ['speakers', 'sessions', function (speakers, sessions) {
//     this.speakers = speakers.filter(function (speaker) {
//       return !speaker.keynote && speaker.active;
//     });
//     this.keynotes = sessions.filter(function (session) {
//       return session.type === 'keynote' && session.speakers[0] && session.speakers[0].active;
//     });
//
//     // boeing keynote
//     // this.sessions = sessions.filter(function (session) {
//     //   return session.objectId === 'KQZ7NUwO7K'
//     // });
//   }])
//   .controller('SpeakersFullController', ['speakers', 'sessions', function (speakers, sessions) {
//     this.speakers = speakers.filter(function (speaker) {
//       return !speaker.keynote;
//     });
//     this.keynotes = sessions.filter(function (session) {
//       return session.type === 'keynote';
//     });
//
//     // boeing keynote
//     // this.sessions = sessions;
//     //
//     // this.boeing = sessions.filter(function (session) {
//     //   return session.objectId === 'KQZ7NUwO7K'
//     // });
//   }])
//   .controller('StreamController', ['streams', function (streams) {
//     this.streams = streams.filter(function (stream) {
//       return stream.active;
//     });
//   }])
//   .controller('TicketsController', ['angularLoad', function (angularLoad) {
//     angularLoad.loadScript('https://js.tito.io/v1');
//   }])
//   .controller('AgendaController', ['sessions', 'eventTimeZone', '$filter', '$anchorScroll', '$location',
//     function (sessions, eventTimeZone, $filter, $anchorScroll, $location) {
//
//     this.scrollTo = function(id) {
//       $location.hash(id);
//       $anchorScroll();
//     };
//     var self = this;
//     this.eventTimeZone = eventTimeZone;
//
//     // sort the sessions by time
//     this.sessions = {};
//     this.times = {};
//     this.streams = {};
//     this.visibleStreams = {};
//     this.days = [];
//
//
//     var timesIndex = {};
//     sessions.forEach(function (session) {
//       if (session.start && session.start.iso) {
//         var dayString = $filter('date')(new Date(session.start.iso), 'EEE d MMM y', eventTimeZone);
//         var dayIndex = Object.keys(timesIndex).indexOf(dayString);
//         if (dayIndex === -1) {
//           timesIndex[dayString] = {};
//           self.days.push(dayString);
//           self.sessions[dayString] = [];
//           self.times[dayString] = [];
//           self.streams[dayString] = [];
//           self.visibleStreams[dayString] = [];
//         }
//
//         // add the stream if necessary
//         if (session.stream && session.stream.name && self.streams[dayString].indexOf(session.stream.name) === -1) {
//           self.streams[dayString].push(session.stream);
//           self.visibleStreams[dayString].push(true);
//         }
//
//         // add the session, create the time array if necessary
//         var index = Object.keys(timesIndex[dayString]).indexOf(session.start.iso);
//         if (index === -1) {
//           timesIndex[dayString][session.start.iso] = timesIndex[dayString].length;
//           self.sessions[dayString].push([session]);
//           self.times[dayString].push(session.start.iso);
//         }
//         else {
//           self.sessions[dayString][index].push(session);
//         }
//       }
//     });
//
//     // we need to order the sessions in each stream
//     this.days.forEach(function (day) {
//       self.sessions[day].forEach(function (time) {
//         if (time.length > 1) {
//           //sort the array on the stream.order value
//           time = time.sort(function (a, b) {
//             return a.stream.order - b.stream.order;
//           });
//         }
//       });
//
//       self.streams[day].sort(function (a, b) {
//         return a.order - b.order;
//       });
//     });
//
//     var visibleHeaders = {};
//     this.showStreamName = function (day, stream) {
//       if (Object.keys(visibleHeaders).indexOf(day) === -1) {
//         visibleHeaders[day] = {};
//       }
//
//       // does the stream exist
//       if (!visibleHeaders[day][stream] && stream) {
//         visibleHeaders[day][stream] = true;
//         return true;
//       }
//       else {
//         return false;
//       }
//     };
//   }])
//   .controller('AgendaMockController', ['sessions', 'eventTimeZone', '$filter', '$anchorScroll', '$location',
//     function (sessions, eventTimeZone, $filter, $anchorScroll, $location) {
//
//     this.scrollTo = function(id) {
//       $location.hash(id);
//       $anchorScroll();
//     };
//     var self = this;
//     this.eventTimeZone = eventTimeZone;
//
//     // sort the sessions by time
//     this.sessions = {};
//     this.times = {};
//     this.streams = {};
//     this.visibleStreams = {};
//     this.days = [];
//
//
//     var timesIndex = {};
//     sessions.forEach(function (session) {
//       if (session.start && session.start.iso) {
//         var dayString = $filter('date')(new Date(session.start.iso), 'EEE d MMM y', eventTimeZone);
//         var dayIndex = Object.keys(timesIndex).indexOf(dayString);
//         if (dayIndex === -1) {
//           timesIndex[dayString] = {};
//           self.days.push(dayString);
//           self.sessions[dayString] = [];
//           self.times[dayString] = [];
//           self.streams[dayString] = [];
//           self.visibleStreams[dayString] = [];
//         }
//
//         // add the stream if necessary
//         if (session.stream && session.stream.name && self.streams[dayString].indexOf(session.stream.name) === -1) {
//           self.streams[dayString].push(session.stream);
//           self.visibleStreams[dayString].push(true);
//         }
//
//         // add the session, create the time array if necessary
//         var index = Object.keys(timesIndex[dayString]).indexOf(session.start.iso);
//         if (index === -1) {
//           timesIndex[dayString][session.start.iso] = timesIndex[dayString].length;
//           self.sessions[dayString].push([session]);
//           self.times[dayString].push(session.start.iso);
//         }
//         else {
//           self.sessions[dayString][index].push(session);
//         }
//       }
//     });
//
//     // we need to order the sessions in each stream
//     this.days.forEach(function (day) {
//       self.sessions[day].forEach(function (time) {
//         if (time.length > 1) {
//           //sort the array on the stream.order value
//           time = time.sort(function (a, b) {
//             if (!a.stream) {
//               a.stream = {order: 0};
//             }
//             if (!b.stream){
//              b.stream = {order: 0};
//             }
//             return a.stream.order - b.stream.order;
//           });
//         }
//       });
//
//       self.streams[day].sort(function (a, b) {
//         return a.order - b.order;
//       });
//     });
//
//     var visibleHeaders = {};
//     this.showStreamName = function (day, stream) {
//       if (Object.keys(visibleHeaders).indexOf(day) === -1) {
//         visibleHeaders[day] = {};
//       }
//
//       // does the stream exist
//       if (!visibleHeaders[day][stream] && stream) {
//         visibleHeaders[day][stream] = true;
//         return true;
//       }
//       else {
//         return false;
//       }
//     };
//   }])
//   .controller('SponsorsController', ['sponsors', '$filter', function (sponsors, $filter) {
//     // var filterSponsors = function (level) {
//     //   return $filter('filter')(sponsors, {level: level});
//     // };
//     // this.sponsors = {
//     //   platinum: filterSponsors(1),
//     //   gold: filterSponsors(2)
//     // };
//
//     var filterSponsors = function (level) {
//       return $filter('filter')(sponsors, {level: level});
//     };
//
//     this.sponsors = {
//         platinum: filterSponsors(1),
//         gold: filterSponsors(2),
//         silver: filterSponsors(3),
//         bronze: filterSponsors(4),
//         media: filterSponsors(5)
//       };
//
//     // filter out the IEA: ZuzYkhH1QC
// //     this.sponsors = sponsors.filter(function (sponsor) {
// //       return sponsor.objectId !== 'ZuzYkhH1QC';
// //     });
//   }])
//   .controller('SponsorOpptyController', ['$http', 'server', function ($http, server) {
//
//     var self = this;
//     this.showForm = true;
//     this.formError = false;
//     this.processing = false;
//
//     this.zipRegex = /(?!.*)/;
//     this.sendPartner = function () {
//       //validate the form
//       if(!self.partnerForm.name || !self.partnerForm.company) {
//         self.formError = true;
//       }
//       else {
//         self.processing = true;
//
//         var partnerContact = {
//           name: self.partnerForm.name,
//           company: self.partnerForm.company,
//           email: self.partnerForm.email,
//           phone: self.partnerForm.phone,
//           actioned: false
//         };
//         // save the media request
//         $http.post(server + '/classes/PartnerRequest', partnerContact)
//           .success(function () {
//             // send an email
//             var email = {
//               subject: 'Sponsorship Request',
//               message: '<h1>New Sponsorship Request</h1>' +
//                 '<h3>Name:</h3> ' + partnerContact.name +
//                 '<h3>Company:</h3> ' + partnerContact.company +
//                 '<h3>Email:</h3> ' + partnerContact.email +
//                 '<h3>Phone:</h3> ' + partnerContact.phone,
//               email: partnerContact.email,
//               name: partnerContact.name,
//               toEmail: 'sponsorship@exportleadership.com',
//               toName: 'Sponsorship'
//             };
//
//
//             $http.post(server + '/functions/contact', email)
//               .success(function () {
//                 self.showForm = false;
//                 self.processing = false;
//               })
//               .error(function (err) {
//                 console.log(err);
//                 self.formError = true;
//                 self.processing = false;
//               });
//           })
//           .error(function (err) {
//             console.log(err);
//             self.formError = true;
//             self.processing = false;
//           });
//       }
//     };
//   }])
//   .controller('FeedbackController', ['$http', 'server',
//     function ($http, server) {
//
//     var self = this;
//     this.showForm = true;
//     this.formError = false;
//     this.processing = false;
//
//     this.zipRegex = /(?!.*)/;
//     this.sendFeedback = function () {
//       //validate the form
//       if(!self.feedbackForm.reason) {
//         self.formError = true;
//       }
//       else {
//         self.processing = true;
//
//         var feedback = {
//           reason: self.feedbackForm.reason,
//           other: self.feedbackForm.other
//         };
//         // save the media request
//         $http.post(server + '/classes/UnsubscribeFeedback', feedback)
//           .success(function () {
//             self.showForm = false;
//             self.processing = false;
//           })
//           .error(function (err) {
//             console.log(err);
//             self.formError = true;
//             self.processing = false;
//           });
//       }
//     };
//   }])
//   .controller('VenueController', ['uiGmapGoogleMapApi', 'mapDetails', function (uiGmapGoogleMapApi, mapDetails) {
//     // maps
//     var self = this;
//     self.map = {};
//     uiGmapGoogleMapApi.then(function() {
//       self.map = mapDetails.map;
//
//       self.marker = mapDetails.crokeParkLocation;
//     });
//   }])
//   .controller('ContactController', ['$http', 'server', function ($http, server) {
//     var self = this;
//     this.showForm = true;
//     this.formError = false;
//     this.processing = false;
//
//     this.zipRegex = /(?!.*)/;
//     this.sendContact = function () {
//       self.processing = true;
//       // validate the form
//       this.contactForm.subject = 'Website Form';
//       $http.post(server + '/functions/contact', this.contactForm)
//         .success(function () {
//           self.showForm = false;
//           self.processing = false;
//         })
//         .error(function (err) {
//           console.log(err);
//           self.formError = true;
//           self.processing = false;
//         });
//     };
//   }])
//   .controller('MediaController', ['$http', 'server', 'countries', function ($http, server, countries) {
//     var self = this;
//     this.countries = countries;
//     this.showForm = true;
//     this.formError = false;
//     this.processing = false;
//
//     this.zipRegex = /(?!.*)/;
//     this.sendMedia = function () {
//       //validate the form
//       if(!self.mediaForm.first || !self.mediaForm.last || !self.mediaForm.email || !self.mediaForm.jobTitle || !self.mediaForm.country || !self.mediaForm.phone) {
//         self.formError = true;
//       }
//       else {
//         self.processing = true;
//
//         var media = {
//           first: self.mediaForm.first,
//           last: self.mediaForm.last,
//           email: self.mediaForm.email,
//           jobTitle: self.mediaForm.jobTitle,
//           company: self.mediaForm.company,
//           country: self.mediaForm.country.code,
//           twitter: self.mediaForm.twitter,
//           phone: self.mediaForm.phone,
//           active: true
//         };
//         // save the media request
//         $http.post(server + '/classes/Media', media)
//           .success(function () {
//             // send an email
//             var email = {
//               subject: 'Media Request',
//               message: '<h1>New Media Request</h1>' +
//                 '<h3>Job Title:</h3> ' + media.jobTitle +
//                 '<h3>Company:</h3> ' + media.company +
//                 '<h3>Country:</h3> ' + media.country +
//                 '<h3>Email:</h3> ' + media.email +
//                 '<h3>Twitter:</h3> ' + media.twitter +
//                 '<h3>Phone:</h3> ' + media.phone,
//               email: media.email,
//               name: media.first + ' ' + media.last
//             };
//
//
//             $http.post(server + '/functions/contact', email)
//               .success(function () {
//                 self.showForm = false;
//                 self.processing = false;
//               })
//               .error(function (err) {
//                 console.log(err);
//                 self.formError = true;
//                 self.processing = false;
//               });
//           })
//           .error(function (err) {
//             console.log(err);
//             self.formError = true;
//             self.processing = false;
//           });
//       }
//     };
//   }])
//   .controller('SpeakerController', ['speaker', 'sessions', function (speaker, sessions) {
//     this.speaker = speaker;
//     this.sessions = sessions;
//   }])
//   .controller('SponsorController', ['sponsor', function (sponsor) {
//     this.sponsor = sponsor;
//   }])
//   .filter('filterArray', [function () {
//     return function (arr, field, unique) {
//       var results = [];
//       if (arr) {
//         arr.forEach(function (item) {
//           var resultItem = item[field];
//
//           if (results.indexOf(resultItem) === -1 || !unique) {
//             results.push(resultItem);
//           }
//         });
//
//         return results;
//       }
//       else {
//         return;
//       }
//
//     };
//   }])
//   .filter('twitter', [function () {
//     return function (url) {
//       var sections = url.split('/');
//       return '@' + sections[sections.length -1];
//     };
//   }])
//   .filter('countryCode', ['countries', function (countries) {
//     return function (countryCode) {
//       var country = countries.filter(function (country) {
//         return country.code === countryCode;
//       });
//       return country[0].country;
//     };
//   }])
//   .filter('words', function () {
//     return function (input, words) {
//       if (isNaN(words)) {
//         return input;
//       }
//       if (words <= 0) {
//         return '';
//       }
//       if (input) {
//         var inputWords = input.split(/\s+/);
//         if (inputWords.length > words) {
//           input = inputWords.slice(0, words).join(' ') + '\u2026 <span class="blueLink">[read more]</span>';
//         }
//       }
//       return input;
//     };
//   })
//   .filter('relativeTime', function () {
//     return function (endDate, extra) {
//       if(!extra) {
//         extra = '';
//       }
//       var timeCount = endDate - Date.now();
//       //convert timeCount to numberofDays
//       var numberOfDays = Math.floor(timeCount/1000/60/60/24);
//
//       if (numberOfDays <= 0) {
//           // return "Sorry, Sold Out";
//           return '';
//       }
//       else if (numberOfDays === 1) {
//         var hours = Math.floor(timeCount/1000/60/60);
//         return hours + ' hour' + (hours === 1 ? '' : 's');
//       }
//       else if (numberOfDays < 14) {
//           // if less than a week, use days
//           return numberOfDays + ' day' + (numberOfDays === 1 ? '' : 's');
//       } else {
//           // round to the closest numberOfDays of weeks
//           var weeks = Math.floor(numberOfDays / 7);
//
//           // pluralize weeks
//           return weeks + ' week' + (weeks === 1 ? '' : 's');
//       }
//     };
//   });

angular.module('templates').run(['$templateCache', function($templateCache) {$templateCache.put('agendas/agendaCreateForm.html','<md-dialog aria-label="Speakers">\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Add Speakers</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ng-click="cancel()">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="agendaForm" submit="addAgenda()">\n    <md-dialog-content>\n      <md-content layout-padding="">\n        <md-input-container class="md-block">\n          <label>Name</label>\n          <input ng-model="newAgenda.name" required name="name">\n          <div ng-messages="agendaForm.name.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A name is required.\n            </div>\n          </div>\n        </md-input-container>\n      </md-content>\n    </md-dialog-content>\n    <md-dialog-actions layout="row">\n      <span flex></span>\n      <md-button ng-click="addAgenda()"> Save </md-button>\n    </md-dialog-actions>\n  </form>\n</md-dialog>\n');
$templateCache.put('agendas/agendaForm.html','<div>\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Agenda Sesssion Details</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ui-sref="conference.agendas">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="agendaCtrl.agendaForm" ng-submit="agendaCtrl.saveAgenda()">\n    <md-content layout-padding="">\n      <md-input-container class="md-block" flex-gt-sm>\n        <label>Name</label>\n        <input ng-model="agendaCtrl.agenda.name" required name="name">\n        <div ng-messages="agendaCtrl.agendaForm.name.$error" role="alert">\n          <div ng-message-exp="[\'required\']">\n            A name is required.\n          </div>\n        </div>\n      </md-input-container>\n\n      <!-- Speakers list -->\n      <md-toolbar class="md-table-toolbar md-accent md-hue-1 shortToolbar">\n        <div class="md-toolbar-tools">\n          <span>Sessions</span>\n          <span flex></span>\n          <md-icon md-font-set="material-icons" ng-click="agendaCtrl.openAgendaSessionDialog($event, {})">add_box</md-icon>\n        </div>\n      </md-toolbar>\n      <md-table-container>\n        <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n        <table md-table md-row-select multiple ng-model="selected" id="sessionList">\n          <!-- <thead md-head md-order="agendas.order" md-on-reorder="getDesserts"> -->\n          <thead md-head>\n            <tr md-row>\n              <th md-column>Name</th>\n              <th md-column>Type</th>\n              <th md-column>Start Time</th>\n              <th md-column>Duration (mins)</th>\n              <th md-column>Speakers</th>\n              <th md-column class="th-edit">Remove</th>\n            </tr>\n          </thead>\n          <tbody md-body>\n            <tr md-row md-select="session" md-select-id="_id" md-auto-select ng-repeat="agendaSession in agendaCtrl.agenda.sessions | sessionDetails:agendaCtrl.sessions">\n              <td md-cell>{{agendaSession.session.name}}</td>\n              <td md-cell>{{agendaSession.sessionType}}</td>\n              <td md-cell>{{agendaSession.start | date:\'hh:mm\'}}</td>\n              <td md-cell>{{agendaSession.duration}}</td>\n              <td md-cell>\n                <ul>\n                  <li ng-repeat="speaker in agendaSession.session.speakerIds | speakerDetails:agendaCtrl.speakers">\n                    {{speaker.first}} {{speaker.last}}, {{speaker.company}}\n                  </li>\n                </ul>\n              </td>\n              <td md-cell>\n                <a ng-click="agendaCtrl.openAgendaSessionDialog($event, agendaSession)"><md-icon md-font-set="material-icons">edit</md-icon></a>\n                <a ng-click="agendaCtrl.removeSession($event, agendaSession)"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </md-table-container>\n    </md-content>\n\n\n    <md-actions layout="row">\n      <span flex></span>\n      <md-button class="md-raised md-danger" ui-sref="conference.agendas">Cancel</md-button>\n      <md-button class="md-raised md-primary" type="submit" md-autofocus>Save</md-button>\n    </md-actions>\n  </form>\n</div>\n');
$templateCache.put('agendas/agendaSessionForm.html','<md-dialog aria-label="Speakers">\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Agenda Session</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ng-click="cancel()">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="agendaForm" submit="saveAgendaSession()">\n    <md-dialog-content>\n      <md-content layout-padding="">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Type</label>\n          <md-select ng-model="agendaSession.sessionType" required name="type">\n            <md-option ng-repeat="type in types" value="{{type}}">\n              {{type}}\n            </md-option>\n          </md-select>\n          <div ng-messages="agendaForm.type.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A type is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block">\n          <label>Start</label>\n          <input ng-model="agendaSession.start" required name="start" type="time">\n          <div ng-messages="agendaForm.start.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A start time is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block">\n          <label>Duration</label>\n          <input ng-model="agendaSession.duration" required name="duration" type="number">\n          <div ng-messages="agendaForm.duration.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A duration is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block">\n          <label>Session</label>\n          <md-select ng-model="agendaSession.sessionId" aria-label="session">\n            <md-option ng-repeat="session in sessions" value="{{session._id}}">\n              {{session.name}}\n            </md-option>\n          </md-select>\n        </md-input-container>\n      </md-content>\n    </md-dialog-content>\n    <md-dialog-actions layout="row">\n      <span flex></span>\n      <md-button ng-click="saveAgendaSession()"> Save </md-button>\n    </md-dialog-actions>\n  </form>\n</md-dialog>\n');
$templateCache.put('agendas/agendas.html','<div ui-view>\n  <md-toolbar class="md-table-toolbar md-accent">\n    <div class="md-toolbar-tools">\n      <span>Agendas</span>\n      <span flex></span>\n      <!-- <md-switch ng-model="agendas.activeFlag" aria-label="Active Switch" class="md-primary" >\n        {{ agendas.activeFlag | activeStatus}}\n      </md-switch> -->\n      <span ng-bind-html="agendas.activeFlag | booleanFlag" ng-click="agendas.toggleActive()"></span>\n      <md-icon md-font-set="material-icons" ng-click="agendas.openAgendaDialog()">add_box</md-icon>\n    </div>\n  </md-toolbar>\n\n  <!-- exact table from live demo -->\n  <md-table-container>\n    <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n    <table md-table md-row-select multiple ng-model="selected" id="agendaList">\n      <!-- <thead md-head md-order="agendas.order" md-on-reorder="getDesserts"> -->\n      <thead md-head md-order="agendas.query.order">\n        <tr md-row>\n          <th md-column><span>Name</span></th>\n          <th md-column>Sessions</th>\n          <th md-column class="th-edit">Primary</th>\n          <th md-column class="th-edit">Edit</th>\n        </tr>\n      </thead>\n      <tbody md-body>\n        <tr md-row md-select="agenda" md-select-id="_id" md-auto-select ng-repeat="agenda in agendas.agendas | activeFlag:agendas.activeFlag | orderBy: \'order\'">\n          <td md-cell>{{agenda.name}}</td>\n          <td md-cell>{{agenda.sessionIds.length}}</td>\n          <td md-cell ng-bind-html="agenda.primary | booleanFlag" ng-click="agendas.confirmPrimary($event, agenda)"></td>\n          <td md-cell>\n            <a ui-sref="conference.agendas.agenda({agendaId: agenda._id})"><md-icon md-font-set="material-icons">edit</md-icon></a>\n            <a ng-click="agendas.removeAgenda($event, agenda)" ng-show="agenda.active"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n            <a ng-click="agendas.reactivateAgenda(agenda)" ng-show="!agenda.active"><md-icon md-font-set="material-icons">undo</md-icon></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </md-table-container>\n\n  <md-table-pagination md-limit="agendas.query.limit" md-limit-options="[30, 50, 100]" md-page="agendas.query.page" md-total="{{agendas.agendas.count}}" md-page-select></md-table-pagination>\n\n</div>\n');
$templateCache.put('conference/conference.html','<md-sidenav class="md-sidenav-left" md-component-id="left"  md-disable-backdrop  md-whiteframe="4">\n  <user-widget user="conf.user"></user-widget>\n\n  <md-list>\n    <md-list-item ui-sref="conference({conference: app.conference})" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">dashboard</md-icon>\n        Dashboard\n    </md-list-item>\n\n    <!-- <md-list-item ui-sref="conference.streams" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">rowing</md-icon>\n          Streams\n    </md-list-item> -->\n\n    <md-list-item ui-sref="conference.speakers" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">people</md-icon>\n          Speakers\n    </md-list-item>\n\n\n    <md-list-item ui-sref="conference.sponsors" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">repeat</md-icon>\n          Sponsors\n    </md-list-item>\n\n\n    <md-list-item ui-sref="conference.agendas" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">today</md-icon>\n          Agendas\n    </md-list-item>\n\n\n    <md-list-item ui-sref="conference.sessions" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">airplay</md-icon>\n          Sessions\n    </md-list-item>\n\n    <md-list-item ui-sref="conference.media" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">signal_wifi_4_bar</md-icon>\n          Media\n    </md-list-item>\n\n    <md-list-item ui-sref="conference.details" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">assignment</md-icon>\n          Conference Details\n    </md-list-item>\n\n    <md-list-item ui-sref="conference.venues" ui-sref-active="active">\n        <md-icon md-font-set="material-icons">account_balance</md-icon>\n          Venues\n    </md-list-item>\n\n  </md-list>\n</md-sidenav>\n\n<md-content flex layout-padding>\n\n  <div ui-view class="contentView">\n    <h1>Dashboard</h1>\n    <p>This is where the magic will happen!</p>\n\n  </div>\n</md-content>\n');
$templateCache.put('conference/conferenceForm.html','<div>\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Conference Details</h2>\n      <span flex></span>\n      <!-- <md-button class="md-icon-button" ui-sref="conference.details">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button> -->\n    </div>\n  </md-toolbar>\n  <form name="conferenceCtrl.conferenceForm" ng-submit="conferenceCtrl.saveConference()">\n    <md-content layout-padding="">\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Name</label>\n          <input ng-model="conferenceCtrl.conference.name" required name="name">\n          <div ng-messages="conferenceCtrl.conferenceForm.name.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A name is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Year</label>\n          <input ng-model="conferenceCtrl.conference.year" required name="year">\n          <div ng-messages="conferenceCtrl.conferenceForm.year.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A year is required.\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n      <md-input-container class="md-block">\n        <label>Contact Email</label>\n        <input required type="email" name="email" ng-model="conferenceCtrl.conference.email" ng-pattern="/^.+@.+\\..+$/" />\n        <div class="hint">This is where media and contact requests go!</div>\n        <div ng-messages="conferenceCtrl.conferenceForm.email.$error" role="alert">\n          <div ng-message-exp="[\'required\',\'pattern\']">\n            Your must enter an e-mail address.\n          </div>\n        </div>\n      </md-input-container>\n\n      <md-input-container class="md-block">\n        <label>Blog Url</label>\n        <input name="blogUrl" ng-model="conferenceCtrl.conference.blogUrl"/>\n        <div class="hint">https://latest.uxdxconf.com/ghost/api/v0.1/posts/?limit=3&client_id=ghost-frontend&client_secret=35e2d4887693</div>\n      </md-input-container>\n\n      <md-input-container class="md-block">\n        <label>About</label>\n        <textarea ng-model="conferenceCtrl.conference.bio" md-select-on-focus rows="5"></textarea>\n      </md-input-container>\n\n\n\n      <!-- <md-input-container class="md-block">\n        <label>Venue</label>\n        <md-select ng-model="conferenceCtrl.conference.venueId">\n          <md-option ng-repeat="venue in conferenceCtrl.venues" value="{{venue._id}}">\n            {{venue.name}}\n          </md-option>\n        </md-select>\n      </md-input-container> -->\n    </md-content>\n    <md-actions layout="row">\n      <span flex></span>\n      <!-- <md-button class="md-raised md-danger" ui-sref="conference">Cancel</md-button> -->\n      <md-button class="md-raised md-primary" type="submit" md-autofocus>Save</md-button>\n    </md-actions>\n  </form>\n</div>\n');
$templateCache.put('conference/conferenceSelector.html','<md-input-container ng-if="confSelector.user">\n  <!--<label>Conference</label>-->\n  <md-select ng-model="confSelector.conferenceId" ng-change="confSelector.goToConference()"  placeholder="Select a conference">\n    <md-option ng-repeat="conf in confSelector.conferences" value="{{conf._id}}">\n      {{conf.name}} {{conf.year}}\n    </md-option>\n  </md-select>\n</md-input-container>');
$templateCache.put('home/home.html','<h1> Welcome to Initiate Network</h1>\n\n<h2>Select a Conference above to get started</h2>\n<md-button class="md-raised md-primary" ng-click="home.showCreateForm()" access="admin">Create a new Conference</md-button>\n<!--<md-icon aria-label="Create a new Conference" class="material-icons md-24 add-conference" ng-click="home.showCreateForm()">-->\n<!--  add box-->\n<!--</md-icon>-->\n\n<div layout="column" ng-cloak class="md-inline-form" ng-if="home.showCreate">\n  <md-content layout-padding>\n    <form name="newConference" ng-submit="home.createConference()" >\n      <md-input-container class="md-block">\n        <label>Conference Name</label>\n        <input ng-model="home.newConference.name" required>\n        <div ng-messages="home.newConference.name.$error" role="alert">\n          <div ng-message-exp="[\'required\']">\n            A conference name is required.\n          </div>\n        </div>\n      </md-input-container>\n      <md-input-container class="md-block">\n        <label>Year</label>\n        <input ng-model="home.newConference.year" ng-pattern="/^[0-9]{4}$/" required maxlength="4">\n        <div ng-messages="home.newConference.year.$error" role="alert">\n          <div ng-message-exp="[\'required\',\'pattern\']">\n            Please enter a four digit year.\n          </div>\n        </div>\n      </md-input-container>\n       <md-input-container class="md-block">\n        <label>Email</label>\n        <input required type="email" name="email" ng-model="home.newConference.email" ng-pattern="/^.+@.+\\..+$/" />\n        <div ng-messages="home.newConference.email.$error" role="alert">\n          <div ng-message-exp="[\'required\',\'pattern\']">\n            Your must enter an e-mail address.\n          </div>\n        </div>\n      </md-input-container>\n       <md-button class="md-raised md-primary" type="submit">Create</md-button>\n       <md-button class="md-raised md-danger" ng-click="home.hideCreateForm()">Cancel</md-button>\n    </form>\n  </md-content>\n</div>\n');
$templateCache.put('image/imageUpload.html','<md-dialog aria-label="UploadImage"  ng-cloak>\n  <form name="speakerCtrl.speakerForm" ng-submit="speakerCtrl.saveSpeaker()">\n    <md-toolbar>\n      <div class="md-toolbar-tools">\n        <h2>Upload Image</h2>\n        <span flex></span>\n        <md-button class="md-icon-button" ng-click="cancel()">\n          <md-icon md-font-set="material-icons">close</md-icon>\n        </md-button>\n      </div>\n    </md-toolbar>\n    <md-dialog-content>\n      <div class="md-dialog-content">\n        <label>IMAGE NAME FROM CALL</label>\n        <div class="button" ngf-select ng-model="file" name="file" ngf-pattern="\'image/*\'"\n          ngf-accept="\'image/*\'" ngf-max-size="2MB" ngf-min-height="300" ngf-max-height="300"\n          ngf-min-width="300" ngf-max-width="300">Select</div>\n      </div>\n    </md-dialog-content>\n    <md-dialog-actions layout="row">\n      <span flex></span>\n      <md-button > Save </md-button>\n    </md-dialog-actions>\n  </form>\n</md-dialog>\n');
$templateCache.put('media/speakerForm.html','<div>\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Speaker Details</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ui-sref="conference.speakers">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="speakerCtrl.speakerForm" ng-submit="speakerCtrl.saveSpeaker()">\n    <md-content layout-padding="">\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>First Name</label>\n          <input ng-model="speakerCtrl.speaker.first" required name="first">\n          <div ng-messages="speakerCtrl.speakerForm.first.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A first name is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Last Name</label>\n          <input ng-model="speakerCtrl.speaker.last" required name="last">\n          <div ng-messages="speakerCtrl.speakerForm.last.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A last name is required.\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n      <md-input-container class="md-block">\n        <label>Email</label>\n        <input required type="email" name="email" ng-model="speakerCtrl.speaker.email" ng-pattern="/^.+@.+\\..+$/" />\n        <div ng-messages="speakerCtrl.speakerForm.email.$error" role="alert">\n          <div ng-message-exp="[\'required\',\'pattern\']">\n            Your must enter an e-mail address.\n          </div>\n        </div>\n      </md-input-container>\n\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Title</label>\n          <input ng-model="speakerCtrl.speaker.jobTitle" required name="jobTitle">\n          <div ng-messages="speakerCtrl.speakerForm.jobTitle.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A job title is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Company</label>\n          <input ng-model="speakerCtrl.speaker.company" required name="company">\n          <div ng-messages="speakerCtrl.speakerForm.company.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A company is required.\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n\n      <md-input-container class="md-block">\n        <label>Country</label>\n        <md-select ng-model="speakerCtrl.speaker.country" required>\n          <md-option ng-repeat="country in speakerCtrl.countries" value="{{country.code}}">\n            {{country.country}}\n          </md-option>\n        </md-select>\n      </md-input-container>\n\n      <md-input-container class="md-block">\n        <label>Bio</label>\n        <textarea ng-model="speakerCtrl.speaker.bio" md-select-on-focus rows="5"></textarea>\n      </md-input-container>\n\n\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Twitter</label>\n          <input ng-model="speakerCtrl.speaker.social.twitter">\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>LinkedIn</label>\n          <input ng-model="speakerCtrl.speaker.social.linkedIn">\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Instagram</label>\n          <input ng-model="speakerCtrl.speaker.social.instagram">\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Github</label>\n          <input ng-model="speakerCtrl.speaker.social.github">\n        </md-input-container>\n      </div>\n      <div layout-gt-sm="row">\n        <md-switch ng-model="speakerCtrl.speaker.keynote" aria-label="Keynote" class="md-primary" >\n          Keynote\n        </md-switch>\n      </div>\n    </md-content>\n    <md-actions layout="row">\n      <span flex></span>\n      <md-button class="md-raised md-danger" ui-sref="conference.speakers">Cancel</md-button>\n      <md-button class="md-raised md-primary" type="submit" md-autofocus>Save</md-button>\n    </md-actions>\n  </form>\n</div>\n');
$templateCache.put('media/speakers.html','<div ui-view>\n  <md-toolbar class="md-table-toolbar md-accent">\n    <div class="md-toolbar-tools">\n      <span>Media</span>\n      <span flex></span>\n    </div>\n  </md-toolbar>\n\n  <!-- exact table from live demo -->\n  <md-table-container>\n    <table md-table md-row-select multiple ng-model="selected" id="mediaList">\n      <!-- <thead md-head md-order="medias.order" md-on-reorder="getDesserts"> -->\n      <thead md-head md-order="medias.query.order">\n        <tr md-row>\n          <th md-column><span>Name</span></th>\n          <th md-column><span>Email</span></th>\n          <th md-column><span>Job Title</span></th>\n          <th md-column>Phone</th>\n          <th md-column><span>Company</span></th>\n          <th md-column><span>Country</span></th>\n          <th md-column>Social</th>\n          <th md-column md-desc>Order</th>\n          <th md-column class="th-edit">Edit</th>\n          <th md-column class="th-edit">Published</th>\n          <th md-column class="th-edit">Images</th>\n        </tr>\n      </thead>\n      <tbody md-body>\n        <tr md-row md-select="media" md-select-id="_id" md-auto-select ng-repeat="media in medias.medias | activeFlag:medias.activeFlag | orderBy: \'order\'">\n          <td md-cell>{{media.first}}</td>\n          <td md-cell>{{media.last}}</td>\n          <td md-cell>{{media.jobTitle}}</td>\n          <td md-cell>{{media.bio | limitTo: 15}}<span ng-if="media.bio && media.bio.length > 15">...</span></td>\n          <td md-cell>{{media.company}}</td>\n          <td md-cell>{{media.country | countryCode}}</td>\n          <td md-cell ng-bind-html="media.social | socialFlag"></td>\n          <td md-cell ng-bind-html="media.keynote | booleanFlag:true"></td>\n          <td md-cell><input type="number" ng-model="media.order" ng-change="medias.saveSpeaker(media)"></td>\n          <td md-cell>\n            <a ui-sref="conference.medias.media({mediaId: media._id})"><md-icon md-font-set="material-icons">edit</md-icon></a>\n            <a ng-click="medias.removeSpeaker($event, media)" ng-show="media.active"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n            <a ng-click="medias.reactivateSpeaker(media)" ng-show="!media.active"><md-icon md-font-set="material-icons">undo</md-icon></a>\n          </td>\n          <td md-cell ng-bind-html="media.published | booleanFlag" ng-click="medias.confirmPublication($event, media)"></td>\n          <td md-cell>\n            <span ng-bind-html="media.profilePic | photoIcon:\'Profile Pic\':\'person_pin\'" ng-click="medias.toggleImage(media, \'profilePic\')"></span>\n            <span ng-bind-html="media.companyLogo | photoIcon:\'Company Logo\':\'business\'" ng-click="medias.toggleImage(media, \'companyLogo\')"></span>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </md-table-container>\n\n  <md-table-pagination md-limit="medias.query.limit" md-limit-options="[30, 50, 100]" md-page="medias.query.page" md-total="{{medias.medias.count}}" md-page-select></md-table-pagination>\n\n</div>\n');
$templateCache.put('sessions/sessionForm.html','<div>\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Session Details</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ui-sref="conference.sessions">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="sessionCtrl.sessionForm" ng-submit="sessionCtrl.saveSession()">\n    <md-content layout-padding="">\n      <md-input-container class="md-block">\n        <label>Name</label>\n        <input ng-model="sessionCtrl.session.name" required name="name">\n        <div ng-messages="sessionCtrl.sessionForm.name.$error" role="alert">\n          <div ng-message-exp="[\'required\']">\n            A session name is required.\n          </div>\n        </div>\n      </md-input-container>\n\n      <md-input-container class="md-block">\n        <label>Description</label>\n        <textarea ng-model="sessionCtrl.session.description" md-select-on-focus rows="5"></textarea>\n      </md-input-container>\n\n\n      <!-- Speakers list -->\n      <md-toolbar class="md-table-toolbar md-accent md-hue-1 shortToolbar">\n        <div class="md-toolbar-tools">\n          <span>Speakers</span>\n          <span flex></span>\n          <md-icon md-font-set="material-icons" ng-click="sessionCtrl.openSpeakerDialog($event)">add_box</md-icon>\n        </div>\n      </md-toolbar>\n      <md-table-container>\n        <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n        <table md-table md-row-select multiple ng-model="selected" id="speakerList">\n          <!-- <thead md-head md-order="sessions.order" md-on-reorder="getDesserts"> -->\n          <thead md-head>\n            <tr md-row>\n              <th md-column><span>First</span></th>\n              <th md-column><span>Last</span></th>\n              <th md-column><span>Company</span></th>\n              <th md-column class="th-edit">Remove</th>\n            </tr>\n          </thead>\n          <tbody md-body>\n            <tr md-row md-select="speaker" md-select-id="_id" md-auto-select ng-repeat="speaker in sessionCtrl.session.speakerIds | speakerDetails:sessionCtrl.speakers">\n              <td md-cell>{{speaker.first}}</td>\n              <td md-cell>{{speaker.last}}</td>\n              <td md-cell>{{speaker.company}}</td>\n              <td md-cell>\n                <!-- <a ng-click="sessionCtrl.editRoom($event, speaker)"><md-icon md-font-set="material-icons">edit</md-icon></a> -->\n                <a ng-click="sessionCtrl.removeSpeaker($event, speaker)"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </md-table-container>\n\n    </md-content>\n    <md-actions layout="row">\n      <span flex></span>\n      <md-button class="md-raised md-danger" ui-sref="conference.sessions">Cancel</md-button>\n      <md-button class="md-raised md-primary" type="submit" md-autofocus>Save</md-button>\n    </md-actions>\n  </form>\n</div>\n');
$templateCache.put('sessions/sessions.html','<div ui-view>\n  <md-toolbar class="md-table-toolbar md-accent">\n    <div class="md-toolbar-tools">\n      <span>Sessions</span>\n      <span flex></span>\n      <!-- <md-switch ng-model="sessions.activeFlag" aria-label="Active Switch" class="md-primary" >\n        {{ sessions.activeFlag | activeStatus}}\n      </md-switch> -->\n      <span ng-bind-html="sessions.activeFlag | booleanFlag" ng-click="sessions.toggleActive()"></span>\n      <a ui-sref="conference.sessions.new"><md-icon md-font-set="material-icons">add_box</md-icon></a>\n    </div>\n  </md-toolbar>\n\n  <!-- exact table from live demo -->\n  <md-table-container>\n    <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n    <table md-table md-row-select multiple ng-model="selected" id="sessionList">\n      <!-- <thead md-head md-order="sessions.order" md-on-reorder="getDesserts"> -->\n      <thead md-head md-order="sessions.query.order">\n        <tr md-row>\n          <th md-column><span>Name</span></th>\n          <th md-column><span>Description</span></th>\n          <th md-column><span>Speakers</span></th>\n          <th md-column class="th-edit">Edit</th>\n        </tr>\n      </thead>\n      <tbody md-body>\n        <tr md-row md-select="session" md-select-id="_id" md-auto-select ng-repeat="session in sessions.sessions | activeFlag:sessions.activeFlag | orderBy: \'name\'">\n          <td md-cell>{{session.name}}</td>\n          <td md-cell>{{session.description}}</td>\n          <td md-cell>\n            <ul>\n              <li ng-repeat="speaker in session.speakerIds | speakerDetails:sessions.speakers">\n                {{speaker.first}} {{speaker.last}}, {{speaker.company}}\n              </li>\n            </ul>\n          </td>\n          <td md-cell>\n            <a ui-sref="conference.sessions.session({sessionId: session._id})"><md-icon md-font-set="material-icons">edit</md-icon></a>\n            <a ng-click="sessions.removeSession($event, session)" ng-show="session.active"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n            <a ng-click="sessions.reactivateSession(session)" ng-show="!session.active"><md-icon md-font-set="material-icons">undo</md-icon></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </md-table-container>\n\n  <md-table-pagination md-limit="sessions.query.limit" md-limit-options="[30, 50, 100]" md-page="sessions.query.page" md-total="{{sessions.sessions.count}}" md-page-select></md-table-pagination>\n\n</div>\n');
$templateCache.put('sessions/speakerForm.html','<md-dialog aria-label="Speakers">\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Add Speakers</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ng-click="cancel()">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <md-dialog-content>\n    <md-content layout-padding="">\n        <md-select ng-model="newSpeaker" ng-change="addSpeaker()" aria-label="speakers">\n          <md-option ng-repeat="speaker in speakers" value="{{speaker._id}}">\n            {{speaker.first}} {{speaker.last}}, {{speaker.company}}\n          </md-option>\n        </md-select>\n    </md-content>\n  </md-dialog-content>\n  <!-- <md-dialog-actions layout="row">\n    <span flex></span>\n    <md-button ng-click="addVenueRoom()"> Save </md-button>\n  </md-dialog-actions> -->\n</md-dialog>\n');
$templateCache.put('speakers/speakerForm.html','<div>\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Speaker Details</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ui-sref="conference.speakers">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="speakerCtrl.speakerForm" ng-submit="speakerCtrl.saveSpeaker()">\n    <md-content layout-padding="">\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>First Name</label>\n          <input ng-model="speakerCtrl.speaker.first" required name="first">\n          <div ng-messages="speakerCtrl.speakerForm.first.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A first name is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Last Name</label>\n          <input ng-model="speakerCtrl.speaker.last" required name="last">\n          <div ng-messages="speakerCtrl.speakerForm.last.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A last name is required.\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n      <md-input-container class="md-block">\n        <label>Email</label>\n        <input required type="email" name="email" ng-model="speakerCtrl.speaker.email" ng-pattern="/^.+@.+\\..+$/" />\n        <div ng-messages="speakerCtrl.speakerForm.email.$error" role="alert">\n          <div ng-message-exp="[\'required\',\'pattern\']">\n            Your must enter an e-mail address.\n          </div>\n        </div>\n      </md-input-container>\n\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Title</label>\n          <input ng-model="speakerCtrl.speaker.jobTitle" required name="jobTitle">\n          <div ng-messages="speakerCtrl.speakerForm.jobTitle.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A job title is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Company</label>\n          <input ng-model="speakerCtrl.speaker.company" required name="company">\n          <div ng-messages="speakerCtrl.speakerForm.company.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A company is required.\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n\n      <md-input-container class="md-block">\n        <label>Country</label>\n        <md-select ng-model="speakerCtrl.speaker.country" required>\n          <md-option ng-repeat="country in speakerCtrl.countries" value="{{country.code}}">\n            {{country.country}}\n          </md-option>\n        </md-select>\n      </md-input-container>\n\n      <md-input-container class="md-block">\n        <label>Bio</label>\n        <textarea ng-model="speakerCtrl.speaker.bio" md-select-on-focus rows="5"></textarea>\n      </md-input-container>\n\n\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Twitter</label>\n          <input ng-model="speakerCtrl.speaker.social.twitter" type="url" name="twitter">\n          <div ng-messages="speakerCtrl.speakerForm.twitter.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>LinkedIn</label>\n          <input ng-model="speakerCtrl.speaker.social.linkedIn" type="url" name="linkedIn">\n          <div ng-messages="speakerCtrl.speakerForm.linkedIn.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Instagram</label>\n          <input ng-model="speakerCtrl.speaker.social.instagram" type="url" name="instagram">\n          <div ng-messages="speakerCtrl.speakerForm.instagram.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Github</label>\n          <input ng-model="speakerCtrl.speaker.social.github" type="url" name="github">\n          <div ng-messages="speakerCtrl.speakerForm.github.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n      <div layout-gt-sm="row">\n        <md-switch ng-model="speakerCtrl.speaker.keynote" aria-label="Keynote" class="md-primary" >\n          Keynote\n        </md-switch>\n      </div>\n    </md-content>\n    <md-actions layout="row">\n      <span flex></span>\n      <md-button class="md-raised md-danger" ui-sref="conference.speakers">Cancel</md-button>\n      <md-button class="md-raised md-primary" type="submit" md-autofocus>Save</md-button>\n    </md-actions>\n  </form>\n</div>\n');
$templateCache.put('speakers/speakers.html','<div ui-view>\n  <md-toolbar class="md-table-toolbar md-accent">\n    <div class="md-toolbar-tools">\n      <span>Speakers</span>\n      <span flex></span>\n      <!-- <md-switch ng-model="speakers.activeFlag" aria-label="Active Switch" class="md-primary" >\n        {{ speakers.activeFlag | activeStatus}}\n      </md-switch> -->\n      <span ng-bind-html="speakers.activeFlag | booleanFlag" ng-click="speakers.toggleActive()"></span>\n      <a ui-sref="conference.speakers.new"><md-icon md-font-set="material-icons">add_box</md-icon></a>\n    </div>\n  </md-toolbar>\n\n  <!-- exact table from live demo -->\n  <md-table-container>\n    <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n    <table md-table md-row-select multiple ng-model="selected" id="speakerList">\n      <!-- <thead md-head md-order="speakers.order" md-on-reorder="getDesserts"> -->\n      <thead md-head md-order="speakers.query.order">\n        <tr md-row>\n          <th md-column><span>First</span></th>\n          <th md-column><span>Last</span></th>\n          <th md-column><span>Title</span></th>\n          <th md-column><span>Bio</span></th>\n          <th md-column><span>Company</span></th>\n          <th md-column><span>Country</span></th>\n          <th md-column>Social</th>\n          <th md-column>Keynote</th>\n          <th md-column md-desc>Order</th>\n          <th md-column class="th-edit">Edit</th>\n          <th md-column class="th-edit">Published</th>\n          <th md-column class="th-edit">Images</th>\n        </tr>\n      </thead>\n      <tbody md-body>\n        <tr md-row md-select="speaker" md-select-id="_id" md-auto-select ng-repeat="speaker in speakers.speakers | activeFlag:speakers.activeFlag | orderBy: \'order\'">\n          <td md-cell>{{speaker.first}}</td>\n          <td md-cell>{{speaker.last}}</td>\n          <td md-cell>{{speaker.jobTitle}}</td>\n          <td md-cell>{{speaker.bio | limitTo: 15}}<span ng-if="speaker.bio && speaker.bio.length > 15">...</span></td>\n          <td md-cell>{{speaker.company}}</td>\n          <td md-cell>{{speaker.country | countryCode}}</td>\n          <td md-cell ng-bind-html="speaker.social | socialFlag"></td>\n          <td md-cell ng-bind-html="speaker.keynote | booleanFlag:true"></td>\n          <td md-cell><input type="number" ng-model="speaker.order" ng-change="speakers.saveSpeaker(speaker)"></td>\n          <td md-cell>\n            <a ui-sref="conference.speakers.speaker({speakerId: speaker._id})"><md-icon md-font-set="material-icons">edit</md-icon></a>\n            <a ng-click="speakers.removeSpeaker($event, speaker)" ng-show="speaker.active"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n            <a ng-click="speakers.reactivateSpeaker(speaker)" ng-show="!speaker.active"><md-icon md-font-set="material-icons">undo</md-icon></a>\n          </td>\n          <td md-cell ng-bind-html="speaker.published | booleanFlag" ng-click="speakers.confirmPublication($event, speaker)"></td>\n          <td md-cell>\n            <span ng-bind-html="speaker.profilePic | photoIcon:\'Profile Pic\':\'person_pin\'" ng-click="speakers.toggleImage(speaker, \'profilePic\')"></span>\n            <span ng-bind-html="speaker.companyLogo | photoIcon:\'Company Logo\':\'business\'" ng-click="speakers.toggleImage(speaker, \'companyLogo\')"></span>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </md-table-container>\n\n  <md-table-pagination md-limit="speakers.query.limit" md-limit-options="[30, 50, 100]" md-page="speakers.query.page" md-total="{{speakers.speakers.count}}" md-page-select></md-table-pagination>\n\n</div>\n');
$templateCache.put('sponsors/sponsorForm.html','<div>\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Sponsor Details</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ui-sref="conference.sponsors">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="sponsorCtrl.sponsorForm" ng-submit="sponsorCtrl.saveSponsor()">\n    <md-content layout-padding="">\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Name</label>\n          <input ng-model="sponsorCtrl.sponsor.name" required name="name">\n          <div ng-messages="sponsorCtrl.sponsorForm.name.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A name is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Level</label>\n          <md-select ng-model="sponsorCtrl.sponsor.level" required name="level">\n            <md-option ng-repeat="level in sponsorCtrl.levels" value="{{level.code}}">\n              {{level.name}}\n            </md-option>\n          </md-select>\n          <div ng-messages="sponsorCtrl.sponsorForm.level.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A level is required.\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n      <md-input-container class="md-block">\n        <label>Url</label>\n        <input type="url" ng-model="sponsorCtrl.sponsor.url" required name="url">\n        <div ng-messages="sponsorCtrl.sponsorForm.url.$error" role="alert">\n          <div ng-message-exp="[\'required\']">\n            A url is required.\n          </div>\n          <div ng-message-exp="[\'url\']">\n            Urls must begin with http://\n          </div>\n        </div>\n      </md-input-container>\n\n      <md-input-container class="md-block">\n        <label>Bio</label>\n        <textarea ng-model="sponsorCtrl.sponsor.bio" md-select-on-focus rows="5"></textarea>\n      </md-input-container>\n\n\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Twitter</label>\n          <input ng-model="sponsorCtrl.sponsor.social.twitter" type="url" name="twitter">\n          <div ng-messages="sponsorCtrl.sponsorForm.twitter.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>LinkedIn</label>\n          <input ng-model="sponsorCtrl.sponsor.social.linkedIn" type="url" name="linkedIn">\n          <div ng-messages="sponsorCtrl.sponsorForm.linkedIn.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Instagram</label>\n          <input ng-model="sponsorCtrl.sponsor.social.instagram" type="url" name="instagram">\n          <div ng-messages="sponsorCtrl.sponsorForm.instagram.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Github</label>\n          <input ng-model="sponsorCtrl.sponsor.social.github" type="url" name="github">\n          <div ng-messages="sponsorCtrl.sponsorForm.github.$error" role="alert">\n            <div ng-message-exp="[\'url\']">\n              You must start with https://\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n    </md-content>\n    <md-actions layout="row">\n      <span flex></span>\n      <md-button class="md-raised md-danger" ui-sref="conference.sponsors">Cancel</md-button>\n      <md-button class="md-raised md-primary" type="submit" md-autofocus>Save</md-button>\n    </md-actions>\n  </form>\n</div>\n');
$templateCache.put('sponsors/sponsors.html','<div ui-view>\n  <md-toolbar class="md-table-toolbar md-accent">\n    <div class="md-toolbar-tools">\n      <span>Sponsors</span>\n      <span flex></span>\n      <!-- <md-switch ng-model="sponsors.activeFlag" aria-label="Active Switch" class="md-primary" >\n        {{ sponsors.activeFlag | activeStatus}}\n      </md-switch> -->\n      <span ng-bind-html="sponsors.activeFlag | booleanFlag" ng-click="sponsors.toggleActive()"></span>\n      <a ui-sref="conference.sponsors.new"><md-icon md-font-set="material-icons">add_box</md-icon></a>\n    </div>\n  </md-toolbar>\n\n  <!-- exact table from live demo -->\n  <md-table-container>\n    <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n    <table md-table md-row-select multiple ng-model="selected" id="sponsorList">\n      <!-- <thead md-head md-order="sponsors.order" md-on-reorder="getDesserts"> -->\n      <thead md-head md-order="sponsors.query.order">\n        <tr md-row>\n          <th md-column><span>Name</span></th>\n          <th md-column><span>Level</span></th>\n          <th md-column><span>Url</span></th>\n          <th md-column><span>Bio</span></th>\n          <th md-column>Social</th>\n          <th md-column md-desc>Order</th>\n          <th md-column class="th-edit">Edit</th>\n          <th md-column class="th-edit">Images</th>\n        </tr>\n      </thead>\n      <tbody md-body>\n        <tr md-row md-select="sponsor" md-select-id="_id" md-auto-select ng-repeat="sponsor in sponsors.sponsors | activeFlag:sponsors.activeFlag | orderBy: [\'level\',\'order\']">\n          <td md-cell>{{sponsor.name}}</td>\n          <td md-cell ng-bind-html="sponsor.level | sponsorLevels"></td>\n          <td md-cell>{{sponsor.url}}</td>\n          <td md-cell>{{sponsor.bio | limitTo: 15}}<span ng-if="sponsor.bio && sponsor.bio.length > 15">...</span></td>\n          <td md-cell ng-bind-html="sponsor.social | socialFlag"></td>\n          <td md-cell><input type="number" ng-model="sponsor.order" ng-change="sponsors.saveSponsor(sponsor)"></td>\n          <td md-cell>\n            <a ui-sref="conference.sponsors.sponsor({sponsorId: sponsor._id})"><md-icon md-font-set="material-icons">edit</md-icon></a>\n            <a ng-click="sponsors.removeSponsor($event, sponsor)" ng-show="sponsor.active"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n            <a ng-click="sponsors.reactivateSponsor(sponsor)" ng-show="!sponsor.active"><md-icon md-font-set="material-icons">undo</md-icon></a>\n          </td>\n          <td md-cell>\n            <span ng-bind-html="sponsor.companyLogo | photoIcon:\'Company Logo\':\'business\'" ng-click="sponsors.toggleImage(sponsor, \'companyLogo\')"></span>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </md-table-container>\n\n  <md-table-pagination md-limit="sponsors.query.limit" md-limit-options="[30, 50, 100]" md-page="sponsors.query.page" md-total="{{sponsors.sponsors.count}}" md-page-select></md-table-pagination>\n\n</div>\n');
$templateCache.put('user/login.html','\n<md-button class="md-raised" ng-href={{login.link}}>Login</md-button>\n');
$templateCache.put('user/userWidget.html','<div class="profile-menu">\n  <div ng-click="userWidget.toggleMenu()" class="profile-details">\n    <div class="profile-pic">\n\n      <!--<img ng-src="{{userWidget.user.image}}" class="md-avatar" alt="{{userWidget.user.name}}" />-->\n      <!-- <img src="./img/svg/avatar-1.svg" alt="{{userWidget.user.name}}" /> -->\n    </div>\n    <div class="profile-info" >\n      {{userWidget.user.name}} <md-icon md-font-set="material-icons" ng-show="!userWidget.showMenu">keyboard_arrow_down</md-icon> <md-icon md-font-set="material-icons" ng-show="userWidget.showMenu">keyboard_arrow_up</md-icon>\n    </div>\n  </div>\n  <md-list ng-cloak ng-show="userWidget.showMenu" class="main-menu">\n    <md-list-item ui-sref="profile">\n      <md-icon md-font-set="material-icons">person</md-icon> View Profile\n    </md-list-item>\n    <md-list-item ui-sref="logout">\n      <md-icon md-font-set="material-icons">exit_to_app</md-icon> Logout\n    </md-list-item>\n\n    <md-divider></md-divider>\n  </md-list>\n</div>\n');
$templateCache.put('venues/venueForm.html','<div>\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Venue Details</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ui-sref="conference.venues">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <form name="venueCtrl.venueForm" ng-submit="venueCtrl.saveVenue()">\n    <md-content layout-padding="">\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Name</label>\n          <input ng-model="venueCtrl.venue.name" required name="name">\n          <div ng-messages="venueCtrl.venueForm.name.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A name is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Capacity</label>\n          <input ng-model="venueCtrl.venue.capacity" name="capacity">\n        </md-input-container>\n      </div>\n\n      <md-input-container class="md-block">\n        <label>Description</label>\n        <textarea ng-model="venueCtrl.venue.description" md-select-on-focus rows="5"></textarea>\n      </md-input-container>\n\n\n      <md-input-container class="md-block">\n        <label>Address</label>\n        <input ng-model="venueCtrl.venue.address" required name="address">\n        <div ng-messages="venueCtrl.venueForm.address.$error" role="alert">\n          <div ng-message-exp="[\'required\']">\n            An address is required.\n          </div>\n        </div>\n      </md-input-container>\n\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>City</label>\n          <input ng-model="venueCtrl.venue.city" required name="city">\n          <div ng-messages="venueCtrl.venueForm.city.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A city is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Country</label>\n          <md-select ng-model="venueCtrl.venue.country" required>\n            <md-option ng-repeat="country in venueCtrl.countries" value="{{country.code}}">\n              {{country.country}}\n            </md-option>\n          </md-select>\n          <div ng-messages="venueCtrl.venueForm.country.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A country is required.\n            </div>\n          </div>\n        </md-input-container>\n      </div>\n\n      <!-- Rooms list -->\n      <div ng-show="!venueCtrl.newVenue">\n        <md-toolbar class="md-table-toolbar md-accent md-hue-1 shortToolbar">\n          <div class="md-toolbar-tools">\n            <span>Venue Rooms</span>\n            <span flex></span>\n            <!-- <md-switch ng-model="venues.activeFlag" aria-label="Active Switch" class="md-primary" >\n              {{ venues.activeFlag | activeStatus}}\n            </md-switch> -->\n            <md-icon md-font-set="material-icons" ng-click="venueCtrl.openVenueRoomDialog($event)">add_box</md-icon>\n          </div>\n        </md-toolbar>\n        <md-table-container>\n          <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n          <table md-table md-row-select multiple ng-model="selected" id="venueRoomList">\n            <!-- <thead md-head md-order="venues.order" md-on-reorder="getDesserts"> -->\n            <thead md-head>\n              <tr md-row>\n                <th md-column><span>Name</span></th>\n                <th md-column><span>Capacity</span></th>\n                <th md-column class="th-edit">Edit</th>\n              </tr>\n            </thead>\n            <tbody md-body>\n              <tr md-row md-select="venueRoom" md-select-id="_id" md-auto-select ng-repeat="venueRoom in venueCtrl.venue.rooms">\n                <td md-cell>{{venueRoom.name}}</td>\n                <td md-cell>{{venueRoom.capacity}}</td>\n                <td md-cell>\n                  <a ng-click="venueCtrl.editRoom($event, venueRoom)"><md-icon md-font-set="material-icons">edit</md-icon></a>\n                  <a ng-click="venueCtrl.removeRoom($event, venueRoom)"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n                </td>\n              </tr>\n            </tbody>\n          </table>\n        </md-table-container>\n      </div>\n\n    </md-content>\n    <md-actions layout="row">\n      <span flex></span>\n      <md-button class="md-raised md-danger" ui-sref="conference.venues">Cancel</md-button>\n      <md-button class="md-raised md-primary" type="submit" md-autofocus>Save</md-button>\n    </md-actions>\n  </form>\n</div>\n');
$templateCache.put('venues/venueRoomForm.html','<md-dialog aria-label="Venue Room">\n  <md-toolbar>\n    <div class="md-toolbar-tools">\n      <h2>Add Venue Room</h2>\n      <span flex></span>\n      <md-button class="md-icon-button" ng-click="cancel()">\n        <md-icon md-font-set="material-icons">close</md-icon>\n      </md-button>\n    </div>\n  </md-toolbar>\n  <md-dialog-content>\n    <md-content layout-padding="">\n      <div layout-gt-sm="row">\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Name</label>\n          <input ng-model="newVenueRoom.name" required name="name">\n          <div ng-messages="venueForm.name.$error" role="alert">\n            <div ng-message-exp="[\'required\']">\n              A name is required.\n            </div>\n          </div>\n        </md-input-container>\n        <md-input-container class="md-block" flex-gt-sm>\n          <label>Capacity</label>\n          <input ng-model="newVenueRoom.capacity" name="capacity">\n        </md-input-container>\n      </div>\n    </md-content>\n  </md-dialog-content>\n  <md-dialog-actions layout="row">\n    <span flex></span>\n    <md-button ng-click="addVenueRoom()"> Save </md-button>\n  </md-dialog-actions>\n</md-dialog>\n');
$templateCache.put('venues/venues.html','<div ui-view>\n  <md-toolbar class="md-table-toolbar md-accent">\n    <div class="md-toolbar-tools">\n      <span>Venues</span>\n      <span flex></span>\n      <!-- <md-switch ng-model="venues.activeFlag" aria-label="Active Switch" class="md-primary" >\n        {{ venues.activeFlag | activeStatus}}\n      </md-switch> -->\n      <span ng-bind-html="venues.activeFlag | booleanFlag" ng-click="venues.toggleActive()"></span>\n      <a ui-sref="conference.venues.new"><md-icon md-font-set="material-icons">add_box</md-icon></a>\n    </div>\n  </md-toolbar>\n\n  <!-- exact table from live demo -->\n  <md-table-container>\n    <!-- <table md-table md-row-select multiple ng-model="selected" md-progress="promise"> -->\n    <table md-table md-row-select multiple ng-model="selected" id="venueList">\n      <!-- <thead md-head md-order="venues.order" md-on-reorder="getDesserts"> -->\n      <thead md-head md-order="venues.query.order">\n        <tr md-row>\n          <th md-column><span>Name</span></th>\n          <th md-column><span>Capacity</span></th>\n          <th md-column><span>City</span></th>\n          <th md-column><span>Country</span></th>\n          <th md-column>Rooms</th>\n          <th md-column class="th-edit">Edit</th>\n        </tr>\n      </thead>\n      <tbody md-body>\n        <tr md-row md-select="venue" md-select-id="_id" md-auto-select ng-repeat="venue in venues.venues | activeFlag:venues.activeFlag">\n          <td md-cell>{{venue.name}}</td>\n          <td md-cell>{{venue.capacity}}</td>\n          <td md-cell>{{venue.city}}</td>\n          <td md-cell>{{venue.country}}</td>\n          <td md-cell>{{venue.rooms.length}}</td>\n          <td md-cell>\n            <a ui-sref="conference.venues.venue({venueId: venue._id})"><md-icon md-font-set="material-icons">edit</md-icon></a>\n            <a ng-click="venues.removeSponsor($event, venue)" ng-show="venue.active"><md-icon md-font-set="material-icons">remove_circle</md-icon></a>\n            <a ng-click="venues.reactivateSponsor(venue)" ng-show="!venue.active"><md-icon md-font-set="material-icons">undo</md-icon></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </md-table-container>\n\n  <md-table-pagination md-limit="venues.query.limit" md-limit-options="[30, 50, 100]" md-page="venues.query.page" md-total="{{venues.venues.count}}" md-page-select></md-table-pagination>\n\n</div>\n');}]);

// var API_URL = 'http://localhost:3000';
// var APP_URL = 'http://localhost:8080/app';
var API_URL = 'https://conf.initiate.network';
var APP_URL = 'http://admin.initiate.network';

angular.module('constants', [])

  .constant('eventTimeZone', '-0000')
  .constant('API', API_URL + '/api/v1')
  .constant('URL', APP_URL)
  .constant('GOOGLE_AUTH', API_URL + '/auth/google')
  .constant('PARTNER', [{
          code: 1,
          name: 'Platinum'
        }, {
          code: 2,
          name: 'Gold'
        }, {
          code: 3,
          name: 'Silver'
        }, {
          code: 4,
          name: 'Bronze'
        }])
  .constant('CLOUDINARY', {
    cloud_name: 'initiate',
    upload_preset: 'y9nqporc'
  })
  .constant('SESSION_TYPES', ['session', 'keynote', 'break'])
  .constant('COUNTRIES', [
    {code: 'AF', country: 'AFGHANISTAN'},
    {code: 'AX', country: 'ÅLAND ISLANDS'},
    {code: 'AL', country: 'ALBANIA'},
    {code: 'DZ', country: 'ALGERIA'},
    {code: 'AS', country: 'AMERICAN SAMOA'},
    {code: 'AD', country: 'ANDORRA'},
    {code: 'AO', country: 'ANGOLA'},
    {code: 'AI', country: 'ANGUILLA'},
    {code: 'AQ', country: 'ANTARCTICA'},
    {code: 'AG', country: 'ANTIGUA AND BARBUDA'},
    {code: 'AR', country: 'ARGENTINA'},
    {code: 'AM', country: 'ARMENIA'},
    {code: 'AW', country: 'ARUBA'},
    {code: 'AU', country: 'AUSTRALIA'},
    {code: 'AT', country: 'AUSTRIA'},
    {code: 'AZ', country: 'AZERBAIJAN'},
    {code: 'BS', country: 'BAHAMAS'},
    {code: 'BH', country: 'BAHRAIN'},
    {code: 'BD', country: 'BANGLADESH'},
    {code: 'BB', country: 'BARBADOS'},
    {code: 'BY', country: 'BELARUS'},
    {code: 'BE', country: 'BELGIUM'},
    {code: 'BZ', country: 'BELIZE'},
    {code: 'BJ', country: 'BENIN'},
    {code: 'BM', country: 'BERMUDA'},
    {code: 'BT', country: 'BHUTAN'},
    {code: 'BO', country: 'BOLIVIA, PLURINATIONAL STATE OF'},
    {code: 'BQ', country: 'BONAIRE, SINT EUSTATIUS AND SABA'},
    {code: 'BA', country: 'BOSNIA AND HERZEGOVINA'},
    {code: 'BW', country: 'BOTSWANA'},
    {code: 'BV', country: 'BOUVET ISLAND'},
    {code: 'BR', country: 'BRAZIL'},
    {code: 'IO', country: 'BRITISH INDIAN OCEAN TERRITORY'},
    {code: 'BN', country: 'BRUNEI DARUSSALAM'},
    {code: 'BG', country: 'BULGARIA'},
    {code: 'BF', country: 'BURKINA FASO'},
    {code: 'BI', country: 'BURUNDI'},
    {code: 'KH', country: 'CAMBODIA'},
    {code: 'CM', country: 'CAMEROON'},
    {code: 'CA', country: 'CANADA'},
    {code: 'CV', country: 'CAPE VERDE'},
    {code: 'KY', country: 'CAYMAN ISLANDS'},
    {code: 'CF', country: 'CENTRAL AFRICAN REPUBLIC'},
    {code: 'TD', country: 'CHAD'},
    {code: 'CL', country: 'CHILE'},
    {code: 'CN', country: 'CHINA'},
    {code: 'CX', country: 'CHRISTMAS ISLAND'},
    {code: 'CC', country: 'COCOS (KEELING) ISLANDS'},
    {code: 'CO', country: 'COLOMBIA'},
    {code: 'KM', country: 'COMOROS'},
    {code: 'CG', country: 'CONGO'},
    {code: 'CD', country: 'CONGO, THE DEMOCRATIC REPUBLIC OF THE'},
    {code: 'CK', country: 'COOK ISLANDS'},
    {code: 'CR', country: 'COSTA RICA'},
    {code: 'CI', country: 'CÔTE D\'IVOIRE'},
    {code: 'HR', country: 'CROATIA'},
    {code: 'CU', country: 'CUBA'},
    {code: 'CW', country: 'CURAÇAO'},
    {code: 'CY', country: 'CYPRUS'},
    {code: 'CZ', country: 'CZECH REPUBLIC'},
    {code: 'DK', country: 'DENMARK'},
    {code: 'DJ', country: 'DJIBOUTI'},
    {code: 'DM', country: 'DOMINICA'},
    {code: 'DO', country: 'DOMINICAN REPUBLIC'},
    {code: 'EC', country: 'ECUADOR'},
    {code: 'EG', country: 'EGYPT'},
    {code: 'SV', country: 'EL SALVADOR'},
    {code: 'GQ', country: 'EQUATORIAL GUINEA'},
    {code: 'ER', country: 'ERITREA'},
    {code: 'EE', country: 'ESTONIA'},
    {code: 'ET', country: 'ETHIOPIA'},
    {code: 'FK', country: 'FALKLAND ISLANDS (MALVINAS)'},
    {code: 'FO', country: 'FAROE ISLANDS'},
    {code: 'FJ', country: 'FIJI'},
    {code: 'FI', country: 'FINLAND'},
    {code: 'FR', country: 'FRANCE'},
    {code: 'GF', country: 'FRENCH GUIANA'},
    {code: 'PF', country: 'FRENCH POLYNESIA'},
    {code: 'TF', country: 'FRENCH SOUTHERN TERRITORIES'},
    {code: 'GA', country: 'GABON'},
    {code: 'GM', country: 'GAMBIA'},
    {code: 'GE', country: 'GEORGIA'},
    {code: 'DE', country: 'GERMANY'},
    {code: 'GH', country: 'GHANA'},
    {code: 'GI', country: 'GIBRALTAR'},
    {code: 'GR', country: 'GREECE'},
    {code: 'GL', country: 'GREENLAND'},
    {code: 'GD', country: 'GRENADA'},
    {code: 'GP', country: 'GUADELOUPE'},
    {code: 'GU', country: 'GUAM'},
    {code: 'GT', country: 'GUATEMALA'},
    {code: 'GG', country: 'GUERNSEY'},
    {code: 'GN', country: 'GUINEA'},
    {code: 'GW', country: 'GUINEA-BISSAU'},
    {code: 'GY', country: 'GUYANA'},
    {code: 'HT', country: 'HAITI'},
    {code: 'HM', country: 'HEARD ISLAND AND MCDONALD ISLANDS'},
    {code: 'VA', country: 'HOLY SEE (VATICAN CITY STATE)'},
    {code: 'HN', country: 'HONDURAS'},
    {code: 'HK', country: 'HONG KONG'},
    {code: 'HU', country: 'HUNGARY'},
    {code: 'IS', country: 'ICELAND'},
    {code: 'IN', country: 'INDIA'},
    {code: 'ID', country: 'INDONESIA'},
    {code: 'IR', country: 'IRAN, ISLAMIC REPUBLIC OF'},
    {code: 'IQ', country: 'IRAQ'},
    {code: 'IE', country: 'IRELAND'},
    {code: 'IM', country: 'ISLE OF MAN'},
    {code: 'IL', country: 'ISRAEL'},
    {code: 'IT', country: 'ITALY'},
    {code: 'JM', country: 'JAMAICA'},
    {code: 'JP', country: 'JAPAN'},
    {code: 'JE', country: 'JERSEY'},
    {code: 'JO', country: 'JORDAN'},
    {code: 'KZ', country: 'KAZAKHSTAN'},
    {code: 'KE', country: 'KENYA'},
    {code: 'KI', country: 'KIRIBATI'},
    {code: 'KP', country: 'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF'},
    {code: 'KR', country: 'KOREA, REPUBLIC OF'},
    {code: 'KW', country: 'KUWAIT'},
    {code: 'KG', country: 'KYRGYZSTAN'},
    {code: 'LA', country: 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC'},
    {code: 'LV', country: 'LATVIA'},
    {code: 'LB', country: 'LEBANON'},
    {code: 'LS', country: 'LESOTHO'},
    {code: 'LR', country: 'LIBERIA'},
    {code: 'LY', country: 'LIBYA'},
    {code: 'LI', country: 'LIECHTENSTEIN'},
    {code: 'LT', country: 'LITHUANIA'},
    {code: 'LU', country: 'LUXEMBOURG'},
    {code: 'MO', country: 'MACAO'},
    {code: 'MK', country: 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF'},
    {code: 'MG', country: 'MADAGASCAR'},
    {code: 'MW', country: 'MALAWI'},
    {code: 'MY', country: 'MALAYSIA'},
    {code: 'MV', country: 'MALDIVES'},
    {code: 'ML', country: 'MALI'},
    {code: 'MT', country: 'MALTA'},
    {code: 'MH', country: 'MARSHALL ISLANDS'},
    {code: 'MQ', country: 'MARTINIQUE'},
    {code: 'MR', country: 'MAURITANIA'},
    {code: 'MU', country: 'MAURITIUS'},
    {code: 'YT', country: 'MAYOTTE'},
    {code: 'MX', country: 'MEXICO'},
    {code: 'FM', country: 'MICRONESIA, FEDERATED STATES OF'},
    {code: 'MD', country: 'MOLDOVA, REPUBLIC OF'},
    {code: 'MC', country: 'MONACO'},
    {code: 'MN', country: 'MONGOLIA'},
    {code: 'ME', country: 'MONTENEGRO'},
    {code: 'MS', country: 'MONTSERRAT'},
    {code: 'MA', country: 'MOROCCO'},
    {code: 'MZ', country: 'MOZAMBIQUE'},
    {code: 'MM', country: 'MYANMAR'},
    {code: 'NA', country: 'NAMIBIA'},
    {code: 'NR', country: 'NAURU'},
    {code: 'NP', country: 'NEPAL'},{code: 'NL', country: 'NETHERLANDS'},{code: 'NC', country: 'NEW CALEDONIA'},{code: 'NZ', country: 'NEW ZEALAND'},{code: 'NI', country: 'NICARAGUA'},{code: 'NE', country: 'NIGER'},{code: 'NG', country: 'NIGERIA'},{code: 'NU', country: 'NIUE'},{code: 'NF', country: 'NORFOLK ISLAND'},{code: 'MP', country: 'NORTHERN MARIANA ISLANDS'},{code: 'NO', country: 'NORWAY'},{code: 'OM', country: 'OMAN'},{code: 'PK', country: 'PAKISTAN'},{code: 'PW', country: 'PALAU'},{code: 'PS', country: 'PALESTINE, STATE OF'},{code: 'PA', country: 'PANAMA'},{code: 'PG', country: 'PAPUA NEW GUINEA'},{code: 'PY', country: 'PARAGUAY'},{code: 'PE', country: 'PERU'},{code: 'PH', country: 'PHILIPPINES'},{code: 'PN', country: 'PITCAIRN'},{code: 'PL', country: 'POLAND'},{code: 'PT', country: 'PORTUGAL'},{code: 'PR', country: 'PUERTO RICO'},{code: 'QA', country: 'QATAR'},{code: 'RE', country: 'RÉUNION'},{code: 'RO', country: 'ROMANIA'},{code: 'RU', country: 'RUSSIAN FEDERATION'},{code: 'RW', country: 'RWANDA'},{code: 'BL', country: 'SAINT BARTHÉLEMY'},{code: 'SH', country: 'SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA'},{code: 'KN', country: 'SAINT KITTS AND NEVIS'},{code: 'LC', country: 'SAINT LUCIA'},{code: 'MF', country: 'SAINT MARTIN (FRENCH PART)'},{code: 'PM', country: 'SAINT PIERRE AND MIQUELON'},{code: 'VC', country: 'SAINT VINCENT AND THE GRENADINES'},{code: 'WS', country: 'SAMOA'},{code: 'SM', country: 'SAN MARINO'},{code: 'ST', country: 'SAO TOME AND PRINCIPE'},{code: 'SA', country: 'SAUDI ARABIA'},{code: 'SN', country: 'SENEGAL'},{code: 'RS', country: 'SERBIA'},{code: 'SC', country: 'SEYCHELLES'},{code: 'SL', country: 'SIERRA LEONE'},{code: 'SG', country: 'SINGAPORE'},{code: 'SX', country: 'SINT MAARTEN (DUTCH PART)'},{code: 'SK', country: 'SLOVAKIA'},{code: 'SI', country: 'SLOVENIA'},{code: 'SB', country: 'SOLOMON ISLANDS'},{code: 'SO', country: 'SOMALIA'},{code: 'ZA', country: 'SOUTH AFRICA'},{code: 'GS', country: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS'},{code: 'SS', country: 'SOUTH SUDAN'},{code: 'ES', country: 'SPAIN'},{code: 'LK', country: 'SRI LANKA'},{code: 'SD', country: 'SUDAN'},{code: 'SR', country: 'SURINAME'},{code: 'SJ', country: 'SVALBARD AND JAN MAYEN'},{code: 'SZ', country: 'SWAZILAND'},{code: 'SE', country: 'SWEDEN'},{code: 'CH', country: 'SWITZERLAND'},{code: 'SY', country: 'SYRIAN ARAB REPUBLIC'},{code: 'TW', country: 'TAIWAN, PROVINCE OF CHINA'},{code: 'TJ', country: 'TAJIKISTAN'},{code: 'TZ', country: 'TANZANIA, UNITED REPUBLIC OF'},{code: 'TH', country: 'THAILAND'},{code: 'TL', country: 'TIMOR-LESTE'},{code: 'TG', country: 'TOGO'},{code: 'TK', country: 'TOKELAU'},{code: 'TO', country: 'TONGA'},{code: 'TT', country: 'TRINIDAD AND TOBAGO'},{code: 'TN', country: 'TUNISIA'},{code: 'TR', country: 'TURKEY'},{code: 'TM', country: 'TURKMENISTAN'},{code: 'TC', country: 'TURKS AND CAICOS ISLANDS'},{code: 'TV', country: 'TUVALU'},{code: 'UG', country: 'UGANDA'},{code: 'UA', country: 'UKRAINE'},{code: 'AE', country: 'UNITED ARAB EMIRATES'},{code: 'GB', country: 'UNITED KINGDOM'},{code: 'US', country: 'UNITED STATES'},{code: 'UM', country: 'UNITED STATES MINOR OUTLYING ISLANDS'},{code: 'UY', country: 'URUGUAY'},{code: 'UZ', country: 'UZBEKISTAN'},{code: 'VU', country: 'VANUATU'},{code: 'VE', country: 'VENEZUELA, BOLIVARIAN REPUBLIC OF'},{code: 'VN', country: 'VIET NAM'},{code: 'VG', country: 'VIRGIN ISLANDS, BRITISH'},{code: 'VI', country: 'VIRGIN ISLANDS, U.S.'},{code: 'WF', country: 'WALLIS AND FUTUNA'},{code: 'EH', country: 'WESTERN SAHARA'},{code: 'YE', country: 'YEMEN'},{code: 'ZM', country: 'ZAMBIA'},{code: 'ZW', country: 'ZIMBABWE'}
  ])
  ;

// .value('mapDetails', {
//     map: {
//       center: {
//         latitude: 53.360907,
//         longitude: -6.251571
//       },
//       zoom: 15,
//       options: {
//         scrollwheel: false,
//         panControl: false,
//         zoomControlOptions: {
//           // style: 'LARGE'
//         }
//       }
//     },
//     crokeParkLocation: {
//       coords: {
//         latitude: 53.360907,
//         longitude: -6.251166
//       },
//       id: 'croke',
//       options: {
//         labelContent: '<h3>10 -11 February 2016</h3><h4>Croke Park, Jones\' Road, Dublin 3</h4>',
//         labelAnchor: '170 -20',
//         labelClass: 'mapLabel',
//         icon: 'images/map-marker.png'
//       }
//     }
//   })

angular.module('app.filters', [])

.filter('booleanFlag', function ($sce) {
  'ngInject';

  return function (flag, hideFalse) {
    // var icon = flag ?
    //   '<md-icon md-font-set="material-icons" class="success">check</md-icon>' :
    //   '<md-icon md-font-set="material-icons" class="danger">close</md-icon>';

    // var icon = flag ?
    //   '<md-icon md-font-icon="fa-check" class="fa success" alt="Yes"></md-icon>' :
    //   '<md-icon md-font-icon="fa-close" class="fa danger" alt="No"></md-icon>' ;


    var icon = flag ?
      '<md-icon class="fa fa-check success" alt="Yes"></md-icon>' :
      '<md-icon class="fa fa-close danger" alt="No"></md-icon>' ;
    if (hideFalse && !flag) icon = '';
    return $sce.trustAsHtml(icon);
  };
})
.filter('socialFlag', function ($sce) {
  'ngInject';

  return function (social) {
    var icons = '';
    if(!social) social = {};
    Object.keys(social).forEach(function (socialSite) {
      // icons += '<md-icon md-font-set="material-icons">' + socialSite + '</md-icon>';
      // icons += '<md-icon md-font-icon="fa-' + socialSite + '" class="fa" alt="' + socialSite + '"></md-icon>';
      icons += '<md-icon md-font-icon="fa-' + socialSite.toLowerCase() + '" class="fa fa-' + socialSite.toLowerCase() + '" alt="' + socialSite + '"></md-icon>';
    });
    // console.log($sce.trustAsHtml(icons))
    // return icons;
    return $sce.trustAsHtml(icons);
  };
})
.filter('activeFlag', function () {
  return function (array, flag) {
    return array.filter(function (item) {
      return item.active === flag;
    });
  };
})
.filter('activeStatus', function () {
  return function (flag) {
    return flag ? 'Active' : 'Inactive';
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
.filter('sponsorLevels', function (PARTNER) {
  'ngInject';

  return function (level) {
    return PARTNER[level-1].name;
  };
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
.filter('speakerDetails', function () {
  return function(speakerIds, speakers) {
    if(!speakerIds || !speakers) return true;
    var populatedArray = speakerIds.map(function (speakerId) {
      var x = speakers.filter(function (speaker) {
        return speaker._id.toString() === speakerId;
      });
      return x[0];
    })
    // console.log(populatedArray);
    return populatedArray;
  }
})
;


angular.module('collapse', [])

  .directive('collapse', ['$animate', function ($animate) {

    return {
      link: function (scope, element, attrs) {
        function expand() {
          element.removeClass('collapse').addClass('collapsing');
          $animate.addClass(element, 'in', {
            to: { height: element[0].scrollHeight + 'px' }
          }).then(expandDone);
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.css({height: 'auto'});
        }

        function collapse() {
          element
            // IMPORTANT: The height must be set before adding "collapsing" class.
            // Otherwise, the browser attempts to animate from height 0 (in
            // collapsing class) to the given height here.
            .css({height: element[0].scrollHeight + 'px'})
            // initially all panel collapse have the collapse class, this removal
            // prevents the animation from jumping to collapsed state
            .removeClass('collapse')
            .addClass('collapsing');

          $animate.removeClass(element, 'in', {
            to: {height: '0'}
          }).then(collapseDone);
        }

        function collapseDone() {
          element.css({height: '0'}); // Required so that collapse works when animation is disabled
          element.removeClass('collapsing');
          element.addClass('collapse');
        }

        scope.$watch(attrs.collapse, function (shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);
'use strict';
//
// import loginTemplate from './login.html';
// import widgetTemplate from './userWidget.html';

angular.module('user', [])
  .config(function ($stateProvider) {
    'ngInject';

    $stateProvider
      .state('login', {
        url: '/login',
        // templateUrl: loginTemplate,
        templateUrl: 'user/login.html',
        controller: function (GOOGLE_AUTH) {
          'ngInject';
          this.link = GOOGLE_AUTH;
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
      // templateUrl: widgetTemplate,
      templateUrl: 'user/userWidget.html',
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
    .state('conference.details', {
      url: '/details',
      // templateUrl: detailsTemplate,
      templateUrl: 'conference/conferenceForm.html',
      controller: 'ConferenceDetailsCtrl as conferenceCtrl',
      resolve: {
        $title: function () { return 'Conference Details'; },
        //TODO: refactor so that we have a conference service - no need to re-query every time
        conference: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).get(function (conference) {
            return conference;
          });
        },
        venues: function (Restangular) {
          'ngInject';
          return Restangular.all('venues').getList();
        }
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
.controller('ConferenceDetailsCtrl', function (conference, venues, Restangular, $state, $stateParams, $rootScope) {
  'ngInject';


  this.conference = Restangular.copy(conference);
  this.venues = venues;

  this.saveConference = function () {
    this.conference.put().then(function (stream) {
      $rootScope.$emit('conferenceChange', conference);
      $state.go('conference');
    });
  };

})
;

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

  this.saveSpeaker = function (speaker) {
    speaker.put().then(function (speaker) {
      $rootScope.$emit('speakerChange', speaker);
      $state.go('conference.speakers');
    });
  };;

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
;

angular.module('imageMgr', [])
.factory('imageService', function ($http, CLOUDINARY, $window) {
  'ngInject';

  return {
    /**
      Details: {
        className: cloudinary Folder
        alt: hover value
        fieldName: database field name
      }
    **/
    uploadImage: function (details, callback) {

      cloudinary.openUploadWidget({
        cloud_name: CLOUDINARY.cloud_name,
        upload_preset: CLOUDINARY.upload_preset,
        theme: 'minimal',
        sources: ['local'],
        multiple: false,
        folder: details.className,
        context: {
          alt: details.alt
        }
      },
      function(err, result) {
        if (err) {
          return callback(err);
        }
        else {
          details.object[details.fieldName] = result[0].secure_url;
          details.object.save();
        }
      });
    },

    removeImage: function (details) {
      // alert the user
      if($window.confirm('Are you sure you want to delete ' + details.name + '\'s ' + details.filedName + '?')){
        details.object[details.fieldName] = '';
        details.object.save();
      }
    }
  };
});

'use strict';

angular.module('sponsors', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conference.sponsors', {
      url: '/sponsors',
      // templateUrl: sponsorsTemplate,
      templateUrl: 'sponsors/sponsors.html',
      controller: 'SponsorsCtrl as sponsors',
      resolve: {
        $title: function () { return 'Sponsors'; },
        sponsors: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('sponsors').getList();
        }
      }
    })
    .state('conference.sponsors.new', {
      url: '/new',
      // templateUrl: sponsorFormTemplate,
      templateUrl: 'sponsors/sponsorForm.html',
      controller: 'SponsorFormCtrl as sponsorCtrl',
      resolve: {
        $title: function () { return 'Create a New Sponsor'; },
        sponsor: function () { return {} }
      },


    })
    .state('conference.sponsors.sponsor', {
      url: '/:sponsorId',
      // templateUrl: sponsorFormTemplate,
      templateUrl: 'sponsors/sponsorForm.html',
      controller: 'SponsorFormCtrl as sponsorCtrl',
      resolve: {
        sponsor: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).one('sponsors', $stateParams.sponsorId).get(function (sponsor) {
            return sponsor;
          });


        },
        $title: function () { return 'Edit Sponsor'; },
      }
    })
    ;
})
.controller('SponsorsCtrl', function (sponsors, Restangular, $state, $stateParams, $mdMedia, $mdDialog, $rootScope, imageService) {
  'ngInject';
  var self = this;
  // this.sponsors = Restangular.copy(sponsors);
  this.sponsors = sponsors;

  $rootScope.$on('sponsorChange', function (event, sponsor) {
    var newSponsor = true;
    self.sponsors.map(function (s, index) {
      if(s._id === sponsor._id) {
        newSponsor = false;
        self.sponsors.splice(index, 1, sponsor);
      }
    });
    if (newSponsor) self.sponsors.push(sponsor);
  });
  $rootScope.$on('removedSponsor', function (event, sponsor) {
    self.sponsors = self.sponsors.filter(function (s) {
      if(s._id !== sponsor._id) return true;
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

  // this.confirmPublication = function(ev, sponsor) {
  //   var action = sponsor.published ? 'un-publish' : 'publication';
  //   // Appending dialog to document.body to cover sidenav in docs app
  //   var confirm = $mdDialog.confirm()
  //         .title('Confirm ' + action)
  //         .textContent('Confirm ' + action + ' of ' + sponsor.name)
  //         .ariaLabel('Sponsor ' + action)
  //         .targetEvent(ev)
  //         .ok('Yes')
  //         .cancel('Cancel');
  //   $mdDialog.show(confirm).then(function() {
  //     sponsor.published = !sponsor.published;
  //     if (!sponsor.published) {
  //       sponsor.one('unpublish').get().then(function () {
  //
  //       }, function (err) {
  //         sponsor.published = !sponsor.published;
  //         $mdDialog.show(
  //            $mdDialog.alert()
  //             .parent(angular.element(document.querySelector('#sponsorList')))
  //             .clickOutsideToClose(true)
  //             .title('Cannot Unpublish')
  //             .textContent(err)
  //             .ariaLabel('Unpublish Error')
  //             .ok('Got it!')
  //             .targetEvent(ev)
  //           );
  //       });
  //     }
  //     else {
  //       sponsor.save();
  //     }
  //   });
  // };

  this.removeSponsor = function(ev, sponsor) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm De-activation')
          .textContent('Confirm de-activation of ' + sponsor.name)
          .ariaLabel('Sponsor De-activation')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      sponsor.remove().then(function () {
        //update the active flag against the sponsor
        sponsor.active = false;
      }, function (err) {
        $mdDialog.show(
           $mdDialog.alert()
            .parent(angular.element(document.querySelector('#sponsorList')))
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

  this.reactivateSponsor = function (sponsor) {
    sponsor.active = true;
    sponsor.save();

  }

  this.saveSponsor = function (sponsor) {
    sponsor.put().then(function (sponsor) {
      $rootScope.$emit('sponsorChange', sponsor);
      $state.go('conference.sponsors');
    });
  };;

  this.toggleImage = function (sponsor, fieldName) {
    //check if the image is ok
    if (sponsor[fieldName]) {
      imageService.removeImage({
        className: 'Sponsor',
        fieldName: fieldName,
        name: sponsor.name,
        object: sponsor
      });
    } else {
      imageService.uploadImage({
        className: 'Sponsor',
        fieldName: fieldName,
        alt: sponsor.name,
        object: sponsor
      }, function (err, imageDetails) {
        if (err) {
          // TODO: present error to the user
          console.log(err);
        }
        else {
          sponsor[fieldName] = imageDetails;
          sponsor.save();
        }
      });
    }
  }
})

.controller('SponsorFormCtrl', function (sponsor, Restangular, $state, $stateParams, $rootScope, PARTNER) {
  'ngInject';

  var newSponsor = true;
  this.sponsor = Restangular.copy(sponsor);
  this.levels = PARTNER;

  // same controller used for new sponsors and editing sponsors
  if (this.sponsor.name) newSponsor = false;
  this.saveSponsor = function () {
    if (newSponsor) {
      Restangular.one('conferences', $stateParams.confId).all('sponsors').post(this.sponsor).then(function (sponsor) {
        // push the new sponsor into the parent sponsors list.
        $rootScope.$emit('sponsorChange', sponsor);
        $state.go('conference.sponsors');
      });
    }
    else {
      this.sponsor.put().then(function (sponsor) {
        $rootScope.$emit('sponsorChange', sponsor);
        $state.go('conference.sponsors');
      });
    }
  };

  // this.removeSponsor = function () {
  //   Restangular.one('conferences', $stateParams.confId).one('sponsors', $stateParams.sponsorId).remove().then(function (sponsor) {
  //     $rootScope.$emit('removeSponsor', sponsor);
  //     $state.go('conference.sponsors');
  //   });
  // };

})
;

'use strict';

angular.module('venues', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conference.venues', {
      url: '/venues',
      // templateUrl: venuesTemplate,
      templateUrl: 'venues/venues.html',
      controller: 'VenuesCtrl as venues',
      resolve: {
        $title: function () { return 'Venues'; },
        venues: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.all('venues').getList();
        }
      }
    })
    .state('conference.venues.new', {
      url: '/new',
      // templateUrl: venueFormTemplate,
      templateUrl: 'venues/venueForm.html',
      controller: 'VenueFormCtrl as venueCtrl',
      resolve: {
        $title: function () { return 'Create a New Venue'; },
        venue: function () { return {} }
      },


    })
    .state('conference.venues.venue', {
      url: '/:venueId',
      // templateUrl: venueFormTemplate,
      templateUrl: 'venues/venueForm.html',
      controller: 'VenueFormCtrl as venueCtrl',
      resolve: {
        venue: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('venues', $stateParams.venueId).get(function (venue) {
            return venue;
          });
        },
        $title: function () { return 'Edit Venue'; },
      }
    })
    ;
})
.controller('VenuesCtrl', function (venues, Restangular, $state, $stateParams, $mdMedia, $mdDialog, $rootScope) {
  'ngInject';
  var self = this;
  // this.venues = Restangular.copy(venues);
  this.venues = venues;

  $rootScope.$on('venueChange', function (event, venue) {
    var newVenue = true;
    self.venues.map(function (s, index) {
      if(s._id === venue._id) {
        newVenue = false;
        self.venues.splice(index, 1, venue);
      }
    });
    if (newVenue) self.venues.push(venue);
  });
  $rootScope.$on('removedVenue', function (event, venue) {
    self.venues = self.venues.filter(function (s) {
      if(s._id !== venue._id) return true;
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

  this.removeVenue = function(ev, venue) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm De-activation')
          .textContent('Confirm de-activation of ' + venue.name)
          .ariaLabel('Venue De-activation')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      venue.remove().then(function () {
        //update the active flag against the venue
        venue.active = false;
      }, function (err) {
        $mdDialog.show(
           $mdDialog.alert()
            .parent(angular.element(document.querySelector('#venueList')))
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

  this.reactivateVenue = function (venue) {
    venue.active = true;
    venue.save();
  }
})

.controller('VenueFormCtrl', function (venue, Restangular, $state, $stateParams, $rootScope, COUNTRIES, $mdDialog, $scope) {
  'ngInject';

  var self = this;
  this.newVenue = true;
  this.venue = Restangular.copy(venue);
  this.countries = COUNTRIES;

  // same controller used for new venues and editing venues
  if (this.venue.name) this.newVenue = false;
  this.saveVenue = function () {
    if (this.newVenue) {
      Restangular.all('venues').post(this.venue).then(function (venue) {
        // push the new venue into the parent venues list.
        $rootScope.$emit('venueChange', venue);
        $state.go('conference.venues');
      });
    }
    else {
      this.venue.put().then(function (venue) {
        $rootScope.$emit('venueChange', venue);
        $state.go('conference.venues');
      });
    }
  };

  this.openVenueRoomDialog = function(ev) {
    $mdDialog.show({
      controller: VenueRoomFormCtrl,
      templateUrl: 'venues/venueRoomForm.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        newVenueRoom: {}
      }
      // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(newVenueRoom) {
      if(newVenueRoom) {
        Restangular.one('venues', self.venue._id).all('venueRooms').post(newVenueRoom).then(function (venue) {
          self.venue = venue;
        });
      }
    });
  }

  function VenueRoomFormCtrl($scope, $mdDialog, newVenueRoom) {
    $scope.newVenueRoom = newVenueRoom;
    $scope.addVenueRoom = function () {
      $mdDialog.hide($scope.newVenueRoom);
    }

    $scope.cancel = function () {
      $mdDialog.cancel();
    }


  }

  this.editRoom = function(ev, room) {
    $mdDialog.show({
      controller: VenueRoomFormCtrl,
      templateUrl: 'venues/venueRoomForm.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        newVenueRoom: room
      }
      // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(newVenueRoom) {

      // var room = Restangular.copy(newVenueRoom);
      // room.put().then(function (venue) {
      //   self.venue = venue;
      // });
      var room = {
        name: newVenueRoom.name,
        capacity: newVenueRoom.capacity
      }
      Restangular.one('venues', self.venue._id).one('venueRooms', newVenueRoom._id).customPUT(room).then(function (venue) {
        self.venue = venue;
      });
    });
  }

  this.removeRoom = function (ev, room) {
    var confirm = $mdDialog.confirm()
          .title('Confirm Deletion')
          .textContent('Confirm deletion of ' + room.name + '. This cannot be undone!')
          .ariaLabel('Venue Room Deletion')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      var index = self.venue.rooms.indexOf(room);
      self.venue.rooms.splice(index, 1);
      Restangular.one('venues', self.venue._id).one('venueRooms', room._id).remove();
    });
  }

})
;

'use strict';
// import sessionsTemplate from './sessions.html';
// import sessionFormTemplate from './sessionForm.html';

angular.module('sessions', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conference.sessions', {
      url: '/sessions',
      // templateUrl: sessionsTemplate,
      templateUrl: 'sessions/sessions.html',
      controller: 'SessionsCtrl as sessions',
      resolve: {
        $title: function () { return 'Sessions'; },
        sessions: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('sessions').getList();
        },
        speakers: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('speakers').getList();
        }
      }
    })
    .state('conference.sessions.new', {
      url: '/new',
      // templateUrl: sessionFormTemplate,
      templateUrl: 'sessions/sessionForm.html',
      controller: 'SessionFormCtrl as sessionCtrl',
      resolve: {
        $title: function () { return 'Create a New Session'; },
        session: function () { return {} },
        speakers: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('speakers').getList();
        }
      },


    })
    .state('conference.sessions.session', {
      url: '/:sessionId',
      // templateUrl: sessionFormTemplate,
      templateUrl: 'sessions/sessionForm.html',
      controller: 'SessionFormCtrl as sessionCtrl',
      resolve: {
        session: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).one('sessions', $stateParams.sessionId).get(function (session) {
            return session;
          });
        },
        speakers: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('speakers').getList();
        },
        // $title: function () { return 'Edit Session: ' + session.first + ' ' + session.last; },
        $title: function () { return 'Edit Session'; },
      }
    })
    ;
})
.controller('SessionsCtrl', function (sessions, Restangular, $state, $stateParams, $mdMedia, $mdDialog, $rootScope, imageService, speakers) {
  'ngInject';
  var self = this;
  // this.sessions = Restangular.copy(sessions);
  this.sessions = sessions;
  this.speakers = speakers;

  $rootScope.$on('sessionChange', function (event, session) {
    var newSession = true;
    self.sessions.map(function (s, index) {
      if(s._id === session._id) {
        newSession = false;
        self.sessions.splice(index, 1, session);
      }
    });
    if (newSession) self.sessions.push(session);
  });
  $rootScope.$on('removedSession', function (event, session) {
    self.sessions = self.sessions.filter(function (s) {
      if(s._id !== session._id) return true;
    });
  });


  // hide inactive by default
  this.activeFlag = true;
  this.toggleActive = function () {
    this.activeFlag = !this.activeFlag;
  }

  this.query = {
    limit: 30,
    page: 1
  };

  this.removeSession = function(ev, session) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm De-activation')
          .textContent('Confirm de-activation of ' + session.name)
          .ariaLabel('Session De-activation')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      session.remove().then(function () {
        //update the active flag against the session
        session.active = false;
      }, function (err) {
        $mdDialog.show(
           $mdDialog.alert()
            .parent(angular.element(document.querySelector('#sessionList')))
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

  this.reactivateSession = function (session) {
    session.active = true;
    session.save();

  }
})

.controller('SessionFormCtrl', function (session, Restangular, $state, $stateParams, $rootScope, speakers, $mdDialog) {
  'ngInject';

  var self = this;
  var newSession = true;
  this.session = Restangular.copy(session);
  this.speakers = speakers;

  // same controller used for new sessions and editing sessions
  if (this.session.name) newSession = false;
  this.saveSession = function () {
    // create a new
    if (newSession) {
      Restangular.one('conferences', $stateParams.confId).all('sessions').post(this.session).then(function (session) {
        // push the new session into the parent sessions list.
        $rootScope.$emit('sessionChange', session);
        $state.go('conference.sessions');
      });
    }
    else {
      this.session.put().then(function (session) {
        $rootScope.$emit('sessionChange', session);
        $state.go('conference.sessions');
      });
    }
  };

  this.openSpeakerDialog = function(ev) {
    $mdDialog.show({
      controller: SpeakerFormCtrl,
      templateUrl: 'sessions/speakerForm.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(newSpeakerId) {
      if(newSpeakerId) {
        if(!self.session.speakerIds) self.session.speakerIds = [];
        self.session.speakerIds.push(newSpeakerId);
        // Restangular.one('venues', self.venue._id).all('venueRooms').post(newSpeaker).then(function (venue) {
        //   self.venue = venue;
        // });
      }
    });
  }

  function SpeakerFormCtrl($scope, $mdDialog) {
    $scope.speakers = speakers.filter(function (speaker) {
      return speaker.active;
    });
    $scope.addSpeaker = function () {
      $mdDialog.hide($scope.newSpeaker);
    }

    $scope.cancel = function () {
      $mdDialog.cancel();
    }
  }

  this.removeSpeaker = function (ev, speaker) {
    var confirm = $mdDialog.confirm()
          .title('Confirm Removal')
          .textContent('Confirm removal of ' + speaker.first + '.')
          .ariaLabel('Speaker Removal')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      var index = self.session.speakerIds.indexOf(speaker._id);
      self.session.speakerIds.splice(index, 1);
      // Restangular.one('venues', self.venue._id).one('venueRooms', speaker._id).remove();
    });
  }

})
;

'use strict';

angular.module('agendas', [])
.config(function ($stateProvider) {
  'ngInject';

  $stateProvider
    .state('conference.agendas', {
      url: '/agendas',
      // templateUrl: agendasTemplate,
      templateUrl: 'agendas/agendas.html',
      controller: 'AgendasCtrl as agendas',
      resolve: {
        $title: function () { return 'Agendas'; },
        agendas: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).all('agendas').getList();
        }
      }
    })
    .state('conference.agendas.agenda', {
      url: '/:agendaId',
      // templateUrl: agendaFormTemplate,
      templateUrl: 'agendas/agendaForm.html',
      controller: 'AgendaSessionFormCtrl as agendaCtrl',
      resolve: {
        agenda: function (Restangular, $stateParams) {
          'ngInject';
          return Restangular.one('conferences', $stateParams.confId).one('agendas', $stateParams.agendaId).get(function (agenda) {
            return agenda;
          });
        },
        sessions: function (Restangular, $stateParams) {
          return Restangular.one('conferences', $stateParams.confId).all('sessions').getList();
        },
        speakers: function (Restangular, $stateParams) {
          return Restangular.one('conferences', $stateParams.confId).all('speakers').getList();
        },
        $title: function () { return 'Edit Agenda'; },
      }
    })
    ;
})
.controller('AgendasCtrl', function (agendas, Restangular, $state, $stateParams, $mdDialog, $rootScope) {
  'ngInject';
  var self = this;
  // this.agendas = Restangular.copy(agendas);
  this.agendas = agendas;

  $rootScope.$on('agendaChange', function (event, agenda) {
    var newAgenda = true;
    self.agendas.map(function (s, index) {
      if(s._id === agenda._id) {
        newAgenda = false;
        self.agendas.splice(index, 1, agenda);
      }
    });
    if (newAgenda) self.agendas.push(agenda);
  });
  $rootScope.$on('removedAgenda', function (event, agenda) {
    self.agendas = self.agendas.filter(function (s) {
      if(s._id !== agenda._id) return true;
    });
  });


  // hide inactive by default
  this.activeFlag = true;
  this.toggleActive = function () {
    this.activeFlag = !this.activeFlag;
  }

  this.query = {
    order: 'name',
    limit: 30,
    page: 1
  };

  this.openAgendaDialog = function(ev) {
    $mdDialog.show({
      controller: AgendaFormCtrl,
      templateUrl: 'agendas/agendaCreateForm.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(newAgenda) {
      if(newAgenda) {
        Restangular.one('conferences', $stateParams.confId).all('agendas').post(newAgenda).then(function (agenda) {
          self.agendas.push(agenda);
        });
      }
    });
  }

  function AgendaFormCtrl($scope, $mdDialog) {
    $scope.addAgenda = function () {
      $mdDialog.hide($scope.newAgenda);
    }

    $scope.cancel = function () {
      $mdDialog.cancel();
    }
  }

  this.confirmPrimary = function(ev, agenda) {
    if(agenda.primary) return;

    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm Primary')
          .textContent('Confirm setting of ' + agenda.name + ' as primary.')
          .ariaLabel('Agenda ' + action)
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      var oldPrimary;
      // set other agenda primary to false
      self.agendas.forEach(function (agenda_item) {
        if(agenda_item.primary) {
          oldPrimary = agenda_item;
          agenda_item.primary = false;
        }
      });
      agenda.primary = !agenda.primary;
      agenda.one('setPrimary').get().then(function () {
      }, function (err) {
        agenda.primary = !agenda.primary;
        oldPrimary.primary = true;
        $mdDialog.show(
           $mdDialog.alert()
            .parent(angular.element(document.querySelector('#agendaList')))
            .clickOutsideToClose(true)
            .title('Cannot Set as Primary')
            .textContent(err)
            .ariaLabel('Set as Primary Error')
            .ok('Got it!')
            .targetEvent(ev)
          );
      });
    });
  };

  this.removeAgenda = function(ev, agenda) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm De-activation')
          .textContent('Confirm de-activation of ' + agenda.name)
          .ariaLabel('Agenda De-activation')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      agenda.remove().then(function () {
        //update the active flag against the agenda
        agenda.active = false;
      }, function (err) {
        $mdDialog.show(
           $mdDialog.alert()
            .parent(angular.element(document.querySelector('#agendaList')))
            .clickOutsideToClose(true)
            .title('Cannot De-activate')
            .textContent(err)
            .ariaLabel('De-activate Error')
            .ok('Got it!')
            .targetEvent(ev)
          );
      });
    });
  };

  this.reactivateAgenda = function (agenda) {
    agenda.active = true;
    agenda.save();

  }

  this.saveAgenda = function (agenda) {
    agenda.put().then(function (agenda) {
      $rootScope.$emit('agendaChange', agenda);
      $state.go('conference.agendas');
    });
  };
})

.controller('AgendaSessionFormCtrl', function (agenda, Restangular, $state, $stateParams, $rootScope, SESSION_TYPES, sessions, $mdDialog, speakers) {
  'ngInject';

  var self = this;
  this.agenda = Restangular.copy(agenda);
  this.sessions = sessions;
  this.speakers = speakers;

  // same controller used for new agendas and editing agendas
  this.saveAgenda = function () {
    self.agenda.put().then(function (agenda) {
      $rootScope.$emit('agendaChange', agenda);
      $state.go('conference.agendas');
    });
  };

  this.removeSession = function(ev, session) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Confirm Removal')
          .textContent('Confirm removal of ' + session.session.name)
          .ariaLabel('Agenda Session Removal')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('Cancel');
    $mdDialog.show(confirm).then(function() {
      Restangular.one('conferences', $stateParams.confId).one('agendas', self.agenda._id).one('sessions', session._id).remove();
      //
      var index;
      self.agenda.sessions.forEach(function (agendaSession, ind) {
        if (agendaSession._id === session._id) {
          index = ind;
        }
      });
      self.agenda.sessions.splice(index, 1);
    });
  };

  this.openAgendaSessionDialog = function(ev, agendaSession) {
    $mdDialog.show({
      controller: AgendaSessionFormCtrl,
      templateUrl: 'agendas/agendaSessionForm.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        agendaSession: agendaSession
      }
      // fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(agendaSession) {
      if(agendaSession._id) {
        var session = {
          start: new Date(agendaSession.start),
          duration: agendaSession.duration,
          sessionId: agendaSession.sessionId,
          sessionType: agendaSession.sessionType
        }
        Restangular.one('conferences', $stateParams.confId).one('agendas', self.agenda._id).one('sessions', agendaSession._id).put(session).then(function (agenda) {
          self.agenda = agenda;
        });
      }
      else {
        Restangular.one('conferences', $stateParams.confId).one('agendas', self.agenda._id).all('sessions').post(agendaSession).then(function (agenda) {
          self.agenda = agenda;
        });
      }
    });
  }

  function AgendaSessionFormCtrl($scope, $mdDialog, agendaSession) {
    $scope.agendaSession = angular.copy(agendaSession);
    $scope.agendaSession.start = new Date($scope.agendaSession.start);
    $scope.sessions = sessions;
    $scope.types = SESSION_TYPES;
    $scope.saveAgendaSession = function () {
      $mdDialog.hide($scope.agendaSession, $scope.existing);
    }

    $scope.cancel = function () {
      $mdDialog.cancel();
    }
  }

})
.filter('sessionDetails', function () {
  return function(agendaSessions, sessions) {
    agendaSessions.forEach(function (agendaSession) {
      sessions.forEach(function (session) {
        if(agendaSession.sessionId === session._id.toString()) {
          agendaSession.session = session;
        }
      });
    });
    return agendaSessions;
  }
})
;
