#!/bin/bash

# EcoSync Quick Start Script
# This script helps you set up the EcoSync application quickly

echo "🌍 EcoSync - Quick Start Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN} Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN} npm $(npm --version) detected${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN} Backend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install backend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Backend dependencies already installed${NC}"
fi
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN} Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Frontend dependencies already installed${NC}"
fi
cd ..

# Check for .env files
echo ""
echo "🔑 Checking environment variables..."

# Backend .env
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Creating from example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example server/.env
        echo -e "${GREEN} Created server/.env${NC}"
        echo -e "${YELLOW}⚠️  Please edit server/.env and add your API keys${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN} Backend .env file exists${NC}"
fi

# Frontend .env
if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env file not found. Creating...${NC}"
    cat > client/.env << 'EOF'
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
EOF
    echo -e "${GREEN} Created client/.env${NC}"
    echo -e "${YELLOW}⚠️  Please edit client/.env and add your Mapbox token${NC}"
else
    echo -e "${GREEN} Frontend .env file exists${NC}"
fi

# Check if MongoDB is running
echo ""
echo "🍃 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.version()" --quiet > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN} MongoDB is running locally${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB not running. Please start MongoDB or use MongoDB Atlas${NC}"
        echo "   Start MongoDB: brew services start mongodb-community (macOS)"
        echo "   Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB not detected locally. Please install MongoDB or use Atlas${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit environment files with your API keys:"
echo "   - server/.env (Gemini API key, MongoDB URI)"
echo "   - client/.env (Mapbox token)"
echo ""
echo "2. Start the application:"
echo "   Terminal 1 (Backend):  cd server && npm run dev"
echo "   Terminal 2 (Frontend): cd client && npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo -e "${YELLOW}📚 For detailed setup instructions, see SETUP.md${NC}"
echo ""
