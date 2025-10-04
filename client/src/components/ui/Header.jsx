import React from 'react';
import { Cloud, Wind, Droplets, Gauge } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">
            <Cloud className="logo-icon" size={28} />
          </div>
          <div className="title-section">
            <h1>EcoSync</h1>
            <p className="subtitle">From EarthData to Action: Forecasting Cleaner, Safer Skies</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <Wind size={16} />
            <span>Real-time Data</span>
          </div>
          <div className="stat-item">
            <Droplets size={16} />
            <span>NASA POWER API</span>
          </div>
          <div className="stat-item">
            <Gauge size={16} />
            <span>AI Powered</span>
          </div>
        </div>

        <div className="header-badge">
          <span className="badge">NASA Space Apps 2025</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
