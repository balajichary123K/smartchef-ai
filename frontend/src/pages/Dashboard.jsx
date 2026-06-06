import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { RecipeContext } from '../context/RecipeContext';
import { GroceryContext } from '../context/GroceryContext';
import { 
  User, Settings, Folder, Heart, ShoppingBag, Clock, Plus, Trash2, 
  Check, CheckSquare, Square, RefreshCw, ChevronRight, HelpCircle, Save 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updatePreferences, logout } = useContext(AuthContext);
  const { recipes, collections, createCollection, deleteCollection, toggleFavorite } = useContext(RecipeContext);
  const { groceryItems, toggleItem, clearCheckedItems, runComparison, compareResults, compareLoading } = useContext(GroceryContext);

  const [activeTab, setActiveTab] = useState('grocery'); // grocery, collections, preferences

  // Preferences form state
  const [dietaryInput, setDietaryInput] = useState([]);
  const [allergiesInput, setAllergiesInput] = useState('');
  const [cookingLevel, setCookingLevel] = useState('intermediate');
  const [goalsInput, setGoalsInput] = useState({
    weightLoss: false, muscleGain: false, diabeticFriendly: false,
    highProtein: false, keto: false, vegan: false
  });

  // Collection form state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');

  // Sync preference states with user profile
  useEffect(() => {
    if (user) {
      setDietaryInput(user.preferences?.dietary || []);
      setAllergiesInput(user.preferences?.allergies?.join(', ') || '');
      setCookingLevel(user.preferences?.cookingLevel || 'intermediate');
      setGoalsInput({
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

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    const allergiesArray = allergiesInput.split(',').map(s => s.trim()).filter(Boolean);
    
    try {
      await updatePreferences({
        dietary: dietaryInput,
        allergies: allergiesArray,
        cookingLevel,
        nutritionGoals: goalsInput
      });
      alert('Dietary preferences updated successfully!');
    } catch (err) {
      alert('Failed to update preferences');
    }
  };

  const toggleDietaryTag = (tag) => {
    setDietaryInput(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    try {
      await createCollection(folderName, folderDesc);
      setFolderName('');
      setFolderDesc('');
      setShowFolderModal(false);
    } catch (err) {
      alert('Failed to create folder');
    }
  };

  // Find actual recipe objects matching user favorite IDs
  const favoriteRecipes = recipes.filter(r => 
    user?.favorites?.includes(r._id) || user?.favorites?.some(fav => fav._id === r._id || fav === r._id)
  );

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Header Profile Dashboard */}
      <section className="rounded-3xl glass-panel p-6 border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-950/60">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-2xl uppercase shadow-lg">
            {user ? user.name.slice(0, 2) : 'GC'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">{user ? user.name : 'Guest Cook'}</h1>
            <p className="text-xs text-slate-500 capitalize">Role: {user ? user.role : 'Guest'} • Cooking: {cookingLevel}</p>
          </div>
        </div>

        <button 
          onClick={logout} 
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-slate-800 transition cursor-pointer"
        >
          {user?.role === 'guest' ? 'Reset Session' : 'Sign Out'}
        </button>
      </section>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-900 gap-6">
        <button
          onClick={() => setActiveTab('grocery')}
          className={`pb-3 text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'grocery' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ShoppingBag size={16} />
          <span>Active Grocery List</span>
          {groceryItems.filter(i => !i.checked).length > 0 && (
            <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {groceryItems.filter(i => !i.checked).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`pb-3 text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'collections' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Folder size={16} />
          <span>Saved & Folders</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'preferences' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Settings size={16} />
          <span>Dietary Preferences</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* TAB 1: ACTIVE GROCERY CHECKLIST */}
        {activeTab === 'grocery' && (
          <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
            
            {/* Shopping List panel */}
            <div className="md:col-span-1 space-y-4">
              <div className="rounded-2xl glass-panel p-5 space-y-4 border border-slate-800">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h2 className="font-bold text-slate-100 text-sm">Shopping Checklist</h2>
                  {groceryItems.some(i => i.checked) && (
                    <button
                      onClick={clearCheckedItems}
                      className="text-[10px] text-slate-500 hover:text-red-400"
                    >
                      Clear Purchased
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {groceryItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs leading-relaxed">
                      Your shopping list is empty. Go to a recipe page and add ingredients!
                    </div>
                  ) : (
                    groceryItems.map(item => (
                      <div
                        key={item._id}
                        onClick={() => toggleItem(item._id)}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                          item.checked 
                            ? 'bg-slate-900/20 border-slate-950/40 opacity-55' 
                            : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        {item.checked ? (
                          <CheckSquare className="text-orange-500 flex-shrink-0" size={16} />
                        ) : (
                          <Square className="text-slate-600 flex-shrink-0" size={16} />
                        )}
                        <div className="flex-1 flex justify-between items-center text-xs">
                          <span className={`font-medium ${item.checked ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                            {item.name}
                          </span>
                          <span className="text-slate-500 font-semibold">{item.quantity}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {groceryItems.filter(i => !i.checked).length > 0 && (
                  <button
                    onClick={runComparison}
                    className="w-full mt-2 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer btn-glow-orange"
                  >
                    <span>Run Price Comparison Quotes</span>
                  </button>
                )}
              </div>
            </div>

            {/* Price comparison result side panels */}
            <div className="md:col-span-2">
              {compareLoading ? (
                <div className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-900 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                  <RefreshCw className="animate-spin text-orange-500" size={20} />
                  <span>AI Pricing Comparison engines active...</span>
                </div>
              ) : compareResults ? (
                <div className="space-y-4">
                  <h2 className="font-bold text-slate-100 text-sm">Delivery platform comparison quotes</h2>
                  <GroceryComparison results={compareResults} onCheckout={(platform, total) => alert(`Ordered ingredients from ${platform} for Rs.${total}!`)} />
                </div>
              ) : (
                <div className="h-64 rounded-3xl bg-slate-900/10 border border-slate-900 border-dashed flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <ShoppingBag className="text-slate-700" size={32} />
                  <h3 className="font-semibold text-slate-400 text-xs">Comparison Engine Ready</h3>
                  <p className="text-[10px] text-slate-600 max-w-sm leading-normal">
                    Click 'Run Price Comparison Quotes' on your checklist to fetch comparative prices from Blinkit, Zepto, Swiggy Instamart, and BigBasket.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED RECIPES & FOLDER COLLECTIONS */}
        {activeTab === 'collections' && (
          <div className="space-y-8 animate-slide-up">
            
            {/* Collection folders */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Folder className="text-orange-500" size={18} />
                  <span>My Custom Folders</span>
                </h2>
                {user?.role !== 'guest' && (
                  <button
                    onClick={() => setShowFolderModal(true)}
                    className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Create Folder</span>
                  </button>
                )}
              </div>

              {user?.role === 'guest' ? (
                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl text-center text-slate-500 text-xs">
                  Create custom collections and folders by signing up for an account!
                </div>
              ) : collections.length === 0 ? (
                <div className="p-6 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl text-center text-slate-600 text-xs">
                  No folders created yet. Click 'Create Folder' to organize recipes.
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4">
                  {collections.map(folder => (
                    <div key={folder._id} className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-200 text-sm">{folder.name}</h3>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{folder.description || 'Custom Recipe Folder'}</p>
                        <span className="text-[10px] text-orange-400 block font-semibold pt-1">
                          {folder.recipes?.length || 0} recipes bound
                        </span>
                      </div>
                      
                      <button
                        onClick={() => deleteCollection(folder._id)}
                        className="text-[10px] text-red-500 hover:text-red-400 self-end"
                      >
                        Delete Folder
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Favorite recipes */}
            <section className="space-y-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" size={18} />
                <span>Saved Favorites</span>
              </h2>

              {favoriteRecipes.length === 0 ? (
                <div className="p-12 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl text-center text-slate-600 text-xs">
                  You haven't favorited any recipes yet. Explore and click 'Add to Favorites'!
                </div>
              ) : (
                <div className="grid sm:grid-cols-4 gap-4">
                  {favoriteRecipes.map(recipe => (
                    <div
                      key={recipe._id}
                      className="group cursor-pointer rounded-2xl overflow-hidden glass-panel border border-slate-800 flex flex-col justify-between"
                    >
                      <div className="aspect-video relative overflow-hidden" onClick={() => navigate(`/recipe/${recipe._id}`)}>
                        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div className="p-3 flex justify-between items-center gap-2">
                        <span onClick={() => navigate(`/recipe/${recipe._id}`)} className="font-semibold text-xs text-slate-300 truncate flex-1 hover:text-orange-400 transition">
                          {recipe.name}
                        </span>
                        <button
                          onClick={() => toggleFavorite(recipe._id)}
                          className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                          title="Remove from favorites"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Cooking History list */}
            {user?.history?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="text-slate-400" size={18} />
                  <span>Recently Viewed Recipes</span>
                </h2>
                <div className="grid sm:grid-cols-4 gap-4">
                  {recipes.filter(r => user.history.some(h => h.recipe === r._id || h.recipe?._id === r._id)).slice(0, 4).map(recipe => (
                    <div
                      key={recipe._id}
                      onClick={() => navigate(`/recipe/${recipe._id}`)}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-center gap-3 cursor-pointer hover:border-slate-800 transition"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-300 truncate">{recipe.name}</h4>
                        <span className="text-[10px] text-slate-500">{recipe.cuisine} • {recipe.prepTime + recipe.cookTime}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 3: DIETARY PREFERENCES */}
        {activeTab === 'preferences' && (
          <form onSubmit={handlePreferencesSave} className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-6 max-w-xl animate-slide-up">
            <h2 className="font-bold text-slate-100 text-base border-b border-slate-900 pb-3">Diet & Cooking Level Settings</h2>
            
            {/* Cooking Skill Level */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Your Cooking Experience</label>
              <div className="grid grid-cols-3 gap-2">
                {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCookingLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition cursor-pointer ${
                      cookingLevel === lvl
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-900 text-slate-400 border-slate-900 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Tags Toggles */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Dietary Requirements</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Dairy-Free', 'High-Protein', 'Low-Calorie'].map((tag) => {
                  const active = dietaryInput.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDietaryTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        active
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-slate-900 text-slate-500 border-slate-900 hover:text-slate-400'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nutrition Goals (Switches) */}
            <div className="space-y-3">
              <label className="text-xs text-slate-400 font-medium block">Nutrition Goals</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.keys(goalsInput).map((goalKey) => (
                  <div 
                    key={goalKey} 
                    onClick={() => setGoalsInput(prev => ({ ...prev, [goalKey]: !prev[goalKey] }))}
                    className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-900 rounded-xl cursor-pointer hover:border-slate-800 transition"
                  >
                    <span className="capitalize text-slate-300 font-medium">
                      {goalKey.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      goalsInput[goalKey] 
                        ? 'bg-orange-500 border-orange-500 text-white' 
                        : 'border-slate-700 bg-slate-900'
                    }`}>
                      {goalsInput[goalKey] && <Check size={12} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allergies list input */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Food Allergies</label>
              <input
                type="text"
                placeholder="Peanuts, Shellfish, Gluten (comma separated)"
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-xs transition cursor-pointer btn-glow-orange flex items-center justify-center gap-2"
            >
              <Save size={14} />
              <span>Save Diet Preferences</span>
            </button>
          </form>
        )}
      </div>

      {/* CREATE COLLECTION MODAL OVERLAY */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleCreateFolder}
            className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl relative"
          >
            <h3 className="text-lg font-bold text-slate-100">Create Custom Folder</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Folder Name</label>
              <input
                type="text"
                placeholder="e.g. My Breakfasts, Weight Loss"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Description</label>
              <textarea
                placeholder="Brief description of this folder"
                value={folderDesc}
                onChange={(e) => setFolderDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 h-20 focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-xs transition cursor-pointer btn-glow-orange"
              >
                Create Folder
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
