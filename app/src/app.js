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
    'ngCookies',
    'ngMessages',
    'ngMaterial',
    'ngSanitize',
    'ui.router',
    'ui.router.title',
    'restangular',
    // 'uiGmapgoogle-maps',
    'angularLoad',
    'btford.markdown',

    'templates-main',
    //
    // 'genericServices',
    // 'conferenceDirectives',
    'config',

    'user',
    'auth',
    'conference'
  ])
  .constant('URL', 'http://localhost:8080/app')
  .constant('API', 'https://conf.initiate.network/api/v1')
  .constant('GOOGLE_AUTH', 'https://conf.initiate.network/auth/google')
  // .constant('API', 'http://localhost:3000/api/v1')

  .config(['$stateProvider', '$urlRouterProvider', '$uiViewScrollProvider', 'RestangularProvider', '$mdThemingProvider', '$mdIconProvider', '$httpProvider', 'API', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $uiViewScrollProvider, RestangularProvider, $mdThemingProvider, $mdIconProvider, $httpProvider, API, $locationProvider) {

    // $locationProvider.html5Mode({
    //   enabled:true
    // });

    // allow cors requests
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push('authInterceptor');

    //TODO: move these icons elsewhere
    $mdIconProvider
      .defaultIconSet("./assets/svg/avatars.svg", 128)
      .icon("menu"       , "./assets/svg/menu.svg"        , 24)
      .icon("share"      , "./assets/svg/share.svg"       , 24)
      .icon("google_plus", "./assets/svg/google_plus.svg" , 512)
      .icon("hangouts"   , "./assets/svg/hangouts.svg"    , 512)
      .icon("twitter"    , "./assets/svg/twitter.svg"     , 512)
      .icon("phone"      , "./assets/svg/phone.svg"       , 512);

    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('red');

    RestangularProvider.setBaseUrl(API);
    RestangularProvider.setRestangularFields({
      id: "_id"
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'main.html',
        controller: 'MainCtrl as main',
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
      });


      // For any unmatched url, redirect to /
      $urlRouterProvider.otherwise('/');

      $uiViewScrollProvider.useAnchorScroll();
  }])

  .run(['$rootScope', '$state', '$stateParams', '$window', '$location', '$injector', 'authService', 'userService',
    function($rootScope, $state, $stateParams, $window, $location, $injector, authService, userService) {
    // $rootScope.$state = $state;
    // $rootScope.$stateParams = $stateParams;

    // insert the header token into each request
    $injector.get("$http").defaults.transformRequest = function(data, headersGetter) {
        if ($rootScope.oauth) headersGetter()['Authorization'] = "Bearer "+$rootScope.oauth.access_token;
        if (data) {
            return angular.toJson(data);
        }
    };

    // check for correct priviledges
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      if (!authService.isAuthed() && (toState.name !== 'login' && toState.name !== 'settlement')) {
        event.preventDefault();
        $state.go('login');
      }
      
      userService.setCurrentUser();

      // userService.authorize(event);
    });

    // google analytics
    $rootScope.$on('$stateChangeSuccess',
      function(){
        if (!$window.ga){
          return;
        }
        $window.ga('send', 'pageview', { page: $location.path() });

      });
  }])
  .controller('AppCtrl', ['$rootScope', '$mdSidenav', function ($rootScope, $mdSidenav) {
    var self = this;
    $rootScope.$on('currentUser', function (user) {
      self.currentUser = $rootScope.currentUser;
      self.$apply();
    });
    this.conferences =$rootScope.conferences;
    
    
    this.toggleMenu = function () {
      $mdSidenav('left').toggle();
    };
    
    this.constant = 'Test';
  }])

  .controller('MainCtrl', ['conferences', 'Restangular', '$state', '$rootScope', function (conferences, Restangular, $state, $rootScope) {
    
    this.conferences = $rootScope.conferences = conferences;
      
      
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
    
    this.goToConference = function () {
      $state.go('conference', {confId: this.conference});
    };
  }])
  ;
//   .controller('MainCtrl', ['uiGmapGoogleMapApi', 'speakers', 'sponsors', '$filter', 'streams', 'mapDetails', 'sessions',
//     function ( uiGmapGoogleMapApi, speakers, sponsors, $filter, streams, mapDetails, sessions) {
//
//       var self = this;
//       this.speakers = speakers.filter(function (speaker) {
//         return !speaker.keynote && speaker.active;
//       });
//       //shuffle the speakers
//       function shuffleArray(array) {
//         for (var i = array.length - 1; i > 0; i--) {
//             var j = Math.floor(Math.random() * (i + 1));
//             var temp = array[i];
//             array[i] = array[j];
//             array[j] = temp;
//         }
//         return array;
//       }
//       this.speakers = shuffleArray(this.speakers);
//       //reduce to 16 speakers
//       this.speakers = this.speakers.splice(0,16);
//
//       this.keynotes = sessions.filter(function (session) {
//         return session.type === 'keynote' && session.speakers.length > 0 && session.speakers[0].active;
//       });
//       this.streams = streams.filter(function (stream) {
//         return stream.active;
//       });
// //       this.news = news.data.responseData && news.data.responseData.feed.entries;
//
//       var filterSponsors = function (level) {
//         return $filter('filter')(sponsors, {level: level});
//       };
//       this.sponsors = {
//         platinum: filterSponsors(1),
//         gold: filterSponsors(2),
//         silver: filterSponsors(3),
//         bronze: filterSponsors(4),
//         media: filterSponsors(5)
//       };
//
//       // boeing keynote
//       this.sessions = sessions.filter(function (session) {
//         return session.objectId === 'KQZ7NUwO7K';
//       });
//
//       // maps
//       self.map = {};
//       uiGmapGoogleMapApi.then(function(map) {
//         self.map = mapDetails.map;
//
//         self.marker = mapDetails.crokeParkLocation;
//
//         // sometimes the map isn't full screen - this is to be called on load. Might need to move
//         // http://stackoverflow.com/questions/15458609/execute-function-on-page-load
//         map.event.trigger(map, 'resize');
//       });
//
//
//   }])
//   .controller('MainMinimalCtrl', [
//     function () {
//
//      this.images = [
//         {thumb: 'images/ELF2016thumbs/ELF2016_006.jpg', img: 'images/ELF2016/ELF2016_006.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_017.jpg', img: 'images/ELF2016/ELF2016_017.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_021.jpg', img: 'images/ELF2016/ELF2016_021.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_025.jpg', img: 'images/ELF2016/ELF2016_025.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_028.jpg', img: 'images/ELF2016/ELF2016_028.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_031.jpg', img: 'images/ELF2016/ELF2016_031.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_034.jpg', img: 'images/ELF2016/ELF2016_034.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_051.jpg', img: 'images/ELF2016/ELF2016_051.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_052.jpg', img: 'images/ELF2016/ELF2016_052.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_053.jpg', img: 'images/ELF2016/ELF2016_053.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_078.jpg', img: 'images/ELF2016/ELF2016_078.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_087.jpg', img: 'images/ELF2016/ELF2016_087.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_097.jpg', img: 'images/ELF2016/ELF2016_097.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_098.jpg', img: 'images/ELF2016/ELF2016_098.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_103.jpg', img: 'images/ELF2016/ELF2016_103.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_118.jpg', img: 'images/ELF2016/ELF2016_118.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_120.jpg', img: 'images/ELF2016/ELF2016_120.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_131.jpg', img: 'images/ELF2016/ELF2016_131.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_133.jpg', img: 'images/ELF2016/ELF2016_133.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_136.jpg', img: 'images/ELF2016/ELF2016_136.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_138.jpg', img: 'images/ELF2016/ELF2016_138.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_149.jpg', img: 'images/ELF2016/ELF2016_149.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_152.jpg', img: 'images/ELF2016/ELF2016_152.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_155.jpg', img: 'images/ELF2016/ELF2016_155.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_157.jpg', img: 'images/ELF2016/ELF2016_157.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_159.jpg', img: 'images/ELF2016/ELF2016_159.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_163.jpg', img: 'images/ELF2016/ELF2016_163.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_165.jpg', img: 'images/ELF2016/ELF2016_165.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_168.jpg', img: 'images/ELF2016/ELF2016_168.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_177.jpg', img: 'images/ELF2016/ELF2016_177.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_179.jpg', img: 'images/ELF2016/ELF2016_179.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_184.jpg', img: 'images/ELF2016/ELF2016_184.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_196.jpg', img: 'images/ELF2016/ELF2016_196.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_197.jpg', img: 'images/ELF2016/ELF2016_197.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_202.jpg', img: 'images/ELF2016/ELF2016_202.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_203.jpg', img: 'images/ELF2016/ELF2016_203.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_205.jpg', img: 'images/ELF2016/ELF2016_205.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_208.jpg', img: 'images/ELF2016/ELF2016_208.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_209.jpg', img: 'images/ELF2016/ELF2016_209.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_214.jpg', img: 'images/ELF2016/ELF2016_214.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_217.jpg', img: 'images/ELF2016/ELF2016_217.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_223.jpg', img: 'images/ELF2016/ELF2016_223.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_222.jpg', img: 'images/ELF2016/ELF2016_222.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_224.jpg', img: 'images/ELF2016/ELF2016_224.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_225.jpg', img: 'images/ELF2016/ELF2016_225.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_229.jpg', img: 'images/ELF2016/ELF2016_229.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_230.jpg', img: 'images/ELF2016/ELF2016_230.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_232.jpg', img: 'images/ELF2016/ELF2016_232.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_233.jpg', img: 'images/ELF2016/ELF2016_233.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_238.jpg', img: 'images/ELF2016/ELF2016_238.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_241.jpg', img: 'images/ELF2016/ELF2016_241.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_240.jpg', img: 'images/ELF2016/ELF2016_240.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_245.jpg', img: 'images/ELF2016/ELF2016_245.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_246.jpg', img: 'images/ELF2016/ELF2016_246.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_248.jpg', img: 'images/ELF2016/ELF2016_248.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_250.jpg', img: 'images/ELF2016/ELF2016_250.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_252.jpg', img: 'images/ELF2016/ELF2016_252.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_253.jpg', img: 'images/ELF2016/ELF2016_253.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_259.jpg', img: 'images/ELF2016/ELF2016_259.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_258.jpg', img: 'images/ELF2016/ELF2016_258.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_264.jpg', img: 'images/ELF2016/ELF2016_264.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_266.jpg', img: 'images/ELF2016/ELF2016_266.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_269.jpg', img: 'images/ELF2016/ELF2016_269.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_271.jpg', img: 'images/ELF2016/ELF2016_271.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_270.jpg', img: 'images/ELF2016/ELF2016_270.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_272.jpg', img: 'images/ELF2016/ELF2016_272.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_274.jpg', img: 'images/ELF2016/ELF2016_274.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_277.jpg', img: 'images/ELF2016/ELF2016_277.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_278.jpg', img: 'images/ELF2016/ELF2016_278.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_284.jpg', img: 'images/ELF2016/ELF2016_284.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_287.jpg', img: 'images/ELF2016/ELF2016_287.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_290.jpg', img: 'images/ELF2016/ELF2016_290.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_292.jpg', img: 'images/ELF2016/ELF2016_292.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_303.jpg', img: 'images/ELF2016/ELF2016_303.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_311.jpg', img: 'images/ELF2016/ELF2016_311.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_316.jpg', img: 'images/ELF2016/ELF2016_316.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_332.jpg', img: 'images/ELF2016/ELF2016_332.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_336.jpg', img: 'images/ELF2016/ELF2016_336.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_367.jpg', img: 'images/ELF2016/ELF2016_367.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_381.jpg', img: 'images/ELF2016/ELF2016_381.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_386.jpg', img: 'images/ELF2016/ELF2016_386.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_388.jpg', img: 'images/ELF2016/ELF2016_388.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_391.jpg', img: 'images/ELF2016/ELF2016_391.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_403.jpg', img: 'images/ELF2016/ELF2016_403.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_409.jpg', img: 'images/ELF2016/ELF2016_409.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_417.jpg', img: 'images/ELF2016/ELF2016_417.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_420.jpg', img: 'images/ELF2016/ELF2016_420.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_423.jpg', img: 'images/ELF2016/ELF2016_423.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_435.jpg', img: 'images/ELF2016/ELF2016_435.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_437.jpg', img: 'images/ELF2016/ELF2016_437.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_439.jpg', img: 'images/ELF2016/ELF2016_439.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_442.jpg', img: 'images/ELF2016/ELF2016_442.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_443.jpg', img: 'images/ELF2016/ELF2016_443.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_447.jpg', img: 'images/ELF2016/ELF2016_447.jpg', description: ''},
// {thumb: 'images/ELF2016thumbs/ELF2016_448.jpg', img: 'images/ELF2016/ELF2016_448.jpg', description: ''}
//     ];
//   }])
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
