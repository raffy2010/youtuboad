var child_process = require('child_process');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var kue = require('kue');
var Promise = require('bluebird');
var winston = require('winston');

var s3 = require('./s3');

var app = express(),
    queue = kue.createQueue();

var rootDir = '/home/raffy/youtube';


// log service
winston.add(winston.transports.File, {
  filename: 'app.log'
});

winston.handleExceptions(new winston.transports.File({
  filename: 'winston.log',
  prettyPrint: true
}));


// express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(multer());


// app route
app.post('/youtube/transmit', function(req, res) {
  var videoUrl = req.body.url,
      videoId = req.body.video_id;

  var job = queue.create('youtube-download', {
    videoUrl: videoUrl,
    videoId: videoId
  }).save(function(err) {
    if (err) {
      res.json({
        success: 0
      });
    }

    res.json({
      success: 1
    });
  });
});

// knock out
app.listen(2014);


// handle download queue job
queue.process('youtube-download', function(job, done) {
  var videoUrl = job.data.videoUrl,
      videoId = job.data.videoId;

  winston.log('info', 'download', videoUrl);

  handleDownload(videoUrl).then(function() {
    done();
  });
});

function handleDownload(videoUrl) {
  var youtubeVid = qs.parse(url.parse(videoUrl).search.substr(1))['v'];

  var cmd = 'youtube-dl -F ' + videoUrl;

  return execCmd(cmd).bind({})
  .then(function(stdout) {
    var format = selectVideoFormat(stdout),
        cmd = ['youtube-dl', '-o', "'" + rootDir + "/%(title)s-%(id)s.%(ext)s'", '-f', format, videoUrl].join(' ');

    winston.profile('download');

    return execCmd(cmd);
  }).then(function() {
    winston.profile('download');

    this.destFile = rootDir;

    return findFile(this.destFile, youtubeVid);
  }).then(function(filename) {
    this.filename = filename;

    var title = filename.substring(filename.lastIndexOf('/') + 1, filename.lastIndexOf('-'));

    var cmd = ['python', __dirname + '/scripts/youkuUploader.py', '"' + title + '"', '"' + filename + '"'].join(' ');

    winston.profile('upload');

    return Promise.all([execCmd(cmd), s3.uploadS3(filename)]);
  }).then(function() {
    winston.profile('upload');

    return removeFile(this.filename);
  });
}

function selectVideoFormat(str) {
  winston.log('info', 'video formats', str);

  var lines = str.split(/[\n\r]/);

  var dashAudio = [],
      dashVideo = [];

  lines.forEach(function(line) {
    var items;

    if (/DASH audio/.test(line)) {
      items = line.split(/\s+/);
      dashAudio.push({
        formatCode: items[0]
      });
    } else if (/mp4.*DASH video/.test(line)) {
      items = line.split(/\s+/);
      dashVideo.push({
        formatCode: items[0]
      });
    }
  });

  return dashVideo[dashVideo.length - 1].formatCode + '+' + dashAudio[dashAudio.length - 1].formatCode;
}

function execCmd(cmd) {
  winston.log('info', 'exec command', cmd);
  var promise = new Promise(function(resolve, reject, progress) {
    child_process.exec(cmd, function(err, stdout, stderr) {
      if (err) {
        reject(err);

        return;
      }

      resolve(stdout);
    });
  });

  return promise;
}

function findFile(dir, key) {
  var promise = new Promise(function(resolve, reject) {
    fs.readdir(dir, function(err, files) {
      if (err) {
        reject(err);

        return;
      }

      var reg = new RegExp(key);

      files.forEach(function(file) {
        if (reg.test(file)) {

          resolve(path.resolve(dir, file));
        }
      });
    });
  });

  return promise;
}

function removeFile(filename) {
  return new Promise(function(resolve, reject) {
    fs.unlink(filename, function(err) {
      if (err) {
        // do something
	      reject(err);

        return;
      }

      resolve();
    });
  });
}

