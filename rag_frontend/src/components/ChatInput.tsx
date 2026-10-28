import React, { useEffect, useRef, useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  isLoading: boolean;
  onTranscription?: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  isLoading, 
  onTranscription 
}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');

  // Determine if we should show voice button or send button
  const hasText = value.trim().length > 0;
  const showVoiceButton = !hasText && onTranscription;

  useEffect(() => {
    if (!onTranscription) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let fullTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      const combined = fullTranscript + interim;
      setFinalTranscript(combined);
      onTranscription(combined);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
      stopListening();
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, [onTranscription]);

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current && onTranscription) {
      setFinalTranscript('');
      isListeningRef.current = true;
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCombinedButtonClick = () => {
    if (showVoiceButton) {
      // Voice button functionality
      handleVoiceClick();
    } else {
      // Send button functionality
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          disabled={isLoading}
          className="w-full px-4 py-3 pr-16 text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none transition-all duration-200"
          rows={1}
          style={{ minHeight: '56px', maxHeight: '150px' }}
        />
        
        {/* Combined Voice/Send Button */}
        <button
          type={showVoiceButton ? "button" : "submit"}
          onClick={showVoiceButton ? handleCombinedButtonClick : undefined}
          disabled={isLoading || (!showVoiceButton && !value.trim())}
          className={`absolute right-3 bottom-3 p-2 rounded-full transition-all duration-200 ${
            showVoiceButton
              ? isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white listening' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed'
          }`}
          style={{width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
          title={showVoiceButton 
            ? (isListening ? 'Stop voice input' : 'Start voice input')
            : 'Send message'
          }
        >
          {showVoiceButton 
            ? (isListening ? <MicOff size={18} /> : <Mic size={18} />)
            : <Send size={18} />
          }
        </button>
      </div>
      
      {/* Voice Transcript Display */}
      {finalTranscript && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 voice-transcript">
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Voice Input:</span>
          <span className="text-sm text-blue-700 dark:text-blue-300 ml-2 italic">
            {finalTranscript}
          </span>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
