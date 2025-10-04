import React, { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { ScatterplotLayer, TextLayer, ArcLayer, GeoJsonLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapVisualization.css';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGhhdGp1bmFpZCIsImEiOiJjbWdjMnY2cTExNDA4MmxzYTFsdWNqc2ZkIn0.4D5aI8pyuzbsaLZeVvYV8Q';

const MapVisualization = ({ 
  center, 
  zoom, 
  nasaData, 
  selectedParameters, 
  activeLayers,
  loading 
}) => {
  const [mapStyle, setMapStyle] = React.useState('mapbox://styles/mapbox/dark-v11');

  const viewState = {
    longitude: center.lon,
    latitude: center.lat,
    zoom: zoom,
    pitch: 0,
    bearing: 0
  };

  const mapStyles = {
    dark: 'mapbox://styles/mapbox/dark-v11',
    light: 'mapbox://styles/mapbox/light-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    navigation: 'mapbox://styles/mapbox/navigation-day-v1'
  };

  // Generate data points from NASA data
  const dataPoints = useMemo(() => {
    if (!nasaData || !nasaData.properties || !nasaData.properties.parameter) {
      return [];
    }

    const parameter = nasaData.properties.parameter;
    const firstParam = selectedParameters[0];
    
    if (!parameter[firstParam]) return [];

    const dates = Object.keys(parameter[firstParam]);
    const latestDate = dates[dates.length - 1];

    // Generate grid points for visualization
    const points = [];
    const gridSize = 20;
    const spread = 2; // degrees

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = center.lat + (Math.random() - 0.5) * spread;
        const lon = center.lon + (Math.random() - 0.5) * spread;
        
        // Get value with some variance
        const baseValue = parameter[firstParam][latestDate] || 0;
        const value = baseValue + (Math.random() - 0.5) * baseValue * 0.2;

        points.push({
          position: [lon, lat],
          value: value,
          weight: Math.abs(value),
          parameter: firstParam,
          date: latestDate
        });
      }
    }

    return points;
  }, [nasaData, selectedParameters, center]);

  // Heatmap Layer
  const heatmapLayer = useMemo(() => {
    if (!activeLayers.heatmap || dataPoints.length === 0) return null;

    return new HeatmapLayer({
      id: 'heatmap-layer',
      data: dataPoints,
      getPosition: d => d.position,
      getWeight: d => d.weight,
      radiusPixels: 60,
      intensity: 1,
      threshold: 0.05,
      colorRange: [
        [0, 255, 0, 25],      // Green (low)
        [255, 255, 0, 85],    // Yellow
        [255, 165, 0, 127],   // Orange
        [255, 0, 0, 170],     // Red (high)
        [139, 0, 0, 255]      // Dark Red (extreme)
      ]
    });
  }, [activeLayers.heatmap, dataPoints]);

  // Scatterplot Layer
  const scatterplotLayer = useMemo(() => {
    if (!activeLayers.scatter || dataPoints.length === 0) return null;

    return new ScatterplotLayer({
      id: 'scatter-layer',
      data: dataPoints,
      getPosition: d => d.position,
      getRadius: d => Math.abs(d.value) * 1000,
      getFillColor: d => {
        const normalized = Math.min(Math.abs(d.value) / 50, 1);
        return [
          255 * normalized,
          255 * (1 - normalized),
          100,
          200
        ];
      },
      pickable: true,
      radiusMinPixels: 3,
      radiusMaxPixels: 30
    });
  }, [activeLayers.scatter, dataPoints]);

  // Text Layer
  const textLayer = useMemo(() => {
    if (!activeLayers.text || dataPoints.length === 0) return null;

    // Only show text for a subset of points
    const textPoints = dataPoints.filter((_, i) => i % 10 === 0);

    return new TextLayer({
      id: 'text-layer',
      data: textPoints,
      getPosition: d => d.position,
      getText: d => `${d.value.toFixed(1)}`,
      getSize: 12,
      getColor: [255, 255, 255, 255],
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      outlineWidth: 2,
      outlineColor: [0, 0, 0, 255],
      backgroundColor: [0, 0, 0, 180],
      backgroundPadding: [4, 2]
    });
  }, [activeLayers.text, dataPoints]);

  // Arc Layer (showing connections)
  const arcLayer = useMemo(() => {
    if (!activeLayers.arc || dataPoints.length === 0) return null;

    // Create arcs between random points
    const arcs = [];
    for (let i = 0; i < Math.min(20, dataPoints.length); i++) {
      const source = dataPoints[i];
      const target = dataPoints[(i + 5) % dataPoints.length];
      
      arcs.push({
        source: source.position,
        target: target.position,
        value: (source.value + target.value) / 2
      });
    }

    return new ArcLayer({
      id: 'arc-layer',
      data: arcs,
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      getSourceColor: [99, 102, 241],
      getTargetColor: [139, 92, 246],
      getWidth: 2,
      opacity: 0.3
    });
  }, [activeLayers.arc, dataPoints]);

  // GeoJSON Layer (region outlines)
  const geojsonLayer = useMemo(() => {
    if (!activeLayers.geojson) return null;

    // Create a simple circle around the center
    const circleGeoJSON = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          Array.from({ length: 64 }, (_, i) => {
            const angle = (i / 64) * Math.PI * 2;
            const radius = 0.5; // degrees
            return [
              center.lon + Math.cos(angle) * radius,
              center.lat + Math.sin(angle) * radius
            ];
          })
        ]
      }
    };

    return new GeoJsonLayer({
      id: 'geojson-layer',
      data: circleGeoJSON,
      filled: false,
      stroked: true,
      lineWidthMinPixels: 2,
      getLineColor: [99, 102, 241, 200],
      getLineWidth: 3
    });
  }, [activeLayers.geojson, center]);

  const layers = [
    heatmapLayer,
    geojsonLayer,
    scatterplotLayer,
    arcLayer,
    textLayer
  ].filter(Boolean);

  return (
    <div className="map-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">Loading data...</div>
        </div>
      )}
      
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        getTooltip={({ object }) => 
          object && {
            html: `
              <div style="background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 6px;">
                <strong>${object.parameter}</strong><br/>
                Value: ${object.value?.toFixed(2)}<br/>
                Date: ${object.date}
              </div>
            `,
            style: {
              color: '#fff',
              fontSize: '12px'
            }
          }
        }
      >
        <Map 
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={mapStyle}
        />
      </DeckGL>

      {/* Map Style Selector */}
      <div className="map-style-selector">
        <h4>Map Style</h4>
        <div className="style-buttons">
          <button 
            className={mapStyle === mapStyles.dark ? 'active' : ''}
            onClick={() => setMapStyle(mapStyles.dark)}
          >
            Dark
          </button>
          <button 
            className={mapStyle === mapStyles.light ? 'active' : ''}
            onClick={() => setMapStyle(mapStyles.light)}
          >
            Light
          </button>
          <button 
            className={mapStyle === mapStyles.streets ? 'active' : ''}
            onClick={() => setMapStyle(mapStyles.streets)}
          >
            Streets
          </button>
          <button 
            className={mapStyle === mapStyles.satellite ? 'active' : ''}
            onClick={() => setMapStyle(mapStyles.satellite)}
          >
            Satellite
          </button>
          <button 
            className={mapStyle === mapStyles.satelliteStreets ? 'active' : ''}
            onClick={() => setMapStyle(mapStyles.satelliteStreets)}
          >
            Hybrid
          </button>
          <button 
            className={mapStyle === mapStyles.outdoors ? 'active' : ''}
            onClick={() => setMapStyle(mapStyles.outdoors)}
          >
            Outdoors
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Parameter: {selectedParameters[0]}</h4>
        <div className="legend-gradient">
          <span>Low</span>
          <div className="gradient-bar"></div>
          <span>High</span>
        </div>
      </div>

      {/* Data Info */}
      {nasaData && (
        <div className="data-info">
          <div className="info-item">
            <span className="info-label">Location:</span>
            <span className="info-value">{center.lat.toFixed(4)}°, {center.lon.toFixed(4)}°</span>
          </div>
          <div className="info-item">
            <span className="info-label">Data Points:</span>
            <span className="info-value">{dataPoints.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;
