# Backend & Frontend Separation Guide

## 📋 Summary

Your RAG system has been successfully reorganized with the backend in a dedicated folder and enhanced follow-up questions feature. Here's what you need to share and how to build a new frontend.

## 🗂️ Backend Files to Share

### Essential Files (Copy these to the other system):
```
backend/
├── rag_backend.py              # Main Flask app with all endpoints
├── rag_toolkit.py              # Core RAG functionality  
├── llm.py                      # LLM integration
├── config.py                   # Configuration management
├── requirements.txt            # Python dependencies
├── deploy.sh                   # Deployment script
├── start.sh                    # Start script
├── env_template.txt            # Environment template
├── README.md                   # Backend documentation
├── agents/                     # All AI agents (13 files)
└── tools/                      # All utility tools (9 files)
```

### Optional Files:
```
├── static/                     # Static files (if any)
├── uploads/                    # Upload directory (create if needed)
└── logs/                       # Log directory (create if needed)
```

## 🚀 Backend Setup Instructions

### 1. Copy Files
Copy the entire `backend/` folder to the other system.

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
cp env_template.txt .env
# Edit .env with your API keys and database settings
```

### 4. Start Backend
```bash
chmod +x deploy.sh start.sh
./deploy.sh
./start.sh
```

## 🎨 New Frontend Development

### Technology Stack Recommendation:
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Context + Hooks
- **UI Components**: Lucide React (icons)
- **File Upload**: React Dropzone
- **Notifications**: React Hot Toast

### Key Features to Implement:

#### 1. Authentication System
- Login/Register forms
- JWT token management
- Protected routes
- User session management

#### 2. Chat Interface
- Real-time messaging
- Message history
- Streaming responses
- Message sources display

#### 3. Enhanced Follow-up Questions
- **4-8 questions** displayed in a grid layout
- **Automatic refresh** after each query
- **Context-aware** suggestions based on 5-10 previous exchanges
- **Click to use** functionality

#### 4. File Management
- Document upload (PDF, Excel, etc.)
- Image upload and analysis
- File preview
- Batch processing

#### 5. Admin Panel
- User management
- Document ingestion
- System monitoring

## 🔗 API Integration

### Base Configuration
```javascript
const API_BASE_URL = 'http://localhost:5000'; // or your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Authentication Headers
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Key Endpoints for Frontend:

#### Chat & Suggestions
```javascript
// Send message
POST /chat
POST /chat/stream

// Get suggestions
POST /suggestions/follow-up
POST /suggestions/new-chat
POST /suggestions/topic

// Chat management
POST /create-chat
GET /chat/history
```

#### File & Image Management
```javascript
// File upload
POST /preview-excel
POST /batch-process

// Image analysis
POST /image-analysis
GET /image-analysis/history
```

#### Authentication
```javascript
POST /login
POST /register
GET /users (admin)
```

## 🎯 Enhanced Follow-up Questions Implementation

### Backend Changes Made:
1. **Increased question count**: 4-8 questions instead of 3
2. **Extended context**: 5-10 previous exchanges instead of 2-3
3. **Better prompts**: More diverse and contextual suggestions
4. **Automatic refresh**: Triggers after every new query
5. **Improved layout**: Grid layout for better presentation

### Frontend Implementation:
```jsx
// QuerySuggestions component
const QuerySuggestions = ({ type, chatId, onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState([]);
  
  const fetchSuggestions = async () => {
    const response = await api.post('/suggestions/follow-up', {
      chat_id: chatId,
      chat_history: messages.slice(-10), // Last 10 messages
      max_suggestions: 6
    });
    setSuggestions(response.data.suggestions);
  };
  
  // Auto-refresh when messages change
  useEffect(() => {
    fetchSuggestions();
  }, [messages.length, chatId]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="p-3 text-left rounded-md border hover:bg-blue-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
```

## 🔧 Environment Configuration

### Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=mongodb://localhost:27017/rag_system
JWT_SECRET_KEY=your_jwt_secret
QDRANT_HOST=localhost
QDRANT_PORT=6333
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=RAG Assistant
```

## 🚀 Deployment Checklist

### Backend Deployment:
- [ ] Set up Python environment
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up MongoDB and Qdrant
- [ ] Configure CORS for frontend domain
- [ ] Test all endpoints
- [ ] Set up production server (gunicorn/nginx)

### Frontend Deployment:
- [ ] Build production bundle
- [ ] Configure API URL for production
- [ ] Set up hosting (Vercel/Netlify/AWS)
- [ ] Configure domain and SSL
- [ ] Test all functionality

## 📞 Support & Troubleshooting

### Common Issues:
1. **CORS errors**: Update CORS_ORIGINS in backend
2. **Authentication failures**: Check JWT configuration
3. **API connection**: Verify API_URL in frontend
4. **File uploads**: Check file size limits and allowed extensions

### Testing Endpoints:
```bash
# Test backend health
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 📚 Additional Resources

- **Backend Documentation**: `backend/README.md`
- **API Reference**: Check `rag_backend.py` for all endpoints
- **Configuration Guide**: `backend/config.py`
- **Deployment Scripts**: `backend/deploy.sh` and `backend/start.sh`

This setup provides a complete separation between backend and frontend while maintaining all the enhanced functionality, especially the improved follow-up questions feature with 4-8 questions, automatic refresh, and better context awareness. 