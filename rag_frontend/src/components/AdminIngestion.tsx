import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000';

interface FileStatus {
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
}

const AdminIngestion: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (selectedFiles: File[]) => {
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.xls', '.csv', '.json', '.md', '.png', '.jpg', '.jpeg', '.bmp', '.tiff'];
    
    const validFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedExtensions.includes(extension);
    });

    const invalidFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      alert(`The following files have unsupported formats and will be skipped:\n${invalidFiles.map(f => f.name).join('\n')}`);
    }

    const newFiles: FileStatus[] = validFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async () => {
    if (!token || files.length === 0) return;

    setIsUploading(true);
    setOverallProgress(0);

    for (let i = 0; i < files.length; i++) {
      const fileStatus = files[i];
      
      // Update file status to uploading
      setFiles(prev => prev.map((f, index) => 
        index === i ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      const formData = new FormData();
      formData.append('file', fileStatus.file);

      try {
        const response = await fetch(`${API_BASE_URL}/admin/ingest`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        
        // Update file status to completed
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            status: 'completed', 
            progress: 100,
            message: `Successfully ingested: ${result.chunks_processed} chunks processed`
          } : f
        ));

      } catch (error: any) {
        // Update file status to error
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            status: 'error', 
            progress: 0,
            message: error.message || 'Upload failed'
          } : f
        ));
      }

      // Update overall progress
      setOverallProgress(((i + 1) / files.length) * 100);
    }

    setIsUploading(false);
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'pending':
        return <File size={16} className="text-gray-400" />;
      case 'uploading':
      case 'processing':
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <File size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: FileStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'uploading':
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Document Ingestion</h3>
      
      {/* File Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 mb-4 transition-colors duration-200 ${
          isDragOver 
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload size={48} className={`mx-auto mb-4 transition-colors duration-200 ${
            isDragOver ? 'text-indigo-500' : 'text-gray-400'
          }`} />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {isDragOver ? 'Drop files here' : 'Drop files here or click to select'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Supported formats: PDF, DOCX, XLSX, CSV, JSON, MD, Images (PNG, JPG, etc.)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.xls,.csv,.json,.md,.png,.jpg,.jpeg,.bmp,.tiff"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <button
              onClick={clearAllFiles}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((fileStatus, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(fileStatus.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {fileStatus.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileStatus.file.size)}
                    </p>
                    {fileStatus.message && (
                      <p className={`text-xs ${getStatusColor(fileStatus.status)}`}>
                        {fileStatus.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileStatus.status === 'uploading' && (
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileStatus.progress}%` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    disabled={fileStatus.status === 'uploading' || fileStatus.status === 'processing'}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={uploadFiles}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>Start Ingestion</span>
            </>
          )}
        </button>
      )}

      {/* Info Text */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> New documents will be added to the existing knowledge base. 
          Previous data will not be deleted. Each file will be processed and chunked for optimal retrieval.
        </p>
      </div>
    </div>
  );
};

export default AdminIngestion; 