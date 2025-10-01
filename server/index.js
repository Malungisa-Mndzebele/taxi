const { createServer } = require('http');
const app = require('./app');

const server = createServer(app);
const PORT = process.env.PORT || 5000;

// The server will start automatically when this file is run directly
// This allows the app to be imported without starting the server (for testing)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = server;
