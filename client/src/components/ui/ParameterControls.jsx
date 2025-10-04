import React from 'react';
import { Thermometer, Droplet, Wind, Gauge, Eye, MapPin, Layers } from 'lucide-react';
import './ParameterControls.css';

const PARAMETERS = [
  { id: 'T2M', name: 'Temperature', icon: Thermometer, unit: '°C', description: 'Temperature at 2 Meters' },
  { id: 'RH2M', name: 'Humidity', icon: Droplet, unit: '%', description: 'Relative Humidity at 2 Meters' },
  { id: 'PRECTOT', name: 'Precipitation', icon: Droplet, unit: 'mm/day', description: 'Total Precipitation' },
  { id: 'WS2M', name: 'Wind Speed', icon: Wind, unit: 'm/s', description: 'Wind Speed at 2 Meters' },
  { id: 'PS', name: 'Pressure', icon: Gauge, unit: 'kPa', description: 'Surface Pressure' },
  { id: 'AOD_55', name: 'Air Quality', icon: Eye, unit: 'AOD', description: 'Aerosol Optical Depth (Air Quality Proxy)' }
];

const CITIES = [
  { name: 'Lahore', lat: 31.5497, lon: 74.3436, country: 'Pakistan' },
  { name: 'Karachi', lat: 24.8607, lon: 67.0011, country: 'Pakistan' },
  { name: 'Islamabad', lat: 33.6844, lon: 73.0479, country: 'Pakistan' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'India' }
];

const LAYER_TYPES = [
  { id: 'heatmap', name: 'Heatmap', description: 'Intensity visualization' },
  { id: 'scatter', name: 'Scatter Points', description: 'Individual data points' },
  { id: 'geojson', name: 'Region Outline', description: 'Geographic boundaries' },
  { id: 'text', name: 'Value Labels', description: 'Show numeric values' },
  { id: 'arc', name: 'Connections', description: 'Data flow arcs' }
];

const ParameterControls = ({ 
  selectedParameters, 
  onParametersChange, 
  activeLayers,
  onToggleLayer,
  selectedCity,
  onCityChange
}) => {
  const toggleParameter = (paramId) => {
    if (selectedParameters.includes(paramId)) {
      // Don't allow removing if it's the last one
      if (selectedParameters.length > 1) {
        onParametersChange(selectedParameters.filter(p => p !== paramId));
      }
    } else {
      onParametersChange([...selectedParameters, paramId]);
    }
  };

  const handleCityChange = (e) => {
    const city = CITIES.find(c => c.name === e.target.value);
    if (city) {
      onCityChange(city.name, { lat: city.lat, lon: city.lon });
    }
  };

  return (
    <div className="parameter-controls">
      {/* City Selection */}
      <div className="control-section card">
        <div className="section-header">
          <MapPin size={18} />
          <h3>Select Location</h3>
        </div>
        <select 
          className="select city-select"
          value={selectedCity}
          onChange={handleCityChange}
        >
          {CITIES.map(city => (
            <option key={city.name} value={city.name}>
              {city.name}, {city.country}
            </option>
          ))}
        </select>
      </div>

      {/* Parameter Selection */}
      <div className="control-section card">
        <div className="section-header">
          <Gauge size={18} />
          <h3>Data Parameters</h3>
        </div>
        <div className="parameter-grid">
          {PARAMETERS.map(param => {
            const Icon = param.icon;
            const isSelected = selectedParameters.includes(param.id);
            return (
              <button
                key={param.id}
                className={`parameter-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleParameter(param.id)}
                title={param.description}
              >
                <Icon size={16} />
                <span className="param-name">{param.name}</span>
                {isSelected && <div className="check-mark">✓</div>}
              </button>
            );
          })}
        </div>
        <div className="selected-count">
          {selectedParameters.length} parameter{selectedParameters.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      {/* Layer Controls */}
      <div className="control-section card">
        <div className="section-header">
          <Layers size={18} />
          <h3>Visualization Layers</h3>
        </div>
        <div className="layer-toggles">
          {LAYER_TYPES.map(layer => (
            <div key={layer.id} className="layer-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={activeLayers[layer.id]}
                  onChange={() => onToggleLayer(layer.id)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  <strong>{layer.name}</strong>
                  <small>{layer.description}</small>
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section card">
        <h4>💡 Tips</h4>
        <ul>
          <li>Use the AI assistant to query specific locations</li>
          <li>Select multiple parameters to compare data</li>
          <li>Toggle layers for different visualizations</li>
          <li>Hover over map points to see detailed values</li>
        </ul>
      </div>
    </div>
  );
};

export default ParameterControls;
