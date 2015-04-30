var qiniu = require('qiniu');
var request = require('request');
var Promise = require('bluebird');

var config = require('./config.json');

var winston = require('./log');

var accessKey = config.qiniu.access_key,
    secretKey = config.qiniu.secret_key;

var host = '7xityn.com2.z0.glb.qiniucdn.com/';

qiniu.conf.ACCESS_KEY = accessKey;
qiniu.conf.SECRET_KEY = secretKey;

function genToken() {
  var putPolicy = new qiniu.rs.PutPolicy('youtube-cover');

  return putPolicy.token();
}

function downloadImage(url) {
  return new Promise(function(resolve, reject) {
    request({
      url: url,
      encoding: null
    }, function(err, httpResp, body) {
      if (err) {
        reject(err);

        return;
      }

      resolve(body);
    });
  });
}

function uploadImage(buf) {
  var token = genToken();

  return new Promise(function(resolve, reject) {
    qiniu.io.put(token, accessKey, buf, null, function(err, ret) {
      if (err) {
        winston.log('info', 'qiniu error', err);
        reject(err);

        return;
      }

      winston.log('info', 'qiniu upload result', ret);

      resolve(host + ret.key);
    });
  });
}

exports.transferImage = function(url) {
  return downloadImage(url).then(function(body) {
    return uploadImage(body);
  });
};


