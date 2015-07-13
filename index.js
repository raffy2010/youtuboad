var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var kue = require('kue');

var queue = require('./queue');
var winston = require('./log');
var monitor = require('./monitor');

var app = express();

// express middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(multer());

app.post('/youtube/retry-transmit', function(req, res) {
  var taskId = req.body.task_id;

  winston.log('info', 'post data', req.body);

  queue.retry(taskId).then(function() {
    res.json({
      success: 1
    });
  }, function(err) {
    res.json({
      success: 0
    });
  });
});

// app route
app.post('/youtube/transmit', function(req, res) {
  var videoUrl = req.body.url,
      taskId = req.body.task_id,
      videoTitle = req.body.video_title,
      videoDesc = req.body.video_desc;

  winston.log('info', 'post data', req.body);

  var job = queue.queue.create('youtube-download', {
    videoUrl: videoUrl,
    taskId: taskId,
    videoTitle: videoTitle,
    videoDesc: videoDesc
  }).attempts(3).save(function(err) {
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

monitor.start();
