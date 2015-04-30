var winston = require('winston');

// log service
winston.add(winston.transports.File, {
  filename: 'app.log'
});

winston.handleExceptions(new winston.transports.File({
  filename: 'winston.log',
  prettyPrint: true
}));

module.exports = winston;
