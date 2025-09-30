const app = require('./app');

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly (not in serverless mode)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Resource Sharing System API running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
