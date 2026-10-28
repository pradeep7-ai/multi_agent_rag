import React, { useState } from 'react';
import { Source } from '../types';
import { FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface SourceListProps {
  sources: Source[];
}

interface SourceGroupsType {
  [key: string]: Source[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [pdfData, setPdfData] = useState<Record<string, string>>({});

  const API_BASE_URL = 'http://localhost:5000';

  const getFullUrl = (url: string) => {
    // If URL already has http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, prepend the API base URL
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const getPdfUrlWithPage = (url: string) => {
    // Extract page number from URL if present
    const urlObj = new URL(getFullUrl(url), window.location.origin);
    const page = urlObj.searchParams.get('page');
    
    if (page) {
      // Remove page parameter from URL for PDF serving
      urlObj.searchParams.delete('page');
      const baseUrl = urlObj.toString();
      // Return URL with page fragment for PDF viewers that support it
      return `${baseUrl}#page=${page}`;
    }
    
    return getFullUrl(url);
  };

  const loadPdfData = async (sourceId: string, url: string) => {
    console.log(`🔍 Attempting to load PDF for sourceId: ${sourceId}`);
    const fullUrl = getFullUrl(url);
    console.log(`📄 Fetching from URL: ${fullUrl}`);

    try {
      const response = await axios.get(fullUrl, { responseType: 'arraybuffer' });
      const base64Data = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      setPdfData(prev => ({
        ...prev,
        [sourceId]: base64Data
      }));
      console.log(`✅ Loaded PDF successfully for ${sourceId}`);
    } catch (error) {
      console.error(`❌ Error loading PDF for ${sourceId} from ${fullUrl}:`, error);
    }
  };

  const handlePdfClick = (url: string) => {
    const pdfUrlWithPage = getPdfUrlWithPage(url);
    // Open PDF in new tab with page navigation
    window.open(pdfUrlWithPage, '_blank');
  };

  const sourceGroups: SourceGroupsType = sources.reduce((groups: SourceGroupsType, source) => {
    const group = source.group || 'Other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(source);
    return groups;
  }, {});

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const toggleSource = async (source: Source) => {
    if (!source?.id) {
      console.warn("🚨 Invalid source in toggleSource:", source);
      return;
    }

    console.log(`Toggling source with id: ${source.id}`);
    const newState = !expandedSources[source.id];
    setExpandedSources(prev => ({
      ...prev,
      [source.id]: newState
    }));

    // Only try to load PDF if URL exists
    if (newState && !pdfData[source.id] && source.url) {
      await loadPdfData(source.id, source.url);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Sources:</h3>
      <div className="space-y-3">
        {Object.entries(sourceGroups).map(([groupName, groupSources]) => (
          <div key={groupName} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
              onClick={() => toggleGroup(groupName)}
            >
              <span>{groupName} ({groupSources.length})</span>
              {expandedGroups[groupName] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandedGroups[groupName] && (
              <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {groupSources.map((source: any, index) => {
                  if (
                    typeof source !== 'object' ||
                    Array.isArray(source) ||
                    !source.id
                  ) {
                    console.warn("⚠️ Skipping invalid source:", source);
                    return null;
                  }

                  // Show image if type is image
                  if (source.type === 'image' && source.imageUrl) {
                    return (
                      <div key={source.id || `${source.title}-${source.url}-${index}`} className="p-3 flex flex-col items-start">
                        <img src={source.imageUrl} alt={source.fileName || 'Image source'} className="max-w-xs h-auto rounded border border-gray-200 dark:border-gray-600 mb-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{source.fileName}</span>
                      </div>
                    );
                  }

                  // Show document link with file name and page number
                  return (
                    <div key={source.id || `${source.title}-${source.url}-${index}`}> 
                      <div 
                        className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                        onClick={() => toggleSource(source)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <FileText size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium">
                              {source.title || source.fileName || 'Unknown Source'}
                              {source.pageNumber ? ` (Page ${source.pageNumber})` : ''}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {source.url && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePdfClick(source.url);
                                }}
                                className="mr-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150"
                              >
                                <ExternalLink size={14} className="text-indigo-600 dark:text-indigo-400" />
                              </button>
                            )}
                            {expandedSources[source.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                        {source.snippet && (
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {source.snippet}
                          </p>
                        )}
                      </div>
                      {expandedSources[source.id] && (
                        <div className="bg-gray-50 dark:bg-gray-750 p-3">
                          {source.url ? (
                            <object
                              data={getPdfUrlWithPage(source.url)}
                              type="application/pdf"
                              width="100%"
                              height="600px"
                            >
                              <p>
                                Your browser does not support embedded PDFs.{' '}
                                <button 
                                  onClick={() => handlePdfClick(source.url)}
                                  className="text-blue-500 underline"
                                >
                                  Open PDF in new tab
                                </button>
                              </p>
                            </object>
                          ) : (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p><strong>Source:</strong> {source.title || 'Unknown Source'}</p>
                              {source.snippet && (
                                <div className="mt-2">
                                  <p><strong>Content:</strong></p>
                                  <p className="whitespace-pre-wrap text-xs">{source.snippet}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourceList;
