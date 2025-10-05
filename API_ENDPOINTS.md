# EcoSync API Endpoints

Base URL: `http://localhost:5000`

## Health Check
```
GET /health
```
Returns server status

## NASA Data Endpoints

### Get Point Data
```
GET /api/nasa/data
```
**Query Parameters:**
- `lat` - Latitude (required)
- `lon` - Longitude (required)
- `parameters` - Comma-separated NASA parameters (required)
  - Available: T2M, RH2M, PRECTOT, WS2M, PS, AOD_55
- `start` - Start date (YYYYMMDD, optional)
- `end` - End date (YYYYMMDD, optional)

**Example:**
```
GET /api/nasa/data?lat=31.5497&lon=74.3436&parameters=T2M,RH2M,AOD_55
```

### Get Regional Data
```
GET /api/nasa/regional
```
**Query Parameters:**
- `latMin` - Minimum latitude (required)
- `latMax` - Maximum latitude (required)
- `lonMin` - Minimum longitude (required)
- `lonMax` - Maximum longitude (required)
- `parameters` - Comma-separated NASA parameters (required)

**Example:**
```
GET /api/nasa/regional?latMin=31&latMax=32&lonMin=74&lonMax=75&parameters=T2M,AOD_55
```

## AI Assistant Endpoints

### Query AI Assistant
```
POST /api/ai/query
```
**Body:**
```json
{
  "query": "Show me air quality in Lahore",
  "userId": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "query": "Show me air quality in Lahore",
  "response": {
    "city": "Lahore",
    "coordinates": {"lat": 31.5497, "lon": 74.3436},
    "parameters": ["T2M", "AOD_55"],
    "summary": "Current air quality data for Lahore...",
    "action": "visualize"
  },
  "nasaData": {...},
  "visualization": {
    "center": [74.3436, 31.5497],
    "zoom": 10,
    "parameters": ["T2M", "AOD_55"]
  }
}
```

### Get Available Cities
```
GET /api/ai/cities
```
Returns list of predefined cities with coordinates

## Query History Endpoints

### Get All Queries
```
GET /api/queries
```
**Query Parameters:**
- `limit` - Number of records (default: 50)

### Save Query
```
POST /api/queries
```
**Body:**
```json
{
  "query": "user query text",
  "response": {...},
  "userId": "optional_user_id"
}
```

### Get Query by ID
```
GET /api/queries/:id
```

### Delete Query
```
DELETE /api/queries/:id
```

## NASA POWER Parameters

- **T2M** - Temperature at 2 Meters (°C)
- **RH2M** - Relative Humidity at 2 Meters (%)
- **PRECTOT** - Precipitation (mm/day)
- **WS2M** - Wind Speed at 2 Meters (m/s)
- **PS** - Surface Pressure (kPa)
- **AOD_55** - Aerosol Optical Depth at 550nm (air quality proxy)

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## CORS

CORS is enabled for all origins in development mode.
