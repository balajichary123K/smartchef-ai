import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeContext } from '../context/RecipeContext';
import { AuthContext } from '../context/AuthContext';
import { useVoice } from '../hooks/useVoice';
import { Search, Mic, MicOff, Star, Clock, ChefHat, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { recipes, loading, searchParams, setSearchParams, fetchRecipes } = useContext(RecipeContext);
  const [voiceQueryActive, setVoiceQueryActive] = useState(false);

  // Initialize Voice Search helper
  const voice = useVoice({
    onAskQuestion: (transcript) => {
      // Voice query handler
      setSearchParams(prev => ({ ...prev, search: transcript }));
      fetchRecipes({ ...searchParams, search: transcript });
      voice.speak(`Searching for ${transcript}`);
      setVoiceQueryActive(false);
      voice.stopListening();
    }
  });

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchRecipes();
    setTimeout(() => {
      document.getElementById('recipes-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCategoryClick = (categoryName) => {
    const isDietary = ['vegetarian', 'vegan', 'high protein', 'weight loss'].includes(categoryName.toLowerCase());
    
    // Reset other parameters to perform a clean, fresh search
    const newParams = {
      search: '',
      cuisine: '',
      dietary: isDietary ? categoryName : '',
      mealType: !isDietary && ['breakfast', 'lunch', 'dinner', 'snacks', 'desserts'].includes(categoryName.toLowerCase()) ? categoryName : '',
      maxTime: ''
    };
    
    setSearchParams(newParams);
    fetchRecipes(newParams);
    
    // Smooth scroll down to recipes list
    document.getElementById('recipes-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleVoiceSearch = () => {
    if (voice.isListening) {
      voice.stopListening();
      setVoiceQueryActive(false);
    } else {
      setVoiceQueryActive(true);
      voice.speak("Tell me what you would like to cook.");
      // Small timeout to let voice complete prompt speaking
      setTimeout(() => {
        voice.startListening();
      }, 1500);
    }
  };

  // Quick meals trigger
  const applyQuickMealFilter = (minutes) => {
    // Reset other parameters for a fresh filter
    const newParams = {
      search: '',
      cuisine: '',
      mealType: '',
      dietary: '',
      maxTime: minutes.toString()
    };
    setSearchParams(newParams);
    fetchRecipes(newParams);
    document.getElementById('recipes-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  // filter recipes based on user dietary preference if logged in for recommendations
  const recommendedRecipes = recipes.filter(r => {
    if (!user || user.role === 'guest') return r.isFeatured;
    const prefDietary = user.preferences?.dietary || [];
    if (prefDietary.length === 0) return r.isFeatured;
    return r.dietaryTags.some(tag => 
      prefDietary.some(p => p.toLowerCase() === tag.toLowerCase())
    );
  }).slice(0, 3);

  const categories = [
    { name: 'Breakfast', image: '🥞' },
    { name: 'Lunch', image: '🍲' },
    { name: 'Dinner', image: '🥩' },
    { name: 'Vegetarian', image: '🥗' },
    { name: 'Vegan', image: '🌱' },
    { name: 'High Protein', image: '🥚' },
    { name: 'Weight Loss', image: '🥑' }
  ];

  return (
    <div className="space-y-12 pb-16 font-sans">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[380px] flex items-center justify-center p-8 bg-slate-950 border border-slate-900 shadow-2xl">
        {/* Animated Background blur balls */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-orange-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold"
          >
            <Sparkles size={14} className="animate-spin" />
            <span>AI-Powered Smart Chef Cooking Assistant</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">
            What are we cooking today?
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Discover thousands of global recipes, scale ingredients dynamically, compare real-time grocery prices, and cook with voice commands.
          </p>

          {/* Smart Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-lg mx-auto bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-lg focus-within:border-orange-500/30 transition-all">
            <div className="flex-1 flex items-center gap-2 px-2">
              <Search className="text-slate-500" size={20} />
              <input
                type="text"
                placeholder={voiceQueryActive ? "Listening..." : "Search recipe, cuisine, ingredients..."}
                value={searchParams.search}
                onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
              />
            </div>
            
            {/* Voice Search Button */}
            {voice.supported && (
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  voice.isListening 
                    ? 'bg-red-500/20 border-red-500/40 text-red-400 pulse-glow-orange' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title="Search using voice"
              >
                {voice.isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition btn-glow-orange cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Quick Meal Suggestion Filter Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ChefHat className="text-orange-500" size={22} />
          <span>Quick Meal Suggestions</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => applyQuickMealFilter(15)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition cursor-pointer"
          >
            ⏱️ Under 15 Mins
          </button>
          <button
            onClick={() => applyQuickMealFilter(30)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition cursor-pointer"
          >
            ⏱️ Under 30 Mins
          </button>
          <button
            onClick={() => handleCategoryClick('weight loss')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition cursor-pointer"
          >
            🥗 Low Calorie / Diet
          </button>
          <button
            onClick={() => handleCategoryClick('high protein')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-orange-400 hover:border-orange-500/30 transition cursor-pointer"
          >
            💪 High Protein Meals
          </button>
        </div>
      </section>

      {/* Categories Horizontal Scroll grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Browse Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleCategoryClick(cat.name)}
              className="glass-panel glass-panel-hover p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
            >
              <span className="text-2xl">{cat.image}</span>
              <span className="text-xs font-semibold text-slate-300">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="text-amber-400 animate-pulse" size={22} />
          <span>Personalized Recommendations</span>
        </h2>
        
        <div className="grid sm:grid-cols-3 gap-6">
          {recommendedRecipes.length === 0 ? (
            <div className="col-span-3 text-center p-8 bg-slate-900/40 rounded-2xl text-slate-500 text-xs border border-slate-900">
              No recommendations matching your preferences yet. Try setting your diet goals in the dashboard!
            </div>
          ) : (
            recommendedRecipes.map(recipe => (
              <div
                key={recipe._id}
                onClick={() => navigate(`/recipe/${recipe._id}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-200 border border-slate-800">
                    {recipe.cuisine}
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-200 group-hover:text-orange-400 transition text-sm">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-900/60">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recipe.prepTime + recipe.cookTime} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {recipe.averageRating}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recipes anchor block section list */}
      <section id="recipes-anchor" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Explore Recipes</h2>
          {searchParams.search || searchParams.cuisine || searchParams.mealType || searchParams.dietary || searchParams.maxTime ? (
            <button
              onClick={() => {
                const cleared = { search: '', cuisine: '', mealType: '', dietary: '', maxTime: '' };
                setSearchParams(cleared);
                fetchRecipes(cleared);
              }}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium"
            >
              Reset Filters
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-900" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 border border-slate-900 rounded-3xl space-y-4">
            <AlertCircle className="mx-auto text-slate-600" size={36} />
            <h3 className="font-semibold text-slate-300 text-sm">No recipes found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find matches for your current filters. Try resetting the search filters.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6 animate-slide-up">
            {recipes.map(recipe => (
              <div
                key={recipe._id}
                onClick={() => navigate(`/recipe/${recipe._id}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden glass-panel glass-panel-hover flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-200 border border-slate-800">
                    {recipe.cuisine}
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-200 group-hover:text-orange-400 transition text-sm">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-900/60">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recipe.prepTime + recipe.cookTime} mins
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {recipe.averageRating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;
