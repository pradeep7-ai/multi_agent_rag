# Admin Document Ingestion Feature

## Overview
This feature allows administrators to upload and ingest documents directly through the web interface into the vector database. The ingestion process preserves existing data and only adds new documents.

## Features

### 🔐 Admin-Only Access
- Only users with admin privileges can access the ingestion interface
- Secure authentication required for all ingestion operations

### 📁 Multi-Format Support
Supported file formats:
- **PDF** - Documents and manuals
- **DOCX** - Word documents
- **XLSX/XLS** - Excel spreadsheets
- **CSV** - Comma-separated values
- **JSON** - Structured data files
- **MD** - Markdown files
- **Images** - PNG, JPG, JPEG, BMP, TIFF

### 🎯 User-Friendly Interface
- **Drag & Drop** - Simply drag files into the upload area
- **File Selection** - Click to browse and select files
- **Progress Tracking** - Real-time progress for each file
- **Status Indicators** - Visual feedback for upload status
- **File Management** - Remove individual files or clear all

### 🔄 Non-Destructive Ingestion
- **Preserves Existing Data** - Previous documents remain in the database
- **Additive Process** - New documents are added without deletion
- **Chunking** - Documents are automatically chunked for optimal retrieval
- **Metadata Preservation** - File information and processing details are stored

## How to Use

### 1. Access the Interface
1. Log in as an administrator
2. Open the sidebar
3. Click on the "Admin" section
4. Find the "Document Ingestion" section

### 2. Upload Documents
1. **Drag & Drop**: Drag files directly into the upload area
2. **File Selection**: Click "Select Files" to browse and choose files
3. **Multiple Files**: Select multiple files at once

### 3. Monitor Progress
- Each file shows its processing status
- Overall progress bar indicates completion percentage
- Success/error messages for each file

### 4. Start Ingestion
- Click "Start Ingestion" to begin processing
- Files are processed sequentially
- Progress is shown in real-time

## Technical Details

### Backend API
- **Endpoint**: `POST /admin/ingest`
- **Authentication**: Bearer token required
- **Admin Check**: Only admin users can access
- **File Processing**: Uses existing ingestion pipeline

### File Processing Pipeline
1. **Validation** - File type and format validation
2. **Loading** - Document content extraction
3. **Chunking** - Text segmentation for optimal retrieval
4. **Embedding** - Vector generation using OpenAI embeddings
5. **Storage** - Upload to Qdrant vector database

### Security Features
- **Admin-only access** - Role-based permissions
- **File validation** - Type and format checking
- **Temporary processing** - Files processed in secure temp directories
- **Error handling** - Graceful failure handling

## Error Handling

### Common Issues
- **Unsupported file type** - Files with unsupported extensions are skipped
- **Upload failures** - Network or server errors are displayed
- **Processing errors** - Individual file processing failures are shown
- **Authentication errors** - Invalid or expired tokens

### Troubleshooting
1. **Check file format** - Ensure files are in supported formats
2. **Verify admin status** - Confirm user has admin privileges
3. **Check network** - Ensure stable internet connection
4. **Review logs** - Check backend logs for detailed error information

## Configuration

### Supported File Types
The system supports the following file extensions:
```
.pdf, .docx, .xlsx, .xls, .csv, .json, .md, .png, .jpg, .jpeg, .bmp, .tiff
```

### Vector Database
- **Collection**: `Agentic_RAGv2`
- **Embedding Model**: OpenAI text-embedding-ada-002
- **Vector Dimension**: 1536
- **Distance Metric**: Cosine similarity

## Best Practices

### File Preparation
- **Clean files** - Remove unnecessary formatting
- **Reasonable size** - Large files may take longer to process
- **Quality content** - Ensure documents contain relevant information

### Upload Process
- **Batch uploads** - Upload related documents together
- **Monitor progress** - Watch for any processing errors
- **Verify completion** - Check that all files processed successfully

### Maintenance
- **Regular backups** - Backup vector database regularly
- **Monitor storage** - Check database size and performance
- **Update documents** - Re-upload updated versions as needed

## Future Enhancements

### Planned Features
- **Bulk operations** - Process entire folders
- **Scheduling** - Automated ingestion at specific times
- **Version control** - Track document versions
- **Advanced metadata** - Custom metadata fields
- **Processing options** - Configurable chunking parameters

### Integration Possibilities
- **API endpoints** - Programmatic access
- **Webhook support** - Notifications on completion
- **External storage** - Cloud storage integration
- **OCR enhancement** - Better image text extraction 