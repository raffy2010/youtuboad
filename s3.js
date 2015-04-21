var fs = require('fs');

var AWS = require('aws-sdk');
var mime = require('mime');
var Promise = require('bluebird');

var config = require('./config.json');

AWS.config.update({
  accessKeyId: config.s3.key,
  secretAccessKey: config.s3.secret
});

exports.uploadS3 = function(name, file) {
  var body = fs.createReadStream(file);

  var s3obj = new AWS.S3({
    params: {
      Bucket: config.s3.bucket,
      Key: config.s3.key
    }
  });

  return new Promise(function(resolve, reject) {
    s3obj.upload({
      Key: name,
      Body: body,
      ContentType: mime.lookup(file)
    }).on('httpUploadProgress', function(evt) {
      console.log(evt);
    }).send(function(err, data) {
      if (err) {
        reject(err);

        return;
      }

      resolve(data);
    });
  });
};

