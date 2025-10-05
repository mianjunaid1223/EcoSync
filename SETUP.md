# 🚀 EcoSync Setup Guide

Complete step-by-step instructions for setting up EcoSync on GitHub Codespaces or locally.

## 📦 Prerequisites

Before you begin, ensure you have:

### Required
-  **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
-  **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
-  **Git** - [Download](https://git-scm.com/)

### API Keys (Free Tier Available)
-  **Google Maps API Key** - [Get Here](https://console.cloud.google.com/google/maps-apis/)
-  **Google Gemini API Key** - [Get Here](https://ai.google.dev/)

---

## 🌐 Option 1: GitHub Codespaces (Recommended for Hackathon)

### Step 1: Open in Codespaces
1. Go to the repository: https://github.com/mianjunaid1223/EcoSync
2. Click the **Code** button
3. Select **Codespaces** tab
4. Click **Create codespace on main**

### Step 2: Wait for Setup
The codespace will automatically:
- Install Node.js
- Install dependencies
- Set up the development environment

### Step 3: Configure Environment Variables

**Backend** - Create `server/.env`:
```bash
cd server
touch .env
```

Add the following content:
```env
# Gemini AI API Key (required)
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE

# MongoDB (use Atlas for Codespaces)
MONGODB_URI=YOUR_MONGODB_ATLAS_URI

# Server Port
PORT=5000
```

**Frontend** - Create `client/.env`:
```bash
cd ../client
touch .env
```

Add the following content:
```env
# Google Maps API Key (required)
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

# Backend API URL
VITE_API_URL=http://localhost:5000
```

### Step 4: Install Dependencies

Install backend packages:
```bash
cd /workspaces/EcoSync/server
npm install
```

Install frontend packages:
```bash
cd /workspaces/EcoSync/client
npm install
```

### Step 5: Start the Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd /workspaces/EcoSync/server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
 MongoDB Connected
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/EcoSync/client
npm run dev
```

You should see:
```
VITE v7.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

### Step 6: Open the Application
- Click on the **Ports** tab in Codespaces
- Find port `5173` and click the **Globe** icon to open
- Your app should now be running! 🎉

---

## 💻 Option 2: Local Development

### Step 1: Clone Repository
```bash
git clone https://github.com/mianjunaid1223/EcoSync.git
cd EcoSync
```

### Step 2: Install MongoDB Locally

**macOS** (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows**:
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer
3. Start MongoDB service

**Linux** (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Verify MongoDB is Running:**
```bash
mongosh
# Should connect successfully
```

### Step 3: Configure Environment Variables

**Backend** - Create `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/ecosync
PORT=5000
```

**Frontend** - Create `client/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_URL=http://localhost:5000
```

### Step 4: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 6: Open Browser
Navigate to: **http://localhost:5173**

---

## 🔑 Getting API Keys

### Google Maps API Key

1. Visit: https://console.cloud.google.com/google/maps-apis/
2. Sign up or log in to Google Cloud Console
3. Create a new project or select existing one
4. Enable the following APIs:
   - **Maps JavaScript API**
   - **Maps SDK for Android** (if needed)
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy the API key and paste in `client/.env`
7. (Optional) Restrict the key to your domain for production

**Note:** Google Maps offers $200 free monthly credit.

### Google Gemini API Key

1. Visit: https://ai.google.dev/
2. Click **Get API Key**
3. Sign in with Google account
4. Click **Create API Key**
5. Select or create a project
6. Copy the API key and paste in `server/.env`

### MongoDB Atlas (Cloud MongoDB - for Codespaces)

1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up for free tier
3. Create a new cluster (free tier: M0)
4. Click **Connect** → **Connect your application**
5. Copy the connection string
6. Replace `<password>` with your database password
7. Paste in `server/.env` as `MONGODB_URI`

Example:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecosync?retryWrites=true&w=majority
```

---

##  Verification Checklist

After setup, verify everything works:

### Backend Checks
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] API endpoints respond:
  - http://localhost:5000/health
  - http://localhost:5000/api/ai/cities

### Frontend Checks
- [ ] Vite dev server starts
- [ ] Page loads without errors
- [ ] Map renders correctly
- [ ] AI Assistant is visible
- [ ] Parameter controls work

### Integration Checks
- [ ] AI queries return responses
- [ ] Map updates when changing cities
- [ ] Data fetches from NASA API
- [ ] Layers toggle correctly

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
### Issue: Google Map Not Loading
**Solution:**
- Verify API key in `client/.env`
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Check billing is enabled (free tier available)
- Clear browser cache and check browser console for errors
### Issue: Mapbox Map Not Loading
**Solution:**
- Verify token in `client/.env`
- Check token has correct scopes
- Clear browser cache

### Issue: AI Assistant Not Responding
**Solution:**
- Verify Gemini API key in `server/.env`
- Check API quota: https://ai.google.dev/
- Check backend logs for errors

### Issue: NASA API Errors
**Solution:**
- No API key needed - it's public
- Check internet connection
- Verify coordinates are valid (lat: -90 to 90, lon: -180 to 180)

### Issue: CORS Errors
**Solution:**
- Verify `VITE_API_URL` in `client/.env` is correct
- Backend should have CORS enabled (already configured)

### Issue: Port Already in Use
**Solution:**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

---

## 🔧 Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Vite HMR - changes reflect instantly
- **Backend**: Nodemon - server restarts on file changes

### Debugging

**Backend Logs:**
```bash
# Backend logs show:
# - API requests
# - NASA API calls
# - Gemini AI interactions
# - MongoDB operations
```

**Frontend Console:**
```bash
# Open browser console (F12)
# Check for:
# - API errors
# - Map rendering issues
# - Component warnings
```

### Testing API Endpoints

Using cURL:
```bash
# Health check
curl http://localhost:5000/health

# Get NASA data
curl "http://localhost:5000/api/nasa/data?lat=31.5497&lon=74.3436&parameters=T2M,RH2M"

# AI query
curl -X POST http://localhost:5000/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Show air quality in Lahore"}'
- [NASA POWER API Docs](https://power.larc.nasa.gov/docs/)
- [Gemini API Guide](https://ai.google.dev/docs)
- [Deck.gl Examples](https://deck.gl/examples)
- [Google Maps Platform](https://developers.google.com/maps)
- [React Google Maps](https://visgl.github.io/react-google-maps/)
- [React Documentation](https://react.dev/)

- [NASA POWER API Docs](https://power.larc.nasa.gov/docs/)
- [Gemini API Guide](https://ai.google.dev/docs)
- [Deck.gl Examples](https://deck.gl/examples)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [React Documentation](https://react.dev/)

---

## 🎯 Next Steps

After successful setup:

1. **Explore the Interface**
   - Try different cities
   - Toggle visualization layers
   - Ask the AI assistant questions

2. **Customize Parameters**
   - Edit `ParameterControls.jsx` to add more parameters
   - Modify `MapVisualization.jsx` for custom visualizations

3. **Extend Functionality**
   - Add more cities to the database
   - Implement historical data comparison
   - Create custom visualization presets

4. **Deploy**
   - Frontend: Vercel, Netlify
   - Backend: Heroku, Railway, Render
   - Database: MongoDB Atlas

---

## 💪 Ready for the Hackathon!

You're all set! Your EcoSync application should now be:
-  Fetching real-time atmospheric data
-  Visualizing data on an interactive map
-  Responding to AI queries
-  Ready for demo and presentation

Good luck with NASA Space Apps Challenge 2025! 🚀

---

**Need Help?** Open an issue on GitHub or contact the team.
