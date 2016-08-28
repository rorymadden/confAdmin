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
    'conference',
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
