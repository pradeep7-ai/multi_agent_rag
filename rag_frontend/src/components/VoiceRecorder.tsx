import React, { useEffect, useRef, useState } from 'react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false); // Sync version of isListening
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
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
      stopListening(); // Gracefully stop
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        recognition.start(); // Restart only if user didn't click stop
      }
    };

    recognitionRef.current = recognition;
  }, [onTranscription]);

  const startListening = () => {
    if (recognitionRef.current && !isListeningRef.current) {
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

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`px-4 py-2 rounded-md ${
          isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isListening ? 'Stop Listening' : 'Start Voice Input'}
      </button>
      {finalTranscript && (
        <span className="text-sm text-gray-700 dark:text-gray-300 italic">
          {finalTranscript}
        </span>
      )}
    </div>
  );
};

export default VoiceRecorder;
