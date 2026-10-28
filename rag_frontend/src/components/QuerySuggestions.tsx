import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

interface QuerySuggestionsProps {
  type: 'new-chat' | 'follow-up' | 'clarifying' | 'topic';
  chatId?: string;
  topic?: string;
  onSuggestionClick: (suggestion: string) => void;
  maxSuggestions?: number;
  userPreference?: string;
}
const API_BASE_URL = 'http://localhost:5000';

export const QuerySuggestions: React.FC<QuerySuggestionsProps> = ({
  type,
  chatId,
  topic,
  onSuggestionClick,
  maxSuggestions = 6, // Default to 6 for follow-up questions
  userPreference = ''
}) => {
  const { token } = useAuth();
  const { currentChat, messages } = useChat();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      let payload: any = {};

      switch (type) {
        case 'new-chat':
          endpoint = '/suggestions/new-chat';
          payload = {
            max_suggestions: maxSuggestions,
            preference: userPreference
          };
          break;
        case 'follow-up':
          endpoint = '/suggestions/follow-up';
          payload = { 
            chat_id: chatId || currentChat?.id,
            max_suggestions: maxSuggestions,
            chat_history: messages.slice(-10) // Pass last 10 messages for context
          };
          break;
        case 'clarifying':
          endpoint = '/suggestions/clarifying';
          payload = { chat_id: chatId || currentChat?.id };
          break;
        case 'topic':
          endpoint = '/suggestions/topic';
          payload = {
            topic: topic || '',
            max_suggestions: maxSuggestions
          };
          break;
      }

      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to load suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [type, chatId, topic, maxSuggestions, userPreference, currentChat?.id, token, messages.length]);

  const getTitle = () => {
    switch (type) {
      case 'new-chat':
        return 'Suggested Questions';
      case 'follow-up':
        return 'Follow-up Questions';
      case 'clarifying':
        return 'Follow-up Questions';
      case 'topic':
        return `Questions about "${topic}"`;
      default:
        return 'Suggestions';
    }
  };

  if (loading) {
    return (
      <div className="query-suggestions">
        <h3 className="suggestions-title">{getTitle()}</h3>
        <div className="suggestions-loading">
          <div className="loading-spinner"></div>
          <span>Generating suggestions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="query-suggestions">
        <h3 className="suggestions-title">{getTitle()}</h3>
        <div className="suggestions-error">
          <span>{error}</span>
          <button 
            onClick={fetchSuggestions}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="query-suggestions">
      <h3 className="suggestions-title">{getTitle()}</h3>
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-button"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <button 
        onClick={fetchSuggestions}
        className="refresh-suggestions-button"
        title="Get new suggestions"
      >
        🔄 New Suggestions
      </button>
    </div>
  );
};

export default QuerySuggestions; 
