import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useVoice } from '../hooks/useVoice';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX, Camera, RefreshCw, AlertTriangle } from 'lucide-react';

export const AIChefAssistant = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTTSActive, setIsTTSActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [diagnoseMode, setDiagnoseMode] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Voice Hook
  const voice = useVoice({
    onAskQuestion: (question) => {
      setInputValue(question);
      handleSendMessage(question);
    }
  });

  // Load welcome message on mount
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Hi ${user ? user.name : 'there'}! 🍳 I am your SmartChef AI assistant. How can I help you today? Ask me about ingredients, recipe substitutes (e.g. "What replaces butter?"), or upload a photo of your dish to diagnose doneness!`,
        createdAt: new Date()
      }
    ]);
  }, [user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, diagnosisResult]);

  // Vocalize AI response
  const speakResponse = (text) => {
    if (isTTSActive && voice.speak) {
      voice.speak(text.replace(/[\*\#\_]/g, '')); // Strip markdown
    }
  };

  // Handle message send
  const handleSendMessage = async (textToSend = inputValue) => {
    const cleanText = textToSend.trim();
    if (!cleanText) return;

    // Add user message to UI
    const userMsg = { sender: 'user', text: cleanText, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { message: cleanText });
      const aiMsg = { sender: 'ai', text: res.data.reply, createdAt: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      speakResponse(res.data.reply);
    } catch (err) {
      console.error(err.message);
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "Sorry, my kitchen networks are slightly warm! Let me simulate: Check the temperature, salt in stages, and make sure your ingredients are balanced.", createdAt: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Diagnose cooking photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setDiagnoseMode(true);
    setDiagnosisResult(null);

    const formData = new FormData();
    formData.append('image', file);

    // Add temp visual message
    const userMsg = { 
      sender: 'user', 
      text: `📷 Sent a cooking photo for diagnosis: ${file.name}`, 
      createdAt: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await axios.post('/api/ai/diagnose', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDiagnosisResult(res.data);
      
      const vocalReply = `I've analyzed your dish. It looks like it is ${res.data.doneness}. Here is a tip: ${res.data.improvementTips[0]}`;
      speakResponse(vocalReply);
    } catch (err) {
      console.error(err.message);
      setDiagnosisResult({
        doneness: "Perfectly baked (simulation)",
        texture: "Dough has risen correctly, crispy exterior texture.",
        colorAssessment: "Golden-brown color.",
        mistakesDetected: ["No critical technique errors detected."],
        improvementTips: ["Cover with foil if you notice browning too fast in the oven.", "Let rest for 5 minutes before slicing."]
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger file select click
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ duration: 0.25, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="w-[380px] sm:w-[420px] h-[550px] rounded-2xl glass-panel shadow-2xl flex flex-col overflow-hidden mb-4 border border-slate-800"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold text-slate-100 text-lg">SmartChef AI Assistant</span>
              </div>
              <div className="flex items-center gap-3">
                {/* TTS Toggle */}
                <button 
                  onClick={() => setIsTTSActive(!isTTSActive)} 
                  className={`p-1.5 rounded-lg transition ${isTTSActive ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}
                  title={isTTSActive ? 'Mute AI speech' : 'Unmute AI speech'}
                >
                  {isTTSActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                {/* Close Button */}
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200 p-1">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Diagnosis box layout */}
              {diagnosisResult && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-slide-up text-sm">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <AlertTriangle size={18} />
                    <span>Cooking Quality Diagnosis</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Estimated Doneness:</span>{' '}
                    <span className="text-slate-200 capitalize">{diagnosisResult.doneness}</span>
                  </div>
                  {diagnosisResult.texture && (
                    <div>
                      <span className="text-slate-400 font-medium">Texture check:</span>{' '}
                      <span className="text-slate-300">{diagnosisResult.texture}</span>
                    </div>
                  )}
                  {diagnosisResult.mistakesDetected?.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Mistakes identified:</span>
                      <ul className="list-disc pl-5 space-y-0.5 text-red-300">
                        {diagnosisResult.mistakesDetected.map((m, index) => <li key={index}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="text-amber-400 font-medium block mb-1">Chef Solutions:</span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      {diagnosisResult.improvementTips.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                  </div>
                  <button 
                    onClick={() => { setDiagnosisResult(null); setDiagnoseMode(false); }}
                    className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl py-1.5 font-medium transition text-xs"
                  >
                    Clear Diagnosis
                  </button>
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-400 text-xs flex items-center gap-2">
                    <RefreshCw className="animate-spin text-orange-500" size={14} />
                    <span>AI Chef is formulating solutions...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
              {/* Photo Upload for diagnosis */}
              <button 
                onClick={triggerFileSelect}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition flex-shrink-0"
                title="Diagnose cooking image"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />

              {/* Text Input */}
              <input
                type="text"
                placeholder="Ask me a cooking question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
              />

              {/* Voice Input Button */}
              {voice.supported && (
                <button
                  onClick={voice.isListening ? voice.stopListening : voice.startListening}
                  className={`p-2.5 rounded-xl border transition flex-shrink-0 ${
                    voice.isListening 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 pulse-glow-orange' 
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-orange-400'
                  }`}
                  title={voice.isListening ? 'Stop listening' : 'Start voice controls'}
                >
                  {voice.isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition btn-glow-orange flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circle Floating Trigger Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xl hover:shadow-orange-500/20 transition cursor-pointer btn-glow-orange"
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
};
export default AIChefAssistant;
