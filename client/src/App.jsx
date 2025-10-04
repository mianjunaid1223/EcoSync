import React, { useState, useEffect } from 'react';
import MapVisualization from './components/map/MapVisualization';
import AIAssistant from './components/ai/AIAssistant';
import ParameterControls from './components/ui/ParameterControls';
import Header from './components/ui/Header';
import './App.css';

function App() {
  const [selectedParameters, setSelectedParameters] = useState(['T2M', 'RH2M', 'AOD_55']);
  const [mapCenter, setMapCenter] = useState({ lat: 31.5497, lon: 74.3436 });
  const [mapZoom, setMapZoom] = useState(6);
  const [nasaData, setNasaData] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    scatter: false,
    geojson: false,
    text: false,
    arc: false
  });
  const [loading, setLoading] = useState(false);

  // Handle AI query response
  const handleAIResponse = (response) => {
    if (response.visualization) {
      const { center, zoom, parameters } = response.visualization;
      setMapCenter({ lat: center[1], lon: center[0] });
      setMapZoom(zoom || 10);
      setSelectedParameters(parameters);
    }
    if (response.nasaData) {
      setNasaData(response.nasaData);
    }
    if (response.response && response.response.city) {
      setSelectedCity(response.response.city);
    }
  };

  // Fetch NASA data when parameters or location change
  useEffect(() => {
    const fetchNASAData = async () => {
      if (selectedParameters.length === 0) return;

      setLoading(true);
      try {
        const params = selectedParameters.join(',');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/nasa/data?lat=${mapCenter.lat}&lon=${mapCenter.lon}&parameters=${params}`
        );
        const data = await response.json();
        if (data.success) {
          setNasaData(data.data);
        }
      } catch (error) {
        console.error('Error fetching NASA data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNASAData();
  }, [selectedParameters, mapCenter]);

  const toggleLayer = (layerName) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  return (
    <div className="app-container">
      <Header />
      
      <div className="main-layout">
        {/* Left Panel - Controls and AI */}
        <div className="left-panel">
          <AIAssistant onResponse={handleAIResponse} />
          
          <ParameterControls
            selectedParameters={selectedParameters}
            onParametersChange={setSelectedParameters}
            activeLayers={activeLayers}
            onToggleLayer={toggleLayer}
            selectedCity={selectedCity}
            onCityChange={(city, coords) => {
              setSelectedCity(city);
              setMapCenter(coords);
              setMapZoom(10);
            }}
          />
        </div>

        {/* Main Panel - Map */}
        <div className="map-panel">
          <MapVisualization
            center={mapCenter}
            zoom={mapZoom}
            nasaData={nasaData}
            selectedParameters={selectedParameters}
            activeLayers={activeLayers}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
