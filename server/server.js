const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Health check (before other routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EcoSync Server Running' });
});

// API Info route
app.get('/api', (req, res) => {
  res.json({
    name: 'EcoSync API',
    version: '1.0.0',
    description: 'NASA Space Apps Challenge 2025 - Atmospheric Data & AI Assistant',
    endpoints: {
      health: '/health',
      nasa: {
        pointData: '/api/nasa/data?lat=31.5497&lon=74.3436&parameters=T2M,RH2M',
        regionalData: '/api/nasa/regional?latMin=31&latMax=32&lonMin=74&lonMax=75&parameters=T2M'
      },
      ai: {
        query: 'POST /api/ai/query',
        cities: '/api/ai/cities'
      },
      queries: {
        list: '/api/queries',
        save: 'POST /api/queries'
      }
    },
    documentation: 'https://github.com/mianjunaid1223/EcoSync/blob/main/API_ENDPOINTS.md'
  });
});

// API Routes
app.use('/api/nasa', require('./routes/nasa'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/queries', require('./routes/queries'));

// Serve React app for all other routes (must be LAST - catch-all route)
// Using regex pattern instead of * for Express 5 compatibility
app.get(/^\/(?!api|health).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`=================================\n`);
});

module.exports = app;
