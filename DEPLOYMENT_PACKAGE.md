# RAG System - Deployment Package

This package contains a complete, deployable RAG (Retrieval-Augmented Generation) system that can be run on any system with Python and Node.js.

## 📦 Package Contents

### Core Application Files
- `rag_backend.py` - Main Flask backend API
- `requirements.txt` - Python dependencies
- `create_test_user.py` - Admin user creation script

### Frontend Application
- `rag_frontend/` - Complete React frontend
  - `package.json` - Node.js dependencies
  - `src/` - React source code

### AI Agents
- `agents/` - Specialized AI agents for query processing
- `tools/` - Utility scripts and tools

### Documentation
- `README.md` - Complete system documentation
- `LINUX_SETUP.md` - Linux-specific setup instructions

### Deployment Scripts
- `deploy_linux.sh` - Linux system deployment script

## 🚀 Quick Deployment

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB
- 8GB+ RAM (16GB recommended)
- 20GB+ free disk space

### Standard Deployment
```bash
# Extract the package
unzip rag-system.zip
cd ui_and_backend

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd rag_frontend
npm install
cd ..

# Set environment variables
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Add your documents
mkdir -p rag_frontend/pdf
cp /path/to/your/documents/*.pdf rag_frontend/pdf/

# Start backend
python rag_backend.py

# In another terminal, start frontend
cd rag_frontend
npm run dev
```

### Create Admin User
```bash
# Create admin user (if needed)
python create_test_user.py
```

### Ingest Documents
```bash
# Ingest documents
python tools/ingest_v2.py
```

## 🌐 Access Information

After deployment, access the system at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Login**: admin / admin123

## 🔧 Management Commands

```bash
# Start backend
python rag_backend.py

# Start frontend
cd rag_frontend
npm run dev

# Stop services
# Use Ctrl+C in respective terminals
```

## 📋 System Features

### Core RAG System
- Document ingestion (PDF, DOCX, Excel)
- Intelligent text chunking
- Vector similarity search
- AI-powered question answering
- Source attribution

### AI Agents
- Query suggestion agent
- Context validation agent
- Answer synthesis agent
- Query analysis agent
- And 7 more specialized agents

### User Management
- JWT authentication
- Role-based access control
- Chat history persistence
- Admin panel

### Web Scraping
- Automated website crawling
- Content extraction
- PDF generation

## 🔒 Security Notes

1. **Change default passwords** after first login
2. **Update API keys** in `.env` file
3. **Configure firewall** for production use
4. **Enable SSL/HTTPS** for production deployment

## 📞 Support

For deployment issues:
1. Check the troubleshooting section in `README.md`
2. Review application logs in console output
3. Verify Python and Node.js installation
4. Ensure sufficient system resources

## 🔄 Updates

To update the system:
```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt
cd rag_frontend && npm install && cd ..

# Restart services
# Stop current processes and restart
```

---

**Package Version**: 1.0  
**Last Updated**: $(date)  
**Compatibility**: Cross-platform (Python 3.9+, Node.js 16+) 