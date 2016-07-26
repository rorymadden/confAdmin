angular.module('app.filters', [])

.filter('booleanFlag', function ($sce) {
  'ngInject';

  return function (flag) {
    var icon = flag ?
      '<md-icon md-font-set="material-icons" class="success">check</md-icon>' :
      '<md-icon md-font-set="material-icons" class="danger">close</md-icon>';

    // console.log($sce.trustAsHtml(icon))
    return $sce.trustAsHtml(icon);
  };
})
.filter('socialFlag', function ($sce) {
  'ngInject';

  return function (social) {
    var icons = '';
    Object.keys(social).forEach(function (socialSite) {
      icons += '<md-icon md-font-set="material-icons">' + socialSite + '</md-icon>';
    });
    // console.log($sce.trustAsHtml(icons))
    return icons;
    // return $sce.trustAsHtml(icons);
  };
});
