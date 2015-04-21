var fs = require('fs');

var AWS = require('aws-sdk');

var config = require('./config.json');

exports.uploadS3 = function(file) {
  var body = fs.createReadStream(file);

  var s3obj = new AWS.S3({
    params: {
      Bucket: config.s3.bucket,
      Key: config.s3.key
    }
  });

  s3obj.upload({
    Body: body
  }).on('httpUploadProgress', function(evt) {
    console.log(evt);
  }).send(function(err, data) {
    console.log(err, data);
  });
};

