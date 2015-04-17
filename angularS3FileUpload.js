var angularS3FileUpload = angular.module('angularS3FileUpload', []);

angularS3FileUpload.directive('ngS3FileUpload', function() {
  return {
    restrict: 'AE',
    scope: {
      data: '=',
      mode: '@',
      autoUpload: '@',
      showProgress: '@'
    },
    templateUrl: 'templates/angular-s3-file-upload.html',
    controller: ['$scope', 'S3Uploader', function ($scope, S3Uploader) {
      'use strict';

      var that = this;

      $scope.uploadPercent = 0;
      $scope.readyToUpload = false;
      $scope.showProgressBar = false;
      $scope.upload = function() {
        // Get new credentials
        $scope.readyToUpload = false;
        if ($scope.showProgress) {
          $scope.showProgressBar = true;
        }
        S3Uploader.getCredentials($scope.file.type, $scope.mode).then(function(creds) {
          that.uploadToS3($scope, creds);
        });
      };

      $scope.filesChanged = function(elm) {
        console.log('filesChanged', elm);
        $scope.file = elm.files[0];
        if (!$scope.autoUpload) $scope.readyToUpload = true;
        $scope.$apply();
        console.log('file', $scope.file);
        if ($scope.autoUpload) $scope.upload();
      };

      function uploadToS3($scope, creds) {
        var fd = new FormData();
        var uploadPath = 'https://' + creds.bucket + '.s3.amazonaws.com/';

        // Populate the Post paramters.
        fd.append('key', creds.key + '${filename}');
        fd.append('AWSAccessKeyId', creds.AWSAccessKeyId);
        fd.append('acl', 'public-read');
        fd.append('success_action_status', '201');
        fd.append('policy', creds.s3Policy);
        fd.append('signature', creds.s3Signature);
        fd.append('utf8', '');
        // fd.append('Content-Type', $scope.file.type);
        // File must be added last
        fd.append('file', $scope.file);

        var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', function(e) {
          // TODO display progress bar
          console.log('e progress', e);
          if (e.lengthComputable) {
            $scope.uploadPercent = Math.round(e.loaded * 100 / e.total);
          }
          $scope.$apply();
        });

        xhr.onreadystatechange = function(e) {
          if (xhr.readyState === 4) {
            //complete
            console.log('complete');
            $scope.data = uploadPath + creds.key + $scope.file.name;
            console.log('complete data', $scope.data);
            $scope.showProgressBar = false;
            $scope.$apply();
          }
          console.log('onreadystatechange e', e);
        };

        xhr.open('POST', uploadPath, true);
        xhr.send(fd);
      }
    }]
  };
});

angularS3FileUpload.service('S3Uploader', ['$http', '$q', function S3Uploader($http, $q) {
  'use strict';

  this.getCredentials = function(mimetype, mode) {
    var dfr = $q.defer();

    $http({
      method: 'GET',
      url: '/uploader_config',
      params: {
        mimetype: mimetype,
        mode: mode
      }
    }).success(function(res) {
      dfr.resolve(res);
    }).error(function(err) {
      console.log('エラー', err);
      dfr.reject(err);
    });

    return dfr.promise;
  };
}]);

angularS3FileUpload.run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/angular-s3-file-upload.html',
    '<div class=\'input-group\'>' +
    '  <input type=\'file\' onchange=\'angular.element(this).scope().filesChanged(this)\' class=\'fa-file-input\' />' +
    '  <a ng-click=\'upload()\' class=\'small button success radius\' ng-if=\'readyToUpload\'>upload</a>' +
    '  <div class=\'progress success round\' ng-if=\'showProgressBar\'><span class=\'meter\' style=\'width: {{uploadPercent}}%\'></span></div>' +
    '</div>'
  );
}]);
