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
      if($window.confirm('Are you sure you want to delete ' + details.name + '\'s picture?')){
        details.object[details.fieldName] = '';
        details.object.save();
      }
    }
  };
});
