# RAG (Retrieval-Augmented Generation) System

A comprehensive document-based question-answering system with advanced AI agents, web scraping capabilities, and a modern React frontend.

## 🚀 Features

### Core RAG System
- **Document Ingestion**: Support for PDF, DOCX, Excel files with automatic text extraction
- **Intelligent Chunking**: Advanced document chunking with semantic boundaries
- **Vector Search**: High-performance similarity search using Qdrant vector database
- **Context-Aware Responses**: AI-generated answers based on retrieved document chunks
- **Source Attribution**: Automatic citation of source documents and pages

### AI Agents System
- **Query Suggestion Agent**: Generates follow-up questions and related queries
- **New Chat Suggestion Agent**: Suggests conversation starters and topics
- **Context Validator Agent**: Validates query relevance to available documents
- **Answer Validator Agent**: Ensures answer accuracy and completeness
- **Answer Synthesizer Agent**: Combines multiple sources into coherent responses
- **Query Analyzer Agent**: Analyzes query intent and complexity
- **Query Rephrase Agent**: Rephrases queries for better retrieval
- **Context Analyst Agent**: Analyzes document context and relevance
- **Query Splitter Agent**: Splits complex queries into simpler sub-queries
- **Introspector Agent**: Provides insights into retrieval process
- **Retriever Agent**: Manages document retrieval strategies

### Web Scraping Tools
- **Website Crawler**: Automatically crawls websites (up to 50 pages) and extracts content
- **PDF Generation**: Converts scraped content to searchable PDF documents
- **Content Aggregation**: Combines multiple pages into unified documents

### User Management
- **Authentication System**: JWT-based user authentication
- **Role-Based Access**: Admin and regular user roles
- **User Registration**: Admin-controlled user registration
- **Chat History**: Persistent conversation history per user

### Frontend Features
- **Modern React UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Real-time Chat**: Interactive chat interface with streaming responses
- **Document Viewer**: Integrated PDF viewer with page navigation
- **Source Citations**: Clickable source links with page references
- **Query Suggestions**: AI-powered query suggestions and follow-ups
- **Admin Panel**: User management interface for administrators
- **Responsive Design**: Mobile-friendly interface

### Batch Processing
- **Excel Integration**: Process queries from Excel files
- **Batch Query Processing**: Handle multiple queries simultaneously
- **Results Export**: Export processed results to Excel format

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**: Core application logic
- **Flask**: Web framework with RESTful API
- **MongoDB**: User data and chat history storage
- **Qdrant**: Vector database for similarity search
- **OpenAI**: Large language model integration
- **Sentence Transformers**: Text embedding generation
- **PyMuPDF**: PDF processing and text extraction
- **Beautiful Soup**: Web scraping and HTML parsing

### Frontend
- **React 18**: User interface framework
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

### AI/ML
- **Transformers**: Hugging Face transformers library
- **Torch**: PyTorch for deep learning operations
- **Sentence Transformers**: Text embedding models

## 📋 Prerequisites

### System Requirements
- Python 3.8 or higher
- Node.js 16 or higher
- MongoDB 4.4 or higher
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

### Required Software
- Git
- pip (Python package manager)
- npm (Node.js package manager)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ui_and_backend
```

### 2. Backend Setup

#### Option A: Using Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Option B: Using Conda
```bash
# Create conda environment
conda create -n rag-system python=3.9
conda activate rag-system

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd rag_frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Setup

#### MongoDB Installation

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Start MongoDB service

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 5. Environment Configuration

Create a `.env` file in the root directory:
```bash
# Backend configuration
SECRET_KEY=your_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/ai_chat

# Frontend configuration (if needed)
VITE_API_URL=http://localhost:5000
```

### 6. Initialize the System

#### Create Initial Admin User
```bash
python create_test_user.py
```

#### Ingest Documents
```bash
# Place your documents in rag_frontend/pdf/
python tools/ingest_v2.py
```

## 🎯 Usage

### Starting the Application

1. **Start MongoDB** (if not running as a service):
   ```bash
   mongod
   ```

2. **Start Backend Server**:
   ```bash
   python rag_backend.py
   ```
   The API will be available at `http://localhost:5000`

3. **Start Frontend Development Server**:
   ```bash
   cd rag_frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Basic Usage

1. **Login**: Use the admin credentials created during setup
2. **Upload Documents**: Place PDF, DOCX, or Excel files in the `rag_frontend/pdf/` directory
3. **Ingest Documents**: Run the ingestion script to process documents
4. **Ask Questions**: Use the chat interface to ask questions about your documents
5. **View Sources**: Click on source citations to view the original documents

### Advanced Features

#### Web Scraping
```bash
# Scrape a website and create PDF
python tools/scraper.py
```

#### Batch Processing
1. Prepare an Excel file with queries
2. Use the batch processing endpoint: `POST /batch-process`
3. Download results: `GET /download/processed`

#### Query Suggestions
- **Follow-up Questions**: AI suggests related questions based on current conversation
- **New Chat Topics**: AI suggests conversation starters
- **Topic Suggestions**: AI suggests relevant topics to explore
- **Clarifying Questions**: AI asks for clarification when queries are ambiguous

## 🔧 Configuration

### Backend Configuration

#### API Endpoints
- `POST /login` - User authentication
- `POST /register` - User registration (admin only)
- `POST /chat` - Send chat messages
- `POST /create-chat` - Create new chat session
- `GET /chat/history` - Get chat history
- `POST /suggestions/*` - Get AI suggestions
- `GET /users` - List users (admin only)
- `DELETE /users/<id>` - Delete user (admin only)

#### Database Configuration
- **MongoDB Collections**:
  - `users`: User accounts and authentication
  - `chats`: Chat history and conversations

#### Vector Database Configuration
- **Qdrant**: Vector similarity search
- **Embedding Model**: Sentence transformers for text embeddings
- **Chunk Size**: Configurable document chunking

### Frontend Configuration

#### Development
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Environment Variables
- `VITE_API_URL`: Backend API URL
- `VITE_APP_TITLE`: Application title

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests
python -m pytest tests/

# Test specific components
python test_context_validation.py
```

### Frontend Testing
```bash
cd rag_frontend
npm test
```

## 📊 Monitoring & Logs

### Log Files
- **Retrieval Logs**: `retrieval_logs/` directory contains detailed retrieval information
- **Application Logs**: Check console output for runtime information

### Performance Monitoring
- **Response Times**: Monitor API response times
- **Memory Usage**: Track memory consumption during document processing
- **Database Performance**: Monitor MongoDB query performance

## 🔒 Security

### Authentication
- JWT-based authentication with configurable expiration
- Password hashing using bcrypt
- Role-based access control

### Data Protection
- Input validation and sanitization
- CORS configuration for frontend access
- Secure headers and HTTPS support

### API Security
- Rate limiting (can be implemented)
- Input validation
- Error handling without information leakage

## 🚀 Deployment

### Production Deployment

#### Backend Deployment
```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 rag_backend:app
```

#### Frontend Deployment
```bash
cd rag_frontend
npm run build
# Deploy dist/ folder to your web server
```

#### Database Deployment
- Use MongoDB Atlas for cloud-hosted database
- Configure connection string in environment variables
- Set up proper authentication and network access

### Environment-Specific Configurations

#### Development
- Debug mode enabled
- Detailed logging
- Hot reload for frontend

#### Staging
- Limited debug information
- Performance monitoring
- Test data

#### Production
- Minimal logging
- Performance optimization
- Security hardening
- Load balancing

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

#### Python Dependencies
```bash
# Update pip
pip install --upgrade pip

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

#### Frontend Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Memory Issues
- Increase system RAM
- Optimize document chunking size
- Use database indexing

### Performance Optimization

#### Backend Optimization
- Use connection pooling for MongoDB
- Implement caching for frequently accessed data
- Optimize vector search parameters

#### Frontend Optimization
- Enable code splitting
- Optimize bundle size
- Implement lazy loading

## 📚 API Documentation

### Authentication
All API endpoints (except `/login`) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Chat Endpoints

#### Send Message
```http
POST /chat
Content-Type: application/json

{
  "query": "Your question here",
  "chat_id": "unique_chat_id",
  "context": "optional_context"
}
```

#### Create Chat
```http
POST /create-chat
Content-Type: application/json

{
  "title": "Chat Title"
}
```

### Suggestion Endpoints

#### Follow-up Suggestions
```http
POST /suggestions/follow-up
Content-Type: application/json

{
  "chat_history": ["previous_messages"],
  "current_query": "current_question"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- Update dependencies regularly
- Monitor system performance
- Backup database regularly
- Review and rotate API keys

### Version Updates
- Check for security updates
- Test new features in staging
- Update documentation
- Notify users of breaking changes 