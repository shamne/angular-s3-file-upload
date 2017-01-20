angular-s3-file-upload
===

Angular JS directive to upload files to s3.

## Example:
```html
<script src="angular.min.js"></script>
<script src="angular-s3-file-upload.js"></script>

<ng-s3-file-upload data="modelFilePath" config="/s3_uploader_config.json" show-progress="1" auto-upload="1" accept="application/pdf"></ng-s3-file-upload>

```

Configuration comes from the path specified in the config attribute of a directive (config="/uploader_config.json")

Config example:
```
{
  "config": {
    "key": "some_path_prefix/${filename}",
    "acl": "public-read",
    "awsAccessKeyId": "AHDH4JSGD3D...",
    "s3Policy": "0wNi0wNFQwMzowMTo...",
    "s3Signature": "rnwVxPSykp1...",
    "s3Bucket": "bucket-name",
    "contentType": "application/pdf"
  }
}
```
"contentType" is optional

More information on s3 policy/signature generation [here](https://aws.amazon.com/articles/1434)

JS:
```js
// Inject directive into your app
var app = angular.module('myApp', [
    'angularS3FileUpload',
]);

// Optional, if necessary listen to the uploaded file path on complete
$scope.$watch('modelFilePath', function(path) {
  // do something here
});
```

### Installing with bower
```sh
bower install angular-s3-file-upload
```
