/**
 * AngularJS module for updating browser title/history based on the current ui-router state.
 *
 * @link https://github.com/nonplus/angular-ui-router-title
 *
 * @license angular-ui-router-title v0.0.4
 * (c) Copyright Stepan Riha <github@nonplus.net>
 * License MIT
 */

(function(angular) {

"use strict";
angular.module("ui.router.title", ["ui.router"])
	.run(["$rootScope", "$timeout", "$state", function($rootScope, $timeout, $state) {

		$rootScope.$on("$stateChangeSuccess", function() {
			var title = getTitleValue($state.$current.locals.globals.$title);
			$timeout(function() {
				$rootScope.$title = title;
			});

			$rootScope.$breadcrumbs = [];
			var state = $state.$current;
			while(state) {
				if(state.resolve && state.resolve.$title) {
					$rootScope.$breadcrumbs.unshift({
						title: getTitleValue(state.locals.globals.$title),
						state: state.self.name,
						stateParams: state.locals.globals.$stateParams
					})
				}
				state = state.parent;
			}
		});

		function getTitleValue(title) {
			return angular.isFunction(title) ? title() : title;
		}

	}]);


})(window.angular);
/*
 * angular-markdown-directive v0.3.1
 * (c) 2013-2014 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.markdown', ['ngSanitize']).
  provider('markdownConverter', function () {
    var opts = {};
    return {
      config: function (newOpts) {
        opts = newOpts;
      },
      $get: function () {
        return new Showdown.converter(opts);
      }
    };
  }).
  directive('btfMarkdown', ['$sanitize', 'markdownConverter', function ($sanitize, markdownConverter) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        if (attrs.btfMarkdown) {
          scope.$watch(attrs.btfMarkdown, function (newVal) {
            var html = newVal ? $sanitize(markdownConverter.makeHtml(newVal)) : '';
            element.html(html);
          });
        } else {
          var html = $sanitize(markdownConverter.makeHtml(element.text()));
          element.html(html);
        }
      }
    };
  }]);
