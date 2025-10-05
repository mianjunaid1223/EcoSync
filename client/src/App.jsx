import React, { useState, useEffect, useMemo } from 'react';
import MapVisualization from './components/map/MapVisualization';
import AIAssistant from './components/ai/AIAssistant';
import ParameterControls from './components/ui/ParameterControls';
import Header from './components/ui/Header';
import './App.css';

function App() {
  const [selectedParameters, setSelectedParameters] = useState(['T2M']);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lon: 0 });
  const [mapZoom, setMapZoom] = useState(2);
  const [nasaData, setNasaData] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Global');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const defaultLayerState = useMemo(() => ({
    heatmap: true,
    scatter: false,
    geojson: true,
    text: true,
    arc: false,
    chloropleth: false,
    contour: false
  }), []);

  const [activeLayers, setActiveLayers] = useState({
    ...defaultLayerState,
    heatmap: false,
    geojson: false,
    text: false
  });
  const [loading, setLoading] = useState(false);

  // Update layers based on coordinates
  useEffect(() => {
    const isGlobalView = selectedCity === 'Global' || (mapCenter.lat === 0 && mapCenter.lon === 0);
    
    if (isGlobalView) {
      setActiveLayers(prev => {
        const newLayers = {...prev};
        Object.keys(newLayers).forEach(key => {
          newLayers[key] = false;
        });
        return newLayers;
      });
    } else {
      setActiveLayers(prev => ({
        ...prev,
        ...defaultLayerState
      }));
    }
  }, [selectedCity, mapCenter.lat, mapCenter.lon, defaultLayerState]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle AI parameters change
  const handleParametersChange = (parameters) => {
    setSelectedParameters(parameters);
  };

  // Handle AI layer recommendation
  const handleLayerChange = (recommendedLayers) => {
    const newLayers = { ...activeLayers };
    Object.keys(newLayers).forEach(key => {
      newLayers[key] = recommendedLayers.includes(key);
    });
    setActiveLayers(newLayers);
  };

  // Handle AI location change
  const handleLocationChange = (location) => {
    if (location && location.lat !== undefined && location.lon !== undefined) {
      setMapCenter({ lat: location.lat, lon: location.lon });
      setMapZoom(location.zoom || 10);
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
      
            <Header 
              toggleSidebar={toggleSidebar} 
              isSidebarCollapsed={isSidebarCollapsed}
              selectedParameters={selectedParameters}
              nasaData={nasaData}
              center={mapCenter}
              dataPoints={nasaData?.properties?.parameter && selectedParameters[0] ? 
                Object.values(nasaData.properties.parameter[selectedParameters[0]]).filter(value => value !== null).length : 0
              }
            />
      <div className={`main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="left-panel">
          <ParameterControls
            selectedParameters={selectedParameters}
            onParametersChange={setSelectedParameters}
            activeLayers={activeLayers}
            onToggleLayer={toggleLayer}
            selectedCity={selectedCity}
            onCityChange={(city, coords) => {
              setSelectedCity(city);
              if (city === 'Global') {
                setMapCenter({ lat: 0, lon: 0 });
                setMapZoom(2);
              } else {
                setMapCenter(coords);
                setMapZoom(10);
              }
            }}
          />
        </div>
        {/* Left Panel - Controls */}
        <div className={`left-panel ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          
          
          {!isSidebarCollapsed && (
            <ParameterControls
              selectedParameters={selectedParameters}
              onParametersChange={setSelectedParameters}
              activeLayers={activeLayers}
              onToggleLayer={toggleLayer}
              selectedCity={selectedCity}
              onCityChange={(city, coords) => {
                setSelectedCity(city);
                if (city === 'Global') {
                  setMapCenter({ lat: 0, lon: 0 });
                  setMapZoom(2);
                } else {
                  setMapCenter(coords);
                  setMapZoom(8);
                }
              }}
            />
          )}
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

      {/* Floating AI Assistant Dock */}
      <AIAssistant 
        onParametersChange={handleParametersChange} 
        onLayerChange={handleLayerChange}
        onLocationChange={handleLocationChange}
        isSidebarCollapsed={isSidebarCollapsed}
      />
    </div>
  );
}

export default App;
