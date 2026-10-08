import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, Square } from 'lucide-react';

const SpeechToTextButton = ({ onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onTranscript?.(finalTranscript);
        setInterimText('');
      } else {
        setInterimText(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If still set to listening, restart unless explicitly stopped
      if (recognitionRef.current && recognitionRef.current.shouldKeepListening) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.shouldKeepListening = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.shouldKeepListening = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      setInterimText('');
    } else {
      recognitionRef.current.shouldKeepListening = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Could not start speech recognition:', e);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
          isListening
            ? 'bg-red-500 text-white ring-4 ring-red-400/20 animate-pulse'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 active:scale-95'
        } disabled:opacity-50`}
        title={isListening ? 'Click to stop voice dictation' : 'Click to dictate your answer using microphone'}
      >
        {isListening ? (
          <>
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Recording Voice... (Click to Stop)</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dictate with Microphone</span>
          </>
        )}
      </button>

      {isListening && interimText && (
        <span className="text-[11px] text-slate-500 italic truncate max-w-xs animate-in fade-in">
          "{interimText}"
        </span>
      )}
    </div>
  );
};

export default SpeechToTextButton;
