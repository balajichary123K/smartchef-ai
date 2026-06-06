import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
  Calendar, Check, Shield, Sparkles, RefreshCw, ChefHat, 
  Flame, Target, AlertCircle, Apple, Dumbbell, Activity 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const MealPlanner = () => {
  const { user } = useContext(AuthContext);
  
  const [preferences, setPreferences] = useState('');
  const [days, setDays] = useState(3);
  const [goals, setGoals] = useState({
    weightLoss: false, muscleGain: false, diabeticFriendly: false,
    highProtein: false, keto: false, vegan: false
  });
  
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  // Sync with user preferences on mount
  useEffect(() => {
    if (user) {
      setPreferences(user.preferences?.dietary?.join(', ') || '');
      setGoals({
        weightLoss: user.preferences?.nutritionGoals?.weightLoss || false,
        muscleGain: user.preferences?.nutritionGoals?.muscleGain || false,
        diabeticFriendly: user.preferences?.nutritionGoals?.diabeticFriendly || false,
        highProtein: user.preferences?.nutritionGoals?.highProtein || false,
        keto: user.preferences?.nutritionGoals?.keto || false,
        vegan: user.preferences?.nutritionGoals?.vegan || false,
        ...user.preferences?.nutritionGoals
      });
    }
  }, [user]);

  const toggleGoal = (key) => {
    setGoals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMealPlan(null);
    setActiveDayIdx(0);

    try {
      const res = await axios.post('/api/ai/meal-plan', {
        preferences,
        days,
        goals
      });
      setMealPlan(res.data);
    } catch (err) {
      console.error(err.message);
      // Local mock fallback meal plan generator
      setMealPlan(generateLocalMockMealPlan());
    } finally {
      setLoading(false);
    }
  };

  // Simulated fallback generator
  const generateLocalMockMealPlan = () => {
    const calorieTarget = goals.weightLoss ? 1600 : (goals.muscleGain ? 2600 : 2000);
    const dayPlans = [];
    
    for (let i = 1; i <= days; i++) {
      dayPlans.push({
        dayNumber: i,
        meals: {
          breakfast: { name: "Oatmeal with Blueberries & Chia Seeds", calories: Math.round(calorieTarget * 0.25), protein: "14g", carbs: "48g", fat: "7g" },
          lunch: { name: "Mediterranean Chickpea & Vegetable Salad", calories: Math.round(calorieTarget * 0.35), protein: "18g", carbs: "55g", fat: "11g" },
          dinner: { name: "Baked Salmon with Broccoli & Sweet Potato", calories: Math.round(calorieTarget * 0.30), protein: "38g", carbs: "42g", fat: "14g" },
          snacks: { name: "Greek Yogurt with Cashews", calories: Math.round(calorieTarget * 0.10), protein: "12g", carbs: "12g", fat: "5g" }
        }
      });
    }

    return {
      title: "AI Optimized Meal Plan (Simulation)",
      summary: `A balanced diet plan targeting ${calorieTarget} calories per day, designed for diet preferences: ${preferences || 'none'}.`,
      days: dayPlans
    };
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Title */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <Calendar className="text-orange-500" size={24} />
          <span>Smart AI Meal Planner</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Generate nutrition plans matching your budget, dietary restrictions, and weight goals.
        </p>
      </section>

      {/* Main planner dashboard split */}
      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* Left Form Column */}
        <div className="md:col-span-1">
          <form onSubmit={handleGeneratePlan} className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-5">
            <h2 className="font-bold text-slate-200 text-sm border-b border-slate-900 pb-3">Plan Specifications</h2>

            {/* Plan Duration */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Plan Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDays(num)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      days === num
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-900 hover:text-slate-200'
                    }`}
                  >
                    {num} {num === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Goals list */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Health Goals</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.keys(goals).map((goalKey) => {
                  const active = goals[goalKey];
                  return (
                    <div
                      key={goalKey}
                      onClick={() => toggleGoal(goalKey)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        active 
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
                          : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-850'
                      }`}
                    >
                      <span className="capitalize font-medium text-[11px]">
                        {goalKey.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        active ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {active && <Check size={10} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Restrictions */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Dietary Restrictions</label>
              <input
                type="text"
                placeholder="e.g. Vegetarian, low sodium, nut allergy"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-xs transition cursor-pointer btn-glow-orange flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              <span>Generate Custom Meal Plan</span>
            </button>
          </form>
        </div>

        {/* Right Output Results Column */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <RefreshCw className="animate-spin text-orange-500" size={20} />
              <span>Gemini AI is calculating macronutrients...</span>
            </div>
          ) : mealPlan ? (
            <div className="space-y-6 animate-slide-up">
              
              {/* Plan Overview header */}
              <div className="rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-5 space-y-2">
                <h2 className="font-bold text-slate-100 text-base flex items-center gap-1.5">
                  <ChefHat className="text-orange-500" size={18} />
                  <span>{mealPlan.title}</span>
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {mealPlan.summary}
                </p>
              </div>

              {/* Day selection horizontal bar tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-900">
                {mealPlan.days?.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDayIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition cursor-pointer ${
                      activeDayIdx === idx
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>

              {/* Day's Meals cards grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {mealPlan.days?.[activeDayIdx] && Object.entries(mealPlan.days[activeDayIdx].meals).map(([mealType, meal], index) => (
                  <div
                    key={index}
                    className="rounded-2xl glass-panel p-4 border border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                          {mealType}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                          <Flame size={12} className="text-red-400" />
                          <span>{meal.calories} kcal</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-100 text-sm leading-snug">{meal.name}</h4>
                    </div>

                    {/* Macros info tags */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-900/60">
                      <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-900 text-center">
                        <span className="text-slate-500 block">Protein</span>
                        <span className="font-bold text-slate-200">{meal.protein}</span>
                      </div>
                      <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-900 text-center">
                        <span className="text-slate-500 block">Carbs</span>
                        <span className="font-bold text-slate-200">{meal.carbs}</span>
                      </div>
                      <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-900 text-center">
                        <span className="text-slate-500 block">Fat</span>
                        <span className="font-bold text-slate-200">{meal.fat}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Calendar className="text-slate-700" size={32} />
              <h3 className="font-semibold text-slate-400 text-xs">Meal Plan Generator Ready</h3>
              <p className="text-[10px] text-slate-600 max-w-sm leading-normal">
                Enter your health goals and duration specs on the left, and click 'Generate Custom Meal Plan' to formulate target daily macros schedules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MealPlanner;
