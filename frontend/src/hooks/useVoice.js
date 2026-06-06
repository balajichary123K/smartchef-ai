import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoice = (callbacks = {}) => {
  const { onNextStep, onPrevStep, onRepeatStep, onSetTimer, onAskQuestion } = callbacks;
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (e) => console.error('Speech recognition error:', e.error);

      rec.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        console.log('🗣️ Heard voice command:', transcript);

        // Command parsing route engine
        if (transcript.includes('next step') || transcript.includes('go forward')) {
          if (onNextStep) {
            speak("Going to next step.");
            onNextStep();
          }
        } else if (transcript.includes('previous step') || transcript.includes('back step') || transcript.includes('go back')) {
          if (onPrevStep) {
            speak("Going back one step.");
            onPrevStep();
          }
        } else if (transcript.includes('repeat step') || transcript.includes('repeat') || transcript.includes('say again')) {
          if (onRepeatStep) {
            onRepeatStep();
          }
        } else if (transcript.includes('set timer') || transcript.includes('set a timer')) {
          // Parse minutes: e.g. "set timer for 10 minutes"
          const minutesMatch = transcript.match(/(\d+)\s*minute/);
          if (minutesMatch && onSetTimer) {
            const mins = parseInt(minutesMatch[1]);
            speak(`Setting timer for ${mins} minutes.`);
            onSetTimer(mins);
          } else {
            speak("How many minutes would you like to set the timer for?");
          }
        } else {
          // Send general question to chatbot
          if (onAskQuestion) {
            onAskQuestion(transcript);
          }
        }
      };

      recognitionRef.current = rec;
    } else {
      console.warn('Speech Recognition API is not supported in this browser.');
    }
  }, [onNextStep, onPrevStep, onRepeatStep, onSetTimer, onAskQuestion]);

  // Start Voice Listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }, [isListening]);

  // Stop Voice Listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Text to Speech Vocalizer
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      // Cancel active voice playbacks first
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Select a friendly female or default voice if available
      const voices = window.speechSynthesis.getVoices();
      const chefVoice = voices.find(v => v.name.includes('Google US English') || v.lang === 'en-US');
      if (chefVoice) utterance.voice = chefVoice;

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    supported,
    isListening,
    startListening,
    stopListening,
    speak
  };
};
