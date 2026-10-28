import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat, Source } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  currentChat: Chat | null;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  id: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  createNewChat: () => void;
  switchChat: (chatId: string) => void;
  sendMessage: (content: string) => void;
  uploadFile: (file: File) => void;
  processFile: () => void;
  uploadedFile: File | null;
  filePreviewData: any[] | null;
  downloadLink: string | null;
  processingFile: boolean;
  transcriptionText: string;
  setTranscriptionText: (text: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  chatId: string;
  setChatId: (id: string) => void;
  scrollTrigger: number;
  uploadImage: (file: File) => void;
  analyzeImage: (imageFile: File, prompt?: string, options?: { useQwen?: boolean; encodingType?: string }) => void;
  uploadedImage: File | null;
  analyzingImage: boolean;
}

const API_BASE_URL = 'http://localhost:5000';
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [chatId, setChatId] = useState<string>(() => {
    const stored = localStorage.getItem('chatId');
    return stored ?? uuidv4();
  });

  const messages = currentChat ? chatMessages[currentChat.id] || [] : [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewData, setFilePreviewData] = useState<any[] | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [processingFile, setProcessingFile] = useState<boolean>(false);

  const [transcriptionText, setTranscriptionText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [scrollTrigger, setScrollTrigger] = useState(0);

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState<boolean>(false);

  const createNewChat = async (): Promise<Chat> => {
    const res = await fetch("http://localhost:5000/create-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text(); // help with debugging
      throw new Error(`Failed to create chat: ${res.status} ${text}`);
    }

    const chat: Chat = await res.json(); // 👈 correctly typed return value
    setChats((prev) => [chat, ...prev]);
    setCurrentChat(chat); // ✅ Correct assignment
    setChatId(chat.id);   // ✅ Persist chatId
    setScrollTrigger(Date.now()); // Trigger auto-scroll for new chat
    return chat;
  };

  const switchChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      setChatId(chatId);
      setError(null);
      setScrollTrigger(Date.now());
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !token || !currentChat) return;

    const chatId = currentChat.id;
    const isFirstMessage = (chatMessages[chatId] || []).length === 0;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
      ...(uploadedImage && {
        image: {
          url: URL.createObjectURL(uploadedImage),
          filename: uploadedImage.name,
          type: uploadedImage.type,
        },
      }),
    };

    setChatMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMessage],
    }));

    if (isFirstMessage) {
      const updatedChat: Chat = {
        ...currentChat,
        title: content.slice(0, 20) + (content.length > 20 ? '...' : ''),
      };
      setChats(prev => prev.map(c => (c.id === chatId ? updatedChat : c)));
      setCurrentChat(updatedChat);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          query: content,
          context: '',
          chat_id: chatId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.answer,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        sources: (() => {
          const docSources = (
            response.data.sources?.map((source: any, index: number) => {
              // If it's an image source
              if (source.type === 'image' || source.imageUrl || (source.url && source.url.match(/\.(png|jpg|jpeg|bmp|tiff)$/i))) {
                return {
                  id: source.id || `source_image_${index}`,
                  title: source.title || source.fileName || 'Image',
                  url: source.url || source.imageUrl,
                  imageUrl: source.imageUrl || source.url,
                  group: source.group || 'Images',
                  type: 'image',
                  fileName: source.fileName,
                  pageNumber: source.pageNumber,
                  snippet: source.snippet,
                };
              }

              if (source && typeof source === 'object' && source.id) {
                return {
                  id: source.id,
                  title: source.title,
                  snippet: source.snippet,
                  url: source.url,
                  group: source.group || 'Documents',
                };
              }

              if (Array.isArray(source) && source.length === 2) {
                const [snippet, title] = source;
                const match = title.match(/^(.+\.pdf) - Page (\d+)$/);
                const file = match ? match[1] : title;
                const page = match ? match[2] : null;
                const url = `http://localhost:5000/pdf/${encodeURIComponent(file)}#page=${page}`;
                return {
                  id: `source_${index}_${title}`,
                  title,
                  snippet,
                  url,
                  group: 'Documents',
                };  
              }
            }) || []
          );
        })(),
      };

      setChatMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), botMessage],
      }));

      if (uploadedImage) {
        setUploadedImage(null);
      }

      // After updating chatMessages with the new bot message, re-fetch chat history
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawHistory: Record<string, any[]> = res.data;
        const transformed: Record<string, Message[]> = {};

        Object.entries(rawHistory).forEach(([chatId, items]) => {
          const messages: Message[] = [];

          items.forEach(item => {
            messages.push({
              id: `${item._id}_user`,
              content: item.question || '[No question]',
              role: 'user',
              timestamp: item.timestamp,
            });
            messages.push({
              id: `${item._id}_assistant`,
              content: item.answer || '[No answer]',
              role: 'assistant',
              timestamp: item.timestamp,
              sources: (item.sources || []).map((source: any, index: number) => {
                if (source && typeof source === 'object' && source.id) {
                  return {
                    id: source.id,
                    title: source.title,
                    snippet: source.snippet,
                    url: source.url,
                    group: source.group || 'Documents',
                  };
                }
                if (Array.isArray(source) && source.length === 2) {
                  const [snippet, title] = source;
                  const match = title.match(/^(.+\.pdf) - Page (\d+)$/);
                  const file = match ? match[1] : title;
                  const page = match ? match[2] : null;
                  const url = `http://localhost:5000/pdf/${encodeURIComponent(file)}#page=${page}`;
                  return {
                    id: `source_${index}_${title}`,
                    title,
                    snippet,
                    url,
                    group: 'Documents',
                  };
                }
                return {
                  id: `source_${index}_unknown`,
                  title: 'Unknown Source',
                  snippet: '',
                  url: '',
                  group: 'Documents',
                };
              }),
            });
          });

          // Sort messages by timestamp (oldest first)
          messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          transformed[chatId] = messages;
        });

        setChatMessages(transformed);
      } catch (err) {
        console.error('Failed to re-fetch chat history after sending message:', err);
      }

    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('SendMessage error:', err);
    } finally {
      setIsLoading(false);
      setScrollTrigger(Date.now());
    }
  };

  const uploadFile = async (file: File) => {
    setUploadedFile(file);
    setDownloadLink(null);
    setFilePreviewData(null);
    setProcessingFile(false);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/preview-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFilePreviewData(response.data.preview);
    } catch (error) {
      setError('Error reading file preview');
      console.error('File Preview Error:', error);
    }
  };

  const processFile = async () => {
    if (!uploadedFile) return;

    setProcessingFile(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await axios.post(`${API_BASE_URL}/batch-process`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedFile(null);
      setFilePreviewData(null);
      setDownloadLink(`${API_BASE_URL}${response.data.download_url}`);

      const botMessage: Message = {
        id: Date.now().toString(),
        content: `I've processed your Excel file "${uploadedFile.name}". You can download the results using the link below.`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };

      if (currentChat) {
        setChatMessages(prev => ({
          ...prev,
          [currentChat.id]: [...(prev[currentChat.id] || []), botMessage],
        }));
      }
    } catch (err) {
      setError('Failed to process file. Please try again.');
      console.error('File Processing Error:', err);
    } finally {
      setProcessingFile(false);
    }
  };

  const uploadImage = (file: File) => {
    setUploadedImage(file);
    setAnalyzingImage(false);
  };

  const analyzeImage = async (imageFile: File, prompt?: string, options?: { useQwen?: boolean; encodingType?: string }) => {
    if (!imageFile || !token || !currentChat) return;

    const chatId = currentChat.id;

    // Create user message with image
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt || "Please analyze this image",
      role: 'user',
      timestamp: new Date().toISOString(),
      image: {
        url: URL.createObjectURL(imageFile),
        filename: imageFile.name,
        type: imageFile.type,
      },
    };

    setChatMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMessage],
    }));

    setAnalyzingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      if (prompt) {
        formData.append('prompt', prompt);
      }
      
      // Add new options
      if (options?.useQwen !== undefined) {
        formData.append('use_qwen', options.useQwen.toString());
      }
      if (options?.encodingType) {
        formData.append('encoding_type', options.encodingType);
      }

      const response = await axios.post(`${API_BASE_URL}/analyze-image`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.analysis,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        // Add model and encoding info to the message
        metadata: {
          model_used: response.data.model_used,
          device_used: response.data.device_used,
          encoding_info: response.data.encoding_info,
        },
      };

      setChatMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), botMessage],
      }));

      // Clear uploaded image after successful analysis
      setUploadedImage(null);

    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Image Analysis Error:', err);
    } finally {
      setAnalyzingImage(false);
    }
  };

  useEffect(() => {
    if (!token) {
      // Clear chat data when token is removed (logout)
      setChats([]);
      setCurrentChat(null);
      setChatMessages({});
      setChatId(uuidv4());
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const rawHistory: Record<string, any[]> = res.data;
        const transformed: Record<string, Message[]> = {};

        Object.entries(rawHistory).forEach(([chatId, items]) => {
          const messages: Message[] = [];

          items.forEach(item => {
            messages.push({
              id: `${item._id}_user`,
              content: item.question || '[No question]',
              role: 'user',
              timestamp: item.timestamp,
            });
            messages.push({
              id: `${item._id}_assistant`,
              content: item.answer || '[No answer]',
              role: 'assistant',
              timestamp: item.timestamp,
              sources: (item.sources || []).map((source: any, index: number) => {
                // Handle new source format (objects with id, title, url, etc.)
                if (source && typeof source === 'object' && source.id) {
                  return {
                    id: source.id,
                    title: source.title,
                    snippet: source.snippet,
                    url: source.url,
                    group: source.group || 'Documents',
                  };
                }
                
                // Handle old source format (arrays)
                if (Array.isArray(source) && source.length === 2) {
                  const [snippet, title] = source;
                  const match = title.match(/^(.+\.pdf) - Page (\d+)$/);
                  const file = match ? match[1] : title;
                  const page = match ? match[2] : null;
                  const url = `http://localhost:5000/pdf/${encodeURIComponent(file)}#page=${page}`;

                  return {
                    id: `source_${index}_${title}`,
                    title,
                    snippet,
                    url,
                    group: 'Documents',
                  };
                }
                
                // Fallback
                return {
                  id: `source_${index}_unknown`,
                  title: 'Unknown Source',
                  snippet: '',
                  url: '',
                  group: 'Documents',
                };
              }),
            });
          });

          // Sort messages by timestamp (oldest first) since backend returns newest first
          messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          transformed[chatId] = messages;
        });

        setChatMessages(transformed);

        const loadedChats: Chat[] = Object.keys(transformed).map(chatId => {
          const firstMessage = transformed[chatId]?.[0];
          return {
            id: chatId,
            title: firstMessage?.content?.slice(0, 20) || 'New Chat',
            createdAt: firstMessage?.timestamp || new Date().toISOString(),
          };
        });
        loadedChats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setChats(prevChats => {
          const chatIds = new Set(prevChats.map(c => c.id));
          const merged = [...prevChats];
          for (const chat of loadedChats) {
            if (!chatIds.has(chat.id)) {
              merged.push(chat);
            }
          }
          return merged;
        });

        // Always create a new chat and set it as current after login
        const newChat = await createNewChat();
        setCurrentChat(newChat);
        setChatId(newChat.id);
        setScrollTrigger(Date.now()); // Trigger auto-scroll after loading history
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };

    fetchHistory();
  }, [token]);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        chats,
        setChats,
        id: chatId,
        messages,
        isLoading,
        error,
        createNewChat,
        switchChat,
        sendMessage,
        uploadFile,
        processFile,
        uploadedFile,
        filePreviewData,
        downloadLink,
        processingFile,
        transcriptionText,
        setTranscriptionText,
        searchTerm,
        setSearchTerm,
        chatId,
        setChatId,
        scrollTrigger,
        uploadImage,
        analyzeImage,
        uploadedImage,
        analyzingImage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

// Utility to extract image placeholders from text
function extractImagePlaceholders(text: string, fileName: string, pageNumber: number | undefined) {
  const regex = /\{Image_(\d+) ([^\s]+) description: ([^}]+)\}/g;
  const images = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const imgIdx = match[1];
    const imgPath = match[2].replace(/\\/g, '/'); // Normalize path
    const description = match[3];
    if (!imgPath || imgPath === '/') {
      console.warn('Skipping image source with empty or invalid path:', match);
      continue;
    }
    images.push({
      id: `image_${fileName}_${pageNumber}_${imgIdx}`,
      title: `Image ${imgIdx}`,
      snippet: description,
      url: `/pdf/${imgPath}`,
      group: 'Images',
      type: 'image',
      fileName: imgPath.split('/').pop() || imgPath,
      imageUrl: `/pdf/${imgPath}`,
      pageNumber,
    });
  }
  if (images.length === 0) {
    console.log('No image placeholders found in text:', text);
  }
  return images;
}
