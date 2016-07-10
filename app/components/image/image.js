// angular.module('imageMgr')
// .factory('imageService', function ($http, AppConstants, $window) {
//   'ngInject';
//
//   return {
//     uploadImage: function (details, callback) {
//       cloudinary.openUploadWidget({
//         cloud_name: AppConstants.cloudinaryDetails.cloud_name,
//         upload_preset: AppConstants.cloudinaryDetails.upload_preset,
//         theme: 'minimal',
//         sources: ['local'],
//         multiple: false,
//         folder: details.className,
//         context: {
//           alt: details.alt
//         }
//       },
//       function(err, result) {
//         if (err) {
//           return callback(err);
//         }
//         else {
//           // fileName
//           var update = {};
//           var fieldName = details.fieldName || 'photo';
//           var photo = {
//             url: result[0].secure_url,
//             public_id: result[0].public_id
//           };
//
//         return callback(null, photo);
//           // update[fieldName] = photo;
//           //
//           // Restangular.
//           // details.object[fieldName] = photo;
//           //
//           // $http.put(server + '/classes/' + details.className + '/' + details.object.objectId, update)
//           //   .success(function () {
//           //   })
//           //   .error(function (err) {
//           //     // TODO: show error to user
//           //     details.object[fieldName] = undefined;
//           //     console.log(err);
//           //   });
//         }
//       });
//     },
//
//     removeImage: function (details) {
//       // alert the user
//       if($window.confirm('Are you sure you want to delete ' + details.name + '\'s picture?')){
//         var removeAction = {};
//         var fieldName = details.fieldName || 'photo';
//         removeAction[fieldName] = {'__op': 'Delete'};
//         $http.put(server + '/classes/' + details.className + '/' + details.object.objectId, removeAction)
//           .success(function () {
//             details.object[fieldName] = undefined;
//           })
//           .error(function () {
//             // self.formError = true;
//           });
//       }
//     }
//   };
// });
