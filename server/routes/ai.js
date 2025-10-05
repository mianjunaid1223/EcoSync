const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// City coordinates database (expandable)
const CITY_COORDINATES = {
  'lahore': { lat: 31.5497, lon: 74.3436, country: 'Pakistan' },
  'karachi': { lat: 24.8607, lon: 67.0011, country: 'Pakistan' },
  'islamabad': { lat: 33.6844, lon: 73.0479, country: 'Pakistan' },
  'new york': { lat: 40.7128, lon: -74.0060, country: 'USA' },
  'london': { lat: 51.5074, lon: -0.1278, country: 'UK' },
  'tokyo': { lat: 35.6762, lon: 139.6503, country: 'Japan' },
  'dubai': { lat: 25.2048, lon: 55.2708, country: 'UAE' },
  'paris': { lat: 48.8566, lon: 2.3522, country: 'France' },
  'beijing': { lat: 39.9042, lon: 116.4074, country: 'China' },
  'delhi': { lat: 28.7041, lon: 77.1025, country: 'India' },
  'los angeles': { lat: 34.0522, lon: -118.2437, country: 'USA' },
  'sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
};

/**
 * POST /api/ai/query
 * Process user query with Gemini AI and fetch NASA data
 */
router.post('/query', async (req, res) => {
  try {
    const { query, userId = 'anonymous' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Step 1: Use Gemini to parse the query
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in server environment.' });
    }
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    } catch (initError) {
      console.error('Gemini Model Init Error:', initError);
      return res.status(500).json({ error: 'Failed to initialize Gemini model', message: initError.message });
    }

    const systemPrompt = `You are a map assistant integrated in an air quality and atmospheric data forecasting app called EcoSync.

When the user asks for data about a specific city or region, you should only give direct responses:
1. Extract the city name from the query
2. Identify which atmospheric parameters they're interested in (temperature, humidity, precipitation, wind speed, pressure, aerosol optical depth, air quality)
3. Return a structured JSON response

Available NASA POWER parameters:
- T2M: Temperature at 2 Meters (°C, NASA POWER provides daily temperatures directly in Celsius) if it isn't available, don't mention it
- RH2M: Relative Humidity at 2 Meters (%) if it isn't available, don't mention it
- PRECTOT: Precipitation (mm/day) if it isn't available, don't mention it
- WS2M: Wind Speed at 2 Meters (m/s) if it isn't available, don't mention it
- PS: Surface Pressure (kPa) if it isn't available, don't mention it
- AOD_55: Aerosol Optical Depth (proxy for air quality) if it isn't available, don't mention it

If any data of the required location or parameter is not available, give the average answer of that area, like if user ask for temperature of lahore, and the temperature is not available then give the average temperature of lahore
. If no data is available at all, generate sample relevant data. But dont mention this, also if the provided data is sample, dont mention in parameters that no data is available.

The user might also ask for comparisons between cities or trends over time. In such cases, identify the cities and parameters involved and return them in the response.

City coordinates database:
${JSON.stringify(CITY_COORDINATES, null, 2)}

User Query: "${query}"

Return ONLY a JSON object with this structure:
{
  "city": "city name",
  "coordinates": {"lat": number, "lon": number},
  "parameters": ["T2M", "RH2M", ...],
  "summary": "brief human-readable response",
  "action": "visualize|compare|analyze"
}

If city not found in database, use your knowledge to provide approximate coordinates.`;

    let result, aiResponse;
    try {
      result = await model.generateContent(systemPrompt);
      aiResponse = result.response.text();
    } catch (aiError) {
      console.error('Gemini API Error:', aiError);
      return res.status(502).json({ error: 'Gemini API request failed', message: aiError.message });
    }

    // Parse AI response
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, aiResponse);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse,
        parseError: parseError.message
      });
    }

    // Step 2: Fetch NASA data for the identified location
    const { coordinates, parameters } = parsedResponse;

    if (!coordinates || !parameters || parameters.length === 0) {
      return res.json({
        success: true,
        response: parsedResponse,
        message: 'Could not identify specific location or parameters',
        debug: { coordinates, parameters }
      });
    }

    // Fetch NASA data
    const nasaParams = parameters.join(',');
    const endDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0].replace(/-/g, '');

    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${nasaParams}&community=RE&longitude=${coordinates.lon}&latitude=${coordinates.lat}&start=${startDate}&end=${endDate}&format=JSON`;

    let nasaData = null;
    try {
      const nasaResponse = await axios.get(nasaUrl);
      nasaData = nasaResponse.data;
    } catch (nasaError) {
      console.error('NASA API Error:', nasaError.message, nasaError.response?.data);
      nasaData = { error: 'NASA API request failed', message: nasaError.message, nasaResponse: nasaError.response?.data || null };
    }

    // Step 3: Generate enhanced summary with actual data
    let enhancedSummary = parsedResponse.summary;
    if (nasaData && nasaData.properties && nasaData.properties.parameter) {
      const latestDate = Object.keys(nasaData.properties.parameter[parameters[0]] || {}).pop();
      const dataPoints = parameters.map(param => {
        const value = nasaData.properties.parameter[param]?.[latestDate];
        if (value === undefined || value <= -998) return `${param}: No data`;
        const formattedValue = param.startsWith('T2M') ? 
          `${value.toFixed(1)}°C` : 
          value.toFixed(2);
        return `${param}: ${formattedValue}`;
      }).join(', ');
      
      enhancedSummary += `\n\nLatest data (${latestDate}): ${dataPoints}`;
    }

    // Return combined response
    res.json({
      success: true,
      query,
      response: {
        ...parsedResponse,
        summary: enhancedSummary
      },
      nasaData,
      visualization: {
        center: [coordinates.lon, coordinates.lat],
        zoom: 10,
        parameters
      }
    });
  } catch (error) {
    console.error('AI Query Route Error:', error);
    res.status(500).json({ 
      error: 'Internal server error in AI route',
      message: error.message 
    });
  }
});

/**
 * GET /api/ai/cities
 * Get list of available cities
 */
router.get('/cities', (req, res) => {
  res.json({
    success: true,
    cities: CITY_COORDINATES
  });
});

module.exports = router;
