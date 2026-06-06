import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Minus } from 'lucide-react';

export const DynamicCalculator = ({ servings, setServings }) => {
  const presets = [1, 2, 4, 10];

  const handleIncrement = () => {
    setServings(prev => Math.min(prev + 1, 50));
  };

  const handleDecrement = () => {
    setServings(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="rounded-2xl glass-panel p-5 space-y-4 border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Users size={20} className="text-orange-500" />
          <span className="font-semibold text-sm">Dynamic Servings Calculator</span>
        </div>
        <span className="text-xs text-slate-500">Auto-scales ingredients</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-900">
        {/* Presets */}
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setServings(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                servings === p
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p} {p === 1 ? 'Person' : 'People'}
            </button>
          ))}
        </div>

        {/* Custom Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDecrement}
            disabled={servings <= 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
          >
            <Minus size={16} />
          </button>
          
          <motion.span 
            key={servings}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg font-bold text-orange-400 w-8 text-center"
          >
            {servings}
          </motion.span>
          
          <button
            onClick={handleIncrement}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default DynamicCalculator;
