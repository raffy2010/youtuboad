var fs = require('fs');
var https = require('https');

var auth = require('basic-auth');
var kue = require('kue');
var express = require('express');

var monitorConfig = require('./config.json').monitor;

var monitorApp = express();

monitorApp.use(function(req, res, next) {
  var user = auth(req);

  if (user &&
      user.name === monitorConfig.user &&
      user.pass === monitorConfig.password) {

    next();
  } else {
    res.status(401);
    res.set('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  }
});

monitorApp.use(kue.app);

var monitorOptions = {
  key: fs.readFileSync(monitorConfig.key),
  cert: fs.readFileSync(monitorConfig.cert)
};

exports.start = function() {
  var monitorServer = https.createServer(monitorOptions, monitorApp);

  monitorServer.listen(3000);
};


