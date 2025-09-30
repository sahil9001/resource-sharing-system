const serverless = require('serverless-http');
const app = require('./app');

// Export the handler for serverless deployment
module.exports.handler = serverless(app, {
  binary: false,
  request: (request, event, context) => {
    // Add request context to the request object
    request.context = context;
    request.event = event;
  }
});
