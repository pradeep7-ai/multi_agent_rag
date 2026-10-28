export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sources?: Source[];
  image?: {
    url: string;
    filename: string;
    type: string;
  };
  metadata?: {
    model_used?: string;
    device_used?: string;
    encoding_info?: {
      method: string;
      success: boolean;
      format?: string;
      size?: [number, number];
    };
  };
}

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  group?: string;
  type?: 'document' | 'image';
  fileName?: string;
  pageNumber?: number;
  imageUrl?: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
}