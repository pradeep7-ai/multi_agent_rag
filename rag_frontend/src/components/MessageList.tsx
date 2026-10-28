import React from 'react';
import { useChat } from '../context/ChatContext';
import Message from './Message';
import WelcomeScreen from './WelcomeScreen';

const MessageList: React.FC = () => {
  const { messages, isLoading, searchTerm } = useChat(); // ✅ only messages, not history

  const filteredMessages = searchTerm
    ? messages.filter((msg) =>
        msg.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  if (filteredMessages.length === 0 && !isLoading) {
    return <WelcomeScreen />;
  }

  return (
    <div className="space-y-6">
      {filteredMessages.map((message) => (
        <Message key={message.id} message={message} searchTerm={searchTerm} />
      ))}

      {isLoading && (
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-300">AI</span>
          </div>
          <div className="ml-3 max-w-3xl bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm animate-pulse">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
