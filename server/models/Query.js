const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'anonymous'
  },
  query: {
    type: String,
    required: true
  },
  location: {
    city: String,
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  parameters: [String],
  response: {
    type: mongoose.Schema.Types.Mixed
  },
  nasaData: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Query', QuerySchema);
