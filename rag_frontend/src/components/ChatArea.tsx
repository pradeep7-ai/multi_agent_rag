import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import FileUpload from './FileUpload';
import ImageUpload from './ImageUpload';
import QuerySuggestions from './QuerySuggestions';
import { useChat } from '../context/ChatContext';
import SearchBar from './SearchBar';

const ChatArea: React.FC = () => {
  const {
    uploadedFile,
    filePreviewData,
    processFile,
    processingFile,
    downloadLink,
    sendMessage,
    transcriptionText,
    setTranscriptionText,
    searchTerm,
    setSearchTerm,
    messages,
    isLoading,
    scrollTrigger,
    currentChat,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  // Always show suggestions
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when messages change, loading state changes, or when switching chats
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollTrigger]);

  const handleTranscription = (text: string) => {
    console.log("Voice Transcription:", text);
    setInputValue(text);
    setTranscriptionText(text);
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
      setTranscriptionText('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Optionally, you can hide suggestions after click by uncommenting:
    // setShowSuggestions(false);
    // sendMessage(suggestion);
  };

  const getSuggestionType = () => {
    console.log('Messages:', messages.length, messages);
    if (messages.length === 0) {
      return 'new-chat';
    } else if (messages.length <= 4) { // Show follow-up for up to 2 user+bot exchanges
      return 'follow-up';
    }
    return 'clarifying';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Chat Assistant</h2>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
        <MessageList />
        
        {/* Query Suggestions */}
        {showSuggestions && (
          <div className="mt-4">
            <QuerySuggestions
              key={`${currentChat?.id}-${messages.length}`} // Force re-render when chat or messages change
              type={getSuggestionType()}
              chatId={currentChat?.id}
              onSuggestionClick={handleSuggestionClick}
              maxSuggestions={getSuggestionType() === 'follow-up' ? 6 : 3}
            />
          </div>
        )}
        
        {/* Invisible div for auto-scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload & Preview */}
      {uploadedFile && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="mb-2">
            <strong className="text-gray-800 dark:text-white">Excel File Preview:</strong>
            {filePreviewData ? (
              <pre className="text-xs mt-1 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto max-h-40">
                {JSON.stringify(filePreviewData, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading preview...</p>
            )}
          </div>

          <button
            onClick={processFile}
            disabled={processingFile}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {processingFile ? 'Processing...' : 'Process File'}
          </button>

          {downloadLink && (
            <div className="mt-2">
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Download Processed File
              </a>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end gap-4">
          <FileUpload />
          <ImageUpload />
          <ChatInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSend={handleSend}
            isLoading={isLoading}
            onTranscription={handleTranscription}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
