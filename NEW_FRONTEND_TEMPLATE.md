# New Frontend Template

## Project Structure
```
new-frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── Chat/
│   │   │   ├── ChatArea.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── QuerySuggestions.jsx
│   │   ├── FileUpload/
│   │   │   ├── FileUpload.jsx
│   │   │   └── ImageUpload.jsx
│   │   ├── Admin/
│   │   │   ├── AdminPanel.jsx
│   │   │   └── UserManager.jsx
│   │   └── Common/
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       └── Loading.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useChat.js
│   │   └── useApi.js
│   ├── services/
│   │   ├── api.js
│   │   └── auth.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   └── styles/
│       └── index.css
└── public/
    └── assets/
```

## Package.json Dependencies
```json
{
  "name": "rag-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.8.0",
    "lucide-react": "^0.294.0",
    "react-dropzone": "^14.2.3",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

## API Service (src/services/api.js)
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  getUsers: () => api.get('/users'),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
  sendMessageStream: (data) => api.post('/chat/stream', data),
  createChat: () => api.post('/create-chat'),
  getChatHistory: () => api.get('/chat/history'),
};

export const suggestionsAPI = {
  getFollowUpSuggestions: (data) => api.post('/suggestions/follow-up', data),
  getNewChatSuggestions: (data) => api.post('/suggestions/new-chat', data),
  getTopicSuggestions: (data) => api.post('/suggestions/topic', data),
  getClarifyingSuggestions: (data) => api.post('/suggestions/clarifying', data),
};

export const imageAnalysisAPI = {
  analyzeImage: (data) => api.post('/image-analysis', data),
  getAnalysisHistory: () => api.get('/image-analysis/history'),
  getAnalysisInfo: () => api.get('/image-analysis/info'),
  getAnalysisById: (id) => api.get(`/image-analysis/${id}`),
  deleteAnalysis: (id) => api.delete(`/image-analysis/${id}`),
};

export const fileAPI = {
  previewExcel: (data) => api.post('/preview-excel', data),
  batchProcess: (data) => api.post('/batch-process', data),
  downloadProcessed: () => api.get('/download/processed'),
};

export const adminAPI = {
  ingestDocuments: (data) => api.post('/admin/ingest', data),
};

export default api;
```

## Authentication Hook (src/hooks/useAuth.js)
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and set user
      setUser({ token }); // You might want to decode JWT or verify with backend
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser({ ...userData, token });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem('token', token);
      setUser({ ...newUser, token });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Chat Hook (src/hooks/useChat.js)
```javascript
import { createContext, useContext, useState, useCallback } from 'react';
import { chatAPI, suggestionsAPI } from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message,
        chat_id: currentChat?.id,
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || [],
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Fetch follow-up suggestions
      fetchSuggestions();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentChat]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await suggestionsAPI.getFollowUpSuggestions({
        chat_id: currentChat?.id,
        chat_history: messages.slice(-10),
        max_suggestions: 6,
      });
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, [currentChat, messages]);

  const createNewChat = useCallback(async () => {
    try {
      const response = await chatAPI.createChat();
      setCurrentChat(response.data.chat);
      setMessages([]);
      setSuggestions([]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      currentChat,
      isLoading,
      suggestions,
      sendMessage,
      createNewChat,
      fetchSuggestions,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
```

## Main App Component (src/App.jsx)
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ChatProvider } from './hooks/useChat';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatArea from './components/Chat/ChatArea';
import AdminPanel from './components/Admin/AdminPanel';
import Loading from './components/Common/Loading';
import './styles/index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminPanel />
                </PrivateRoute>
              } />
              <Route path="/" element={
                <PrivateRoute>
                  <ChatArea />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
```

## Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=RAG Assistant
```

## Setup Instructions

1. Create a new React project:
   ```bash
   npm create vite@latest new-frontend -- --template react
   cd new-frontend
   ```

2. Install dependencies:
   ```bash
   npm install axios react-router-dom lucide-react react-dropzone react-hot-toast
   npm install -D tailwindcss postcss autoprefixer
   ```

3. Initialize Tailwind CSS:
   ```bash
   npx tailwindcss init -p
   ```

4. Copy the provided files to their respective locations

5. Update `tailwind.config.js`:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Key Features to Implement

1. **Authentication System** - Login/Register with JWT
2. **Chat Interface** - Real-time messaging with streaming
3. **File Upload** - Support for documents and images
4. **Query Suggestions** - Follow-up questions and new chat suggestions
5. **Image Analysis** - Upload and analyze images
6. **Admin Panel** - User management and document ingestion
7. **Responsive Design** - Mobile-friendly interface
8. **Dark Mode** - Theme switching capability

## Backend Integration Checklist

- [ ] Set up CORS in backend to allow frontend domain
- [ ] Configure environment variables
- [ ] Test all API endpoints
- [ ] Set up authentication middleware
- [ ] Configure file upload limits
- [ ] Set up streaming responses
- [ ] Test image analysis functionality
- [ ] Verify admin endpoints work correctly 