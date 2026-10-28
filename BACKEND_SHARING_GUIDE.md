# Backend Sharing Guide

## Essential Files to Share

### Core Backend Files
```
backend/
├── rag_backend.py              # Main Flask application with all endpoints
├── rag_toolkit.py              # Core RAG functionality
├── llm.py                      # LLM integration
├── requirements.txt            # Python dependencies
└── agents/                     # AI agents for different functionalities
    ├── conversation_context_agent.py
    ├── query_suggestion_agent.py
    ├── image_analysis_agent.py
    ├── new_chat_suggestion_agent.py
    ├── context_validator_agent.py
    ├── answer_validator_agent.py
    ├── answer_synthesizer_agent.py
    ├── query_analyzer_agent.py
    ├── query_rephrase_agent.py
    ├── context_analyst_agent.py
    ├── query_splitter_agent.py
    ├── introspector_agent.py
    └── retriever_agent.py
└── tools/                      # Utility tools
    ├── loader.py
    ├── embedder.py
    ├── chunker.py
    ├── retriever.py
    ├── new_llamaparse.py
    ├── doclayout_yolo_wrapper.py
    ├── scraper.py
    ├── introspector.py
    └── acronyms.py
```

### Configuration Files
```
├── .env                        # Environment variables (create this)
├── config.py                   # Configuration settings (create this)
└── static/                     # Static files (if any)
```

## API Endpoints Documentation

### Authentication Endpoints
- `POST /register` - User registration
- `POST /login` - User login
- `GET /users` - List users (admin)
- `DELETE /users/<user_id>` - Delete user (admin)

### Chat Endpoints
- `POST /chat/stream` - Streaming chat response
- `POST /chat` - Regular chat response
- `POST /create-chat` - Create new chat
- `GET /chat/history` - Get chat history

### Suggestion Endpoints
- `POST /suggestions/follow-up` - Follow-up questions
- `POST /suggestions/new-chat` - New chat suggestions
- `POST /suggestions/topic` - Topic-based suggestions
- `POST /suggestions/clarifying` - Clarifying questions

### Image Analysis Endpoints
- `POST /image-analysis` - Analyze image
- `POST /analyze-image` - Alternative image analysis
- `GET /image-analysis/info` - Get analysis info
- `GET /image-analysis/history` - Get analysis history
- `GET /image-analysis/<analysis_id>` - Get specific analysis
- `DELETE /image-analysis/<analysis_id>` - Delete analysis

### File Management
- `POST /preview-excel` - Preview Excel files
- `POST /batch-process` - Batch process files
- `GET /download/processed` - Download processed files
- `GET /pdf/<filename>` - Serve PDF files

### Admin Endpoints
- `POST /admin/ingest` - Admin document ingestion

## Environment Variables Required

Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
QDRANT_HOST=your_qdrant_host
QDRANT_PORT=your_qdrant_port
FLASK_SECRET_KEY=your_flask_secret
```

## Setup Instructions

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables in `.env` file

3. Start the backend server:
   ```bash
   python backend/rag_backend.py
   ```

## CORS Configuration

The backend is configured to accept requests from any origin. For production, update the CORS settings in `rag_backend.py`:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'https://yourdomain.com'])
``` 