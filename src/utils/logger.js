const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level (can be set to 'debug', 'warn', 'error', etc.)
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to logs
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    // Log to console
    new winston.transports.Console(),
    // Log to a file
    new winston.transports.File({ filename: 'app.log' })
  ],
});

// Example usage of the logger
// logger.info('This is an info message');
// logger.warn('This is a warning');
// logger.error('This is an error');

// Example of logging an object
// const user = { id: 1, name: 'John Doe' };
// logger.info('User data:', user);

module.exports = { logger };