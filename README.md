# 🌍 EcoSync - From EarthData to Action: Forecasting Cleaner, Safer Skies

[![NASA Space Apps 2025](https://img.shields.io/badge/NASA-Space%20Apps%202025-blue)](https://www.spaceappschallenge.org/)
[![License](https://img.shields.io/badge/license-ISC-green)](LICENSE)

A cutting-edge MERN-based web application for NASA Space Apps Challenge 2025 that integrates real-time atmospheric data visualization with AI-powered insights to forecast air quality and weather patterns.

## 🚀 Features

### 🗺️ Interactive Map Visualization
- **Deck.gl Integration**: High-performance WebGL-powered visualization layers
- **Multiple Layer Types**: Heatmap, Scatterplot, GeoJSON, Text, and Arc layers
- **Google Maps Base Map**: Beautiful dark-themed satellite imagery with @vis.gl/react-google-maps

### 📊 Dynamic Data Overlays
Fetch and visualize real-time data from **NASA POWER API**:
- `T2M` → Temperature (°C)
- `RH2M` → Relative Humidity (%)
- `PRECTOT` → Precipitation (mm/day)
- `WS2M` → Wind Speed (m/s)
- `PS` → Surface Pressure (kPa)
- `AOD_55` → Aerosol Optical Depth (Air Quality)

### 🤖 AI Assistant (Gemini 2.5 Flash)
- Natural language query processing
- Automatic location detection
- Real-time data fetching
- Context-aware responses

## 🛠️ Tech Stack

**Frontend:** React.js + Deck.gl + Google Maps (@vis.gl/react-google-maps) + Vite
**Backend:** Node.js + Express.js + MongoDB
**AI:** Google Gemini 2.5 Flash
**API:** NASA POWER API

## � Backend API Links

**Base URL:** `http://localhost:5000`

- **Health Check:** `GET /health`
- **NASA Point Data:** `GET /api/nasa/data?lat=31.5497&lon=74.3436&parameters=T2M,RH2M`
- **NASA Regional Data:** `GET /api/nasa/regional?latMin=31&latMax=32&lonMin=74&lonMax=75&parameters=T2M`
- **AI Query:** `POST /api/ai/query` (Body: `{"query": "Show air quality in Lahore"}`)
- **Cities List:** `GET /api/ai/cities`
- **Query History:** `GET /api/queries`

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete documentation.

## �🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB
- Google Maps API Key: https://console.cloud.google.com/google/maps-apis/
- Gemini API Key: https://ai.google.dev/

### Installation

1. **Clone & Install**
```bash
git clone https://github.com/mianjunaid1223/EcoSync.git
cd EcoSync

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

2. **Configure Environment Variables**

Create `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/ecosync
PORT=5000
```

Create `client/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=http://localhost:5000
```

3. **Start the Application**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

4. **Open Browser**
Navigate to: http://localhost:5173

## 📁 Project Structure

```
EcoSync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/        # AI Assistant
│   │   │   ├── map/       # Map Visualization
│   │   │   └── ui/        # UI Components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js
│   └── package.json
│
└── README.md
```

## 🎯 API Endpoints

### Get NASA Data
```
GET /api/nasa/data?lat=31.5497&lon=74.3436&parameters=T2M,RH2M,AOD_55
```

### AI Query
```
POST /api/ai/query
Body: { "query": "Show me air quality in Lahore" }
```

## 💡 Usage Examples

**AI Queries:**
- "Show me air quality in Lahore"
- "Compare humidity and temperature in Tokyo"
- "What's the wind speed in New York?"

## 👥 Authors

- **Mian Junaid** - [@mianjunaid1223](https://github.com/mianjunaid1223)
- **Assad Amir**

## 📄 License

ISC License - see LICENSE file

## 🙏 Acknowledgments

- NASA POWER API
- Google Gemini
- Google Maps Platform
- Deck.gl
- vis.gl

---

**Built with ❤️ for NASA Space Apps Challenge 2025**