import React, { useState, useRef } from 'react';
import { Send, Loader, Sparkles } from 'lucide-react';
import './AIAssistant.css';

const AIAssistant = ({ onParametersChange, onLayerChange, onLocationChange, isSidebarCollapsed }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(null);
  const [showLastInteraction, setShowLastInteraction] = useState(false);
  const inputRef = useRef(null);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setShowResponse(false);
    setResponse(null);

    try {
      const contextualQuery = `Current date and time: ${getCurrentDateTime()}. User query: ${userMessage}`;
      
      const apiResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: contextualQuery,
          originalQuery: userMessage 
        })
      });

      if (!apiResponse.ok) throw new Error('Failed to get AI response');

      const data = await apiResponse.json();
      
      const responseData = {
        text: data.response?.summary || data.response || 'Data loaded successfully',
        parameters: data.response?.parameters || data.parameters,
        layers: data.response?.layers
      };
      setResponse(responseData);
      setShowResponse(true);
      
      // Store last interaction
      setLastInteraction({
        query: userMessage,
        response: responseData.text,
        timestamp: getCurrentDateTime()
      });

      if (data.parameters && onParametersChange) {
        onParametersChange(data.parameters);
      }

      if (data.response?.layers && onLayerChange) {
        const layerArray = Object.keys(data.response.layers).filter(
          key => data.response.layers[key]
        );
        onLayerChange(layerArray);
      }

      if (data.visualization && onLocationChange) {
        const [lon, lat] = data.visualization.center;
        onLocationChange({
          lat: lat,
          lon: lon,
          zoom: data.visualization.zoom
        });
      }

      setTimeout(() => {
        setShowResponse(false);
      }, 8000);

    } catch (error) {
      console.error('AI Error:', error);
      setResponse({
        text: 'Sorry, I encountered an error. Please try again.',
        error: true
      });
      setShowResponse(true);
      
      setTimeout(() => {
        setShowResponse(false);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputHover = () => {
    if (lastInteraction) {
      setShowLastInteraction(true);
    }
  };

  const handleInputLeave = () => {
    setShowLastInteraction(false);
  };

  return (
    <div className="ai-assistant-container">
      {showLastInteraction && lastInteraction && (
        <div className="last-interaction-toast">
          <div className="last-query">
            <span className="label">Last Query:</span>
            <p>{lastInteraction.query}</p>
          </div>
          <div className="last-response">
            <span className="label">Response:</span>
            <p>{lastInteraction.response}</p>
          </div>
          <div className="timestamp">{lastInteraction.timestamp}</div>
        </div>
      )}
      {showResponse && response && (
        <div className={`ai-response-toast ${response.error ? 'error' : ''}`}>
          <div className="response-content">
            <Sparkles className="response-icon" size={18} />
            <p>{response.text}</p>
          </div>
          {response.layers && (
            <div className="response-layers">
              {Object.keys(response.layers)
                .filter(key => response.layers[key])
                .map((layer, i) => (
                  <span key={i} className="layer-badge">{layer}</span>
                ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ai-input-bar">
        <div 
          className="input-wrapper"
          onMouseEnter={handleInputHover}
          onMouseLeave={handleInputLeave}
        >
          <Sparkles className="ai-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about environmental data..."
            className="ai-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="ai-submit-btn"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader className="spinner" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
