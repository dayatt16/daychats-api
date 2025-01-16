// Import required modules
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const compression = require('compression');
const http = require('http');
const ngrok = require('@ngrok/ngrok');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const callRoutes = require('./src/routes/callRoutes');
const chatsRoutes = require('./src/routes/chatsRoutes');
const statusesRoutes = require('./src/routes/statusesRoutes');
const communitiesRoutes = require('./src/routes/communitiesRoutes');
const usersRoutes = require('./src/routes/usersRoutes');

// Initialize the Express application
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the DayChats API' });
});

// Routes
app.use("/api", authRoutes, callRoutes, chatsRoutes, statusesRoutes, communitiesRoutes, usersRoutes);

// 404 error handling
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

async function startNgrok(){
  try{
    const listener = await ngrok.connect({
      addr: PORT,
      authtoken_from_env: true
    });
    console.log(`Ngrok tunnel established at: ${listener.url()}`);
  }catch(err){
    console.error('Error connecting to ngrok:', err);
  }
} 

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startNgrok();
});




module.exports = app;

