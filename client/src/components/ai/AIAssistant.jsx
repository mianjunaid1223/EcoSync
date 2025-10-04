import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import './AIAssistant.css';

const AIAssistant = ({ onResponse }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your EcoSync AI assistant. Ask me about air quality, weather, or atmospheric data in any city!\n\nTry: "Show me air quality in Lahore" or "Compare temperature and humidity in Karachi"'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userMessage })
      });

      const data = await response.json();

      if (data.success) {
        // Add AI response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response.summary
        }]);

        // Notify parent component
        if (onResponse) {
          onResponse(data);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('AI Query Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Failed to connect to the server. Please check your connection.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Show air quality in New York',
    'Temperature in Tokyo',
    'Compare humidity in Dubai and Paris'
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="ai-assistant card">
      <div className="ai-header">
        <div className="ai-title">
          <Bot className="ai-icon" size={20} />
          <h3>AI Assistant</h3>
        </div>
        <div className="ai-status">
          <div className={`status-dot ${loading ? 'pulse' : ''}`}></div>
          <span>{loading ? 'Thinking...' : 'Ready'}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Loader className="spinning" size={16} />
            </div>
            <div className="message-content typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-questions">
        <span className="quick-label">Quick questions:</span>
        <div className="quick-buttons">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className="quick-btn"
              onClick={() => handleQuickQuestion(question)}
              disabled={loading}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about weather, air quality, or any city..."
          className="input"
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary send-btn"
          disabled={loading || !input.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
