import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { PlusCircle, MessageSquare, Moon, Sun, LogOut, Users, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import AdminRegister from './AdminRegister';
import AdminUserManager from './AdminUserManager';
import AdminIngestion from './AdminIngestion';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { chats, currentChat, createNewChat, switchChat, setChats } = useChat();
  const { theme, toggleTheme } = useTheme();
  const { logout, isAdmin } = useAuth();
  const [showAdminSection, setShowAdminSection] = useState(false);
  const [softDeletedChatIds, setSoftDeletedChatIds] = useState<string[]>([]);

  const handleSoftDelete = (chatId: string) => {
    setSoftDeletedChatIds((prev) => [...prev, chatId]);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Logo and Theme Toggle */}
          <Logo size="md" />
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <button
          onClick={() => {
            createNewChat();
            onClose();
          }}
          className="mt-4 flex items-center justify-center w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200"
        >
          <PlusCircle size={18} className="mr-2" />
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">Recent Chats</h2>
        <div className="space-y-1 mt-1">
          {chats.filter(chat => !softDeletedChatIds.includes(chat.id)).map((chat) => (
            <div key={chat.id} className="flex items-center group">
              <button
                onClick={() => {
                  switchChat(chat.id);
                  onClose();
                }}
                className={`flex-1 w-0 text-left px-3 py-2 rounded-md flex items-center transition-colors duration-200 ${
                  currentChat && chat.id === currentChat.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
              <button
                className="ml-1 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                title="Delete chat (soft delete)"
                onClick={() => handleSoftDelete(chat.id)}
                tabIndex={0}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowAdminSection(!showAdminSection)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              <span className="font-medium">Admin</span>
            </div>
            {showAdminSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {showAdminSection && (
            <div className="pb-4">
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Admin Tools</h4>
              </div>
              <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto px-1 pt-2">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <AdminRegister />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <AdminUserManager />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <AdminIngestion />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </button>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          © 2025 Chat AI Assistant
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
