import React from 'react';
import { MessageSquare, FileUp, History, Image } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Welcome to Chat AI</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Ask questions, upload files, analyze images, and get insights from your documents.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
            <div className="flex justify-center mb-3">
              <MessageSquare size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Ask Questions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Get answers with sources and citations
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
            <div className="flex justify-center mb-3">
              <Image size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Analyze Images</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload graphs, charts, or any image for AI analysis
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
            <div className="flex justify-center mb-3">
              <FileUp size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Upload Files</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Process Excel files and get insights
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
            <div className="flex justify-center mb-3">
              <History size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-2">Chat History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Access your previous conversations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;