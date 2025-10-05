const express = require('express');
const router = express.Router();
const Query = require('../models/Query');

/**
 * POST /api/queries
 * Save a query to the database
 */
router.post('/', async (req, res) => {
  try {
    const query = new Query(req.body);
    await query.save();
    
    res.status(201).json({
      success: true,
      query
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to save query',
      message: error.message 
    });
  }
});

/**
 * GET /api/queries
 * Get query history
 */
router.get('/', async (req, res) => {
  try {
    const queries = await Query.find()
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json({
      success: true,
      queries
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch queries',
      message: error.message 
    });
  }
});

module.exports = router;
