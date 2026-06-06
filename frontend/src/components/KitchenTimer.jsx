import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, BellRing, Plus, Clock } from 'lucide-react';

export const KitchenTimer = ({ timerRequest, onClearRequest }) => {
  const [timers, setTimers] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newMinutes, setNewMinutes] = useState('5');
  const alertAudioRef = useRef(null);

  // Sync with parent voice commands request
  useEffect(() => {
    if (timerRequest && timerRequest.minutes) {
      addTimer(`${timerRequest.label || 'Voice Timer'}`, timerRequest.minutes);
      if (onClearRequest) onClearRequest();
    }
  }, [timerRequest]);

  // Timer tick clock interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(t => {
          if (!t.isRunning || t.secondsLeft <= 0) return t;
          
          const nextSeconds = t.secondsLeft - 1;
          const isDoneNow = nextSeconds === 0;
          
          if (isDoneNow) {
            // Play a beep/alarm sound using Browser Audio API synthesizers
            playAlarmBeep();
          }

          return {
            ...t,
            secondsLeft: nextSeconds,
            isFinished: isDoneNow ? true : t.isFinished
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Generate alarm using Web Audio API to prevent needing external file loaders
  const playAlarmBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      // Stop oscillator after 1.5 seconds
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.warn('Web Audio Context play error:', e.message);
    }
  };

  const addTimer = (label, minutes) => {
    const minsVal = parseInt(minutes) || 5;
    const totalSeconds = minsVal * 60;
    
    const newTimer = {
      id: `timer_${Date.now()}_${Math.random()}`,
      label: label.trim() || `Cooking Step Timer`,
      totalSeconds,
      secondsLeft: totalSeconds,
      isRunning: true,
      isFinished: false
    };

    setTimers(prev => [newTimer, ...prev]);
    setNewLabel('');
  };

  const toggleTimer = (id) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, isRunning: !t.isRunning } : t
    ));
  };

  const deleteTimer = (id) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl glass-panel p-5 space-y-4 border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock size={20} className="text-orange-500" />
          <span className="font-semibold text-sm">Active Cooking Timers</span>
        </div>
      </div>

      {/* Add Timer Form */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Timer name (e.g. Boil Rice)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
        />
        <input
          type="number"
          placeholder="Mins"
          value={newMinutes}
          onChange={(e) => setNewMinutes(e.target.value)}
          className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-300 text-center focus:outline-none focus:border-orange-500/50"
          min="1"
        />
        <button
          onClick={() => addTimer(newLabel, newMinutes)}
          className="px-3 py-1.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition flex items-center justify-center cursor-pointer btn-glow-orange"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Timers List countdown */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        <AnimatePresence>
          {timers.length === 0 ? (
            <div className="text-center text-slate-500 py-6 text-xs">
              No active timers. Set one above or say "Set timer for 10 minutes"!
            </div>
          ) : (
            timers.map(timer => {
              const progressPercentage = (timer.secondsLeft / timer.totalSeconds) * 100;
              
              return (
                <motion.div
                  key={timer.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`p-3 rounded-xl border flex flex-col gap-2 transition ${
                    timer.isFinished 
                      ? 'bg-red-500/10 border-red-500/40 animate-pulse' 
                      : 'bg-slate-950/60 border-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-200">{timer.label}</h4>
                      <span className="text-[10px] text-slate-500">
                        Total: {Math.round(timer.totalSeconds / 60)} mins
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Countdown */}
                      <span className={`font-mono text-sm font-bold ${timer.isFinished ? 'text-red-400' : 'text-slate-300'}`}>
                        {timer.isFinished ? <BellRing className="text-red-400 inline animate-bounce" size={16} /> : formatTime(timer.secondsLeft)}
                      </span>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5">
                        {!timer.isFinished && (
                          <button
                            onClick={() => toggleTimer(timer.id)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
                          >
                            {timer.isRunning ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteTimer(timer.id)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {!timer.isFinished && (
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full transition-all duration-1000"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default KitchenTimer;
