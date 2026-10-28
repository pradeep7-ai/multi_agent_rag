import React from 'react';
import { Message as MessageType } from '../types';
import SourceList from './SourceList';
import { useAuth } from '../context/AuthContext';

interface MessageProps {
  message: MessageType;
  searchTerm?: string; 
}

const highlightText = (text: string, term: string) => {
  if (!term) return text;

  const parts = text.split(new RegExp(`(${term})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

function getInitials(name: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Message: React.FC<MessageProps> = ({ message, searchTerm = '' }) => {
  const isUser = message.role === 'user';
  const { username } = useAuth();

  return (
    <div className={`flex items-start ${isUser ? 'justify-end' : ''}`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
          {isUser ? (
            <div className="bg-indigo-100 dark:bg-indigo-900 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-indigo-700 dark:text-indigo-200 font-bold text-lg">
                {getInitials(username)}
              </span>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">AI</span>
            </div>
          )}
        </div>

        <div className={`max-w-3xl ${isUser ? 'mr-3' : 'ml-3'}`}>
          <div
            className={`rounded-lg px-4 py-3 shadow-sm ${
              isUser
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            {/* Display image if present */}
            {message.image && (
              <div className="mb-3">
                <img
                  src={message.image.url}
                  alt={message.image.filename}
                  className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                  style={{ maxHeight: '300px' }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.image.filename}
                </p>
              </div>
            )}

            <p className="whitespace-pre-wrap">
              {highlightText(message.content, searchTerm)}
            </p>

            {message.role === 'assistant' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {message.sources && message.sources.length > 0 ? (
                  <SourceList sources={message.sources} />
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">No sources found for this answer.</div>
                )}
              </div>
            )}
          </div>

          <div
            className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
