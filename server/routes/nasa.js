const express = require('express');
const router = express.Router();
const axios = require('axios');

// NASA POWER API Configuration
const NASA_API_BASE = 'https://power.larc.nasa.gov/api/temporal/daily/point';

/**
 * GET /api/nasa/data
 * Fetch NASA POWER API data for given coordinates and parameters
 */
router.get('/data', async (req, res) => {
  try {
    const { lat, lon, parameters, start, end } = req.query;

    // Validation
    if (!lat || !lon || !parameters) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat, lon, parameters',
        details: { lat, lon, parameters }
      });
    }

    // Default date range (last 30 days)
    const endDate = end || new Date().toISOString().split('T')[0].replace(/-/g, '');
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0].replace(/-/g, '');

    // Build NASA API URL
    const params = parameters.split(',').join(',');
    const url = `${NASA_API_BASE}?parameters=${params}&community=RE&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;

    let response;
    try {
      response = await axios.get(url);
    } catch (apiError) {
      console.error('NASA API Error:', apiError.message, apiError.response?.data);
      return res.status(502).json({
        error: 'NASA API request failed',
        message: apiError.message,
        nasaResponse: apiError.response?.data || null
      });
    }

    // Process and validate data
    const processedData = {
      ...response.data,
      properties: {
        parameter: {}
      }
    };

    // Process each parameter
    Object.entries(response.data.properties.parameter).forEach(([param, values]) => {
      processedData.properties.parameter[param] = {};
      
      // Process each date's value
      Object.entries(values).forEach(([date, value]) => {
        // NASA POWER uses -999 or -998 as fill values for missing data
        if (value > -998) {
          if (param.startsWith('T2M')) { // Handle all T2M parameters
            // NASA POWER temperatures are in Celsius for daily data
            processedData.properties.parameter[param][date] = value;
          } else {
            processedData.properties.parameter[param][date] = value;
          }
        }
      });
    });

    res.json({
      success: true,
      data: processedData,
      metadata: {
        coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
        parameters: params.split(','),
        dateRange: { start: startDate, end: endDate }
      }
    });

  } catch (error) {
    console.error('NASA API Route Error:', error);
    res.status(500).json({ 
      error: 'Internal server error in NASA route',
      message: error.message 
    });
  }
});

/**
 * GET /api/nasa/regional
 * Fetch NASA data for a region (grid of points)
 */
router.get('/regional', async (req, res) => {
  try {
    const { latMin, latMax, lonMin, lonMax, parameters } = req.query;

    if (!latMin || !latMax || !lonMin || !lonMax || !parameters) {
      return res.status(400).json({ 
        error: 'Missing required parameters: latMin, latMax, lonMin, lonMax, parameters' 
      });
    }

    // Create a grid of points (for heatmap visualization)
    const gridSize = 5; // 5x5 grid
    const latStep = (parseFloat(latMax) - parseFloat(latMin)) / gridSize;
    const lonStep = (parseFloat(lonMax) - parseFloat(lonMin)) / gridSize;

    const dataPoints = [];

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = parseFloat(latMin) + (i * latStep);
        const lon = parseFloat(lonMin) + (j * lonStep);

        dataPoints.push({ lat, lon });
      }
    }

    // Fetch data for each point (in parallel)
    const promises = dataPoints.map(point => 
      axios.get(`${NASA_API_BASE}?parameters=${parameters}&community=RE&longitude=${point.lon}&latitude=${point.lat}&start=20240101&end=20241004&format=JSON`)
        .then(response => ({
          coordinates: [point.lon, point.lat],
          data: response.data
        }))
        .catch(() => null)
    );

    const results = await Promise.all(promises);
    const validResults = results.filter(r => r !== null);

    res.json({
      success: true,
      data: validResults,
      metadata: {
        region: { latMin, latMax, lonMin, lonMax },
        gridSize,
        totalPoints: validResults.length
      }
    });

  } catch (error) {
    console.error('Regional NASA API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch regional NASA data',
      message: error.message 
    });
  }
});

module.exports = router;
