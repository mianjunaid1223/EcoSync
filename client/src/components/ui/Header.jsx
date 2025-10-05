import React from 'react';
import { Cloud, Menu } from 'lucide-react';
import './Header.css';

const Header = ({ 
  toggleSidebar, 
  isSidebarCollapsed, 
  selectedParameters,
  nasaData,
  center
}) => {
  const getStatistics = () => {
    if (!nasaData?.properties?.parameter || !selectedParameters[0]) return null;
    
    const param = selectedParameters[0];
    const values = Object.values(nasaData.properties.parameter[param])
      .filter(val => val > -998); // Filter out invalid values
    
    if (values.length === 0) return null;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const formatValue = (val) => {
      if (param.startsWith('T2M')) return `${val.toFixed(1)}°C`;
      return val.toFixed(2);
    };
    
    return { avg: formatValue(avg), min: formatValue(min), max: formatValue(max) };
  };
  
  const stats = getStatistics();
  return (
    <header className="header">
      <button 
        className="toggle-sidebar" 
        onClick={toggleSidebar}
        aria-label={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
      >
        <Menu size={20} />
        <span>Options</span>
      </button>
      <div className="header-content">
        <div className="logo-section">
          <div className="title-section">
            <h1>EcoSync</h1>
            <p className="subtitle">From EarthData to Action: Forecasting Cleaner, Safer Skies</p>
          </div>
        </div>
        
        <div className="header-data-section">
          {selectedParameters && selectedParameters[0] && (
            <div className="header-legend">
              <h4>{selectedParameters[0]}</h4>
              <div className="legend-gradient">
                <span>Low</span>
                <div className="gradient-bar"></div>
                <span>High</span>
              </div>
            </div>
          )}
          {nasaData && stats && (
            <div className="header-info">
              <div className="info-item location">
                <span className="info-label">Location:</span>
                <span className="info-value">{center.lat.toFixed(2)}°, {center.lon.toFixed(2)}°</span>
              </div>
              <div className="info-item stats-grid">
                <div className="stat">
                  <span className="info-label">Average</span>
                  <span className="info-value highlight">{stats.avg}</span>
                </div>
                <div className="stat">
                  <span className="info-label">Min</span>
                  <span className="info-value low">{stats.min}</span>
                </div>
                <div className="stat">
                  <span className="info-label">Max</span>
                  <span className="info-value high">{stats.max}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
