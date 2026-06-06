import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Flame, ShieldAlert, Sparkles, Clock, Truck, CheckCircle } from 'lucide-react';

export const GroceryComparison = ({ results, onCheckout }) => {
  if (!results) return null;

  const { platforms, recommendation } = results;

  // Helpers to check badges
  const getBadgeType = (platformName) => {
    if (recommendation.bestPricePlatform === platformName) return 'best-price';
    if (recommendation.fastestPlatform === platformName) return 'fastest';
    if (recommendation.bestValuePlatform === platformName) return 'best-value';
    return null;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* AI Assistant recommendations header banner */}
      {recommendation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-500/20 p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-orange-400 font-semibold">
            <Sparkles size={18} className="animate-pulse" />
            <span>AI Shopping Assistant Savings Report</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {recommendation.reasoning}
          </p>
          <div className="grid md:grid-cols-3 gap-3 pt-2">
            {recommendation.savingsTips.map((tip, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-xs text-slate-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grid of Platform Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {platforms.map((platform) => {
          const badge = getBadgeType(platform.name);
          
          return (
            <motion.div
              key={platform.id}
              whileHover={{ y: -4 }}
              className="relative rounded-2xl glass-panel p-5 flex flex-col justify-between border border-slate-800/80 bg-slate-950/40"
            >
              {/* Badge overlay */}
              {badge && (
                <div className={`absolute -top-3 right-4 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                  badge === 'best-price' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  badge === 'fastest' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                  'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {badge === 'best-price' ? 'Best Price' :
                   badge === 'fastest' ? 'Fastest' :
                   'Best Value'}
                </div>
              )}

              <div className="space-y-4">
                {/* Platform Name */}
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{platform.name}</h3>
                  <span className="text-xs text-slate-500">Availability: {platform.availabilityCount} items</span>
                </div>

                {/* Delivery details */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-500" />
                    <span>Est. Delivery: {platform.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck size={13} className="text-slate-500" />
                    <span>Delivery Fee: Rs.{platform.deliveryFee}</span>
                  </div>
                </div>

                {/* Items check details */}
                <div className="border-t border-slate-900/60 pt-3 space-y-2 max-h-[120px] overflow-y-auto">
                  {platform.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className={item.available ? 'text-slate-300' : 'text-slate-500 line-through'}>
                        {item.name}
                      </span>
                      <span className={`font-semibold ${item.available ? 'text-slate-400' : 'text-red-500'}`}>
                        {item.available ? `Rs.${item.price}` : 'Out of stock'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price totals footer & checkout button */}
              <div className="border-t border-slate-900 pt-4 mt-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Total Price:</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-100">Rs.{platform.total}</span>
                    <span className="text-[10px] text-slate-500 block">incl. taxes/fees</span>
                  </div>
                </div>

                <button
                  onClick={() => onCheckout && onCheckout(platform.name, platform.total)}
                  disabled={!platform.allAvailable}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    platform.allAvailable 
                      ? 'bg-orange-500 text-white hover:bg-orange-600 btn-glow-orange' 
                      : 'bg-slate-900 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={14} />
                  <span>Order from {platform.name}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
export default GroceryComparison;
