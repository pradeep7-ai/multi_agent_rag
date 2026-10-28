import React, { useRef, useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Image, Settings, Info } from 'lucide-react';

interface AnalysisInfo {
  qwen_available: boolean;
  advanced_encoder_available: boolean;
  openai_available: boolean;
  models: {
    qwen: { name: string; available: boolean; description: string; source: string };
    openai: { name: string; available: boolean; description: string; source: string };
  };
  encoders: {
    base64: { name: string; available: boolean; description: string };
    advanced_encoder: { name: string; available: boolean; description: string };
  };
}

const ImageUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, analyzeImage, uploadedImage, analyzingImage } = useChat();
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useQwen, setUseQwen] = useState(true);
  const [encodingType, setEncodingType] = useState<'base64' | 'enhanced_base64' | 'feature_extraction' | 'hybrid'>('base64');
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfo | null>(null);

  // Fetch analysis capabilities on component mount
  useEffect(() => {
    const fetchAnalysisInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/image-analysis/info', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const info = await response.json();
          setAnalysisInfo(info);
          // Set default values based on availability
          setUseQwen(info.qwen_available);
          setEncodingType(info.advanced_encoder_available ? 'enhanced_base64' : 'base64');
        }
      } catch (error) {
        console.error('Failed to fetch analysis info:', error);
      }
    };

    fetchAnalysisInfo();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        uploadImage(file);
      } else {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = () => {
    if (uploadedImage) {
      analyzeImage(uploadedImage, prompt.trim() || undefined, {
        useQwen,
        encodingType,
      });
      setPrompt(''); // Clear prompt after analysis
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors duration-200"
          title="Upload image for analysis"
        >
          <Image size={20} />
        </button>
        
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors duration-200"
          title="Advanced settings"
        >
          <Settings size={16} />
        </button>
      </div>
      
      {uploadedImage && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {uploadedImage.name}
              </span>
            </div>
            
            <input
              type="text"
              placeholder="Optional: Add a specific question or prompt for analysis..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
            
            {showAdvanced && analysisInfo && (
              <div className="space-y-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Info size={12} />
                  <span>Advanced Settings</span>
                </div>
                
                {/* Model Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Analysis Model:
                  </label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="model"
                        checked={useQwen}
                        onChange={() => setUseQwen(true)}
                        disabled={!analysisInfo.qwen_available}
                        className="text-blue-600"
                      />
                      <span className={!analysisInfo.qwen_available ? 'text-gray-400' : ''}>
                        Qwen2-VL-7B-Instruct {!analysisInfo.qwen_available && '(Not Available)'}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="model"
                        checked={!useQwen}
                        onChange={() => setUseQwen(false)}
                        className="text-blue-600"
                      />
                      <span>GPT-4o (OpenAI)</span>
                    </label>
                  </div>
                </div>
                
                {/* Encoding Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Image Encoding:
                  </label>
                  <select
                    value={encodingType}
                    onChange={(e) => setEncodingType(e.target.value as any)}
                    className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1"
                  >
                    <option value="base64">Base64 (Standard)</option>
                    {analysisInfo.advanced_encoder_available && (
                      <option value="enhanced_base64">Enhanced Base64</option>
                    )}
                    {analysisInfo.advanced_encoder_available && (
                      <option value="feature_extraction">Feature Extraction</option>
                    )}
                    {analysisInfo.advanced_encoder_available && (
                      <option value="hybrid">Hybrid (Advanced + Base64)</option>
                    )}
                  </select>
                </div>
              </div>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={analyzingImage}
              className="w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzingImage ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 