(function(){
  'use strict';

  // Prepare the 'users' module for subsequent registration of controllers and delegates
  angular.module('conferences', [ 'ngMaterial' ])
    .controller('ConferenceController', [
       'conferenceService', '$mdSidenav', '$mdBottomSheet', '$timeout', '$log', 'restangular',
       ConferenceController
    ]);

/**
* Main Controller for the Angular Material Starter App
* @param $scope
* @param $mdSidenav
* @param avatarsService
* @constructor
*/
function ConferenceController(conferenceService, $mdSidenav, $mdBottomSheet, $timeout, $log, Restangular ) {
  var self = this;

  self.selected     = null;
  self.conferences        = [ ];
  self.selectConference   = selectConference;

  // Load all registered conferences

  conferenceService
     .loadAllConferences()
     .then( function( conferences ) {
       self.conferences    = [].concat(conferences);
       self.selected = conferences[0];
     });



/**
* Show the Contact view in the bottom sheet
*/
// function makeContact(selectedConference) {
//
//     $mdBottomSheet.show({
//       controllerAs  : "vm",
//       templateUrl   : './src/conferences/view/contactSheet.html',
//       controller    : [ '$mdBottomSheet', ContactSheetController],
//       parent        : angular.element(document.getElementById('content'))
//     }).then(function(clickedItem) {
//       $log.debug( clickedItem.name + ' clicked!');
//     });
//
//     /**
//      * Conference ContactSheet controller
//      */
//     function ContactSheetController( $mdBottomSheet ) {
//       this.conference = selectedConference;
//       this.items = [
//         { name: 'Phone'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
//         { name: 'Twitter'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
//         { name: 'Google+'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
//         { name: 'Hangout'     , icon: 'hangouts'    , icon_url: 'assets/svg/hangouts.svg'}
//       ];
//       this.contactConference = function(action) {
//         // The actually contact process has not been implemented...
//         // so just hide the bottomSheet
//
//         $mdBottomSheet.hide(action);
//       };
//     }
// }

}

})();



})();
