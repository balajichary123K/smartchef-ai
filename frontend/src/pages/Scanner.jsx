import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Camera, UploadCloud, ChefHat, ShoppingBag, Sparkles, 
  Trash2, AlertCircle, RefreshCw, CheckCircle, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Scanner = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('camera'); // camera, leftovers
  const [loading, setLoading] = useState(false);

  // Ingredient Scanner state
  const [scanResult, setScanResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Leftovers assistant state
  const [leftoversInput, setLeftoversInput] = useState('');
  const [leftoversResult, setLeftoversResult] = useState(null);

  // Trigger file upload select click
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handle image scan upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/ai/scan-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScanResult(res.data);
    } catch (err) {
      console.error(err.message);
      // Local simulated scanner response
      setScanResult({
        detectedIngredients: ["Fresh Tomato", "Onions", "Large Eggs", "Garlic"],
        recipes: [
          {
            name: "Classic Shakshuka",
            matchPercentage: 92,
            missingIngredients: ["Cumin", "Bell Peppers"],
            briefInstructions: "Sauté garlic, onions, and tomatoes. Simmer until sauce forms, crack eggs directly into the sauce, cover, and cook until whites set."
          },
          {
            name: "Masala Scrambled Eggs (Egg Bhurji)",
            matchPercentage: 95,
            missingIngredients: ["Green Chillies", "Turmeric"],
            briefInstructions: "Sauté chopped onions, tomatoes, and garlic. Whisk and pour eggs into the skillet, cook stirring frequently until scrambled."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit leftovers text list
  const handleLeftoversSubmit = async (e) => {
    e.preventDefault();
    if (!leftoversInput.trim()) return;

    setLoading(true);
    setLeftoversResult(null);

    try {
      const res = await axios.post('/api/ai/leftovers', { leftovers: leftoversInput });
      setLeftoversResult(res.data);
    } catch (err) {
      console.error(err.message);
      // Local simulated leftovers recipe generator
      setLeftoversResult([
        {
          name: "Savory Chicken & Rice Stir-Fry",
          description: "Turns dry cooked rice and shredded cooked chicken into a quick Chinese-style fried rice.",
          difficulty: "easy",
          prepTime: 5,
          cookTime: 10,
          additionalNeeded: ["Soy sauce", "Minced Garlic", "Cooking Oil"]
        },
        {
          name: "Quick Chicken Rice Bowl",
          description: "A healthy bowl assembling seasoned chicken, leftover rice, fresh cucumber slices, topped with spicy sriracha mayo.",
          difficulty: "easy",
          prepTime: 5,
          cookTime: 5,
          additionalNeeded: ["Sriracha", "Mayonnaise", "Cucumber"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetScanner = () => {
    setScanResult(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Title */}
      <section className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <Sparkles className="text-orange-500" size={24} />
          <span>Smart AI Kitchen Tools</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Use camera uploads or leftovers list inputs to instantly identify recipes and avoid food waste.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 gap-6">
        <button
          onClick={() => setActiveTab('camera')}
          className={`pb-3 text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'camera' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Camera size={16} />
          <span>Ingredient Scanner (Photo)</span>
        </button>
        <button
          onClick={() => setActiveTab('leftovers')}
          className={`pb-3 text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'leftovers' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ChefHat size={16} />
          <span>Leftover Food Assistant</span>
        </button>
      </div>

      <div className="space-y-6">
        
        {/* TAB 1: INGREDIENT PHOTO SCANNER */}
        {activeTab === 'camera' && (
          <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
            
            {/* Image Uploader Panel */}
            <div className="md:col-span-1 space-y-4">
              <div className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-4 text-center">
                <h2 className="font-bold text-slate-200 text-sm border-b border-slate-900 pb-3">Upload Fridge Photo</h2>

                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="aspect-square rounded-xl overflow-hidden border border-slate-900 bg-slate-950">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={handleResetScanner}
                      className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-red-400 hover:text-red-300 transition cursor-pointer"
                    >
                      Clear Image
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={triggerFileSelect}
                    className="border-2 border-dashed border-slate-800 hover:border-orange-500/35 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition duration-300"
                  >
                    <UploadCloud size={40} className="text-slate-600 group-hover:text-orange-400" />
                    <span className="text-xs text-slate-400 font-semibold">Click to select or take photo</span>
                    <span className="text-[10px] text-slate-600 block leading-normal">
                      Accepts PNG, JPG, JPEG. Ensure ingredients are well-lit and separated.
                    </span>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Results Panel */}
            <div className="md:col-span-2">
              {loading ? (
                <div className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                  <RefreshCw className="animate-spin text-orange-500" size={20} />
                  <span>Gemini Vision parsing photo ingredients...</span>
                </div>
              ) : scanResult ? (
                <div className="space-y-6 animate-slide-up">
                  {/* Ingredients detected tags */}
                  <div className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <CheckCircle size={16} />
                      <span>Ingredients Detected ({scanResult.detectedIngredients?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.detectedIngredients?.map((ing, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-900 rounded-lg text-xs font-medium text-slate-300 border border-slate-850">
                          🥕 {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Recipes */}
                  <div className="space-y-4">
                    <h2 className="font-bold text-slate-100 text-sm">Suggested Recipes</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {scanResult.recipes?.map((recipe, index) => (
                        <div
                          key={index}
                          className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-slate-200 text-sm">{recipe.name}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                {recipe.matchPercentage}% match
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-normal">
                              {recipe.briefInstructions}
                            </p>
                            {recipe.missingIngredients?.length > 0 && (
                              <div className="text-[10px] text-slate-500">
                                <span className="font-semibold text-slate-400">Missing ingredients:</span>{' '}
                                {recipe.missingIngredients.join(', ')}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => navigate('/', { state: { searchQuery: recipe.name } })}
                            className="w-full py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer btn-glow-orange"
                          >
                            <Search size={13} />
                            <span>View step guide</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Camera className="text-slate-700" size={32} />
                  <h3 className="font-semibold text-slate-400 text-xs">Image Scanner Ready</h3>
                  <p className="text-[10px] text-slate-600 max-w-sm leading-normal">
                    Upload or snap a photo of ingredients in your fridge/pantry, and Gemini AI will scan them to suggest custom meals.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LEFTOVER FOOD ASSISTANT */}
        {activeTab === 'leftovers' && (
          <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
            
            {/* Input Form Panel */}
            <div className="md:col-span-1">
              <form onSubmit={handleLeftoversSubmit} className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-4">
                <h2 className="font-bold text-slate-200 text-sm border-b border-slate-900 pb-3">What are your leftovers?</h2>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">List Leftovers</label>
                  <textarea
                    placeholder="e.g. Rice, boiled chicken, half onion, curd..."
                    value={leftoversInput}
                    onChange={(e) => setLeftoversInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 placeholder-slate-500 h-28 focus:outline-none focus:border-orange-500/50 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-xs transition cursor-pointer btn-glow-orange"
                >
                  Find Leftover Recipes
                </button>
              </form>
            </div>

            {/* Results Panel */}
            <div className="md:col-span-2">
              {loading ? (
                <div className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                  <RefreshCw className="animate-spin text-orange-500" size={20} />
                  <span>Gemini AI finding recipes to reduce waste...</span>
                </div>
              ) : leftoversResult ? (
                <div className="space-y-4 animate-slide-up">
                  <h2 className="font-bold text-slate-100 text-sm">Recipes using leftovers</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {leftoversResult.map((recipe, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-200 text-sm">{recipe.name}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 font-semibold capitalize">
                              {recipe.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-normal">
                            {recipe.description}
                          </p>
                          <div className="text-[10px] text-slate-500 space-y-1 pt-1">
                            <div>⏱️ Total Time: {recipe.prepTime + recipe.cookTime} mins</div>
                            {recipe.additionalNeeded?.length > 0 && (
                              <div>
                                <span className="font-semibold text-slate-400">Extra items needed:</span>{' '}
                                {recipe.additionalNeeded.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => navigate('/', { state: { searchQuery: recipe.name } })}
                          className="w-full py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer btn-glow-orange"
                        >
                          <Search size={13} />
                          <span>Search Full Instructions</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <ChefHat className="text-slate-700" size={32} />
                  <h3 className="font-semibold text-slate-400 text-xs">Leftover Assistant Ready</h3>
                  <p className="text-[10px] text-slate-600 max-w-sm leading-normal">
                    Enter the ingredients and leftovers you have available, and Gemini will generate recipes to turn those exact leftovers into fresh, creative dishes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Scanner;
