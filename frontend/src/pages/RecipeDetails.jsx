import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RecipeContext } from '../context/RecipeContext';
import { GroceryContext } from '../context/GroceryContext';
import { useVoice } from '../hooks/useVoice';
import { DynamicCalculator } from '../components/DynamicCalculator';
import { GroceryComparison } from '../components/GroceryComparison';
import { KitchenTimer } from '../components/KitchenTimer';
import { 
  Clock, Flame, Star, ChevronLeft, Volume2, Mic, MicOff, Check, 
  ShoppingCart, AlertTriangle, AlertCircle, ChevronRight, HelpCircle, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchRecipeById, recipeDetails, detailsLoading, toggleFavorite, submitReview } = useContext(RecipeContext);
  const { addRecipeIngredients, runComparison, compareResults, compareLoading } = useContext(GroceryContext);

  const [servings, setServings] = useState(2);
  const [activeStep, setActiveStep] = useState(0);
  const [isCooking, setIsCooking] = useState(false);
  
  // Reviews state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  
  // Grocery list comparison state
  const [ingredientsAdded, setIngredientsAdded] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  // Voice timers connection
  const [voiceTimerRequest, setVoiceTimerRequest] = useState(null);

  // Load recipe
  useEffect(() => {
    fetchRecipeById(id).then(data => {
      if (data) {
        setServings(data.baseServings);
      }
    });
  }, [id]);

  // Voice command handlers
  const handleNextStep = () => {
    if (recipeDetails && activeStep < recipeDetails.instructions.length - 1) {
      const nextIdx = activeStep + 1;
      setActiveStep(nextIdx);
      speakStepText(nextIdx);
    } else {
      voice.speak("You have reached the final step of this recipe. Bon appétit!");
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      const prevIdx = activeStep - 1;
      setActiveStep(prevIdx);
      speakStepText(prevIdx);
    }
  };

  const handleRepeatStep = () => {
    speakStepText(activeStep);
  };

  const handleSetTimer = (mins) => {
    setVoiceTimerRequest({
      id: Date.now(),
      label: `Cooking Step ${activeStep + 1}`,
      minutes: mins
    });
  };

  const handleVoiceQuestion = (transcript) => {
    // Check if user is asking about ingredients
    // e.g. "how much salt", "how much rice"
    const lower = transcript.toLowerCase();
    if (lower.includes('how much') || lower.includes('quantity') || lower.includes('many')) {
      const matchIngredient = recipeDetails.ingredients.find(ing => 
        lower.includes(ing.name.toLowerCase())
      );

      if (matchIngredient) {
        const scaleFactor = servings / recipeDetails.baseServings;
        const scaledAmount = Math.round(matchIngredient.amount * scaleFactor);
        voice.speak(`For ${servings} people, you need ${scaledAmount} ${matchIngredient.unit} of ${matchIngredient.name}.`);
      } else {
        voice.speak("I couldn't find that ingredient in the list. Please ask again.");
      }
    } else {
      // General question redirection instructions
      voice.speak("I'm focused on this cooking step. Try saying next step, repeat step, or ask me for ingredient quantities.");
    }
  };

  // Bind useVoice hook
  const voice = useVoice({
    onNextStep: handleNextStep,
    onPrevStep: handlePrevStep,
    onRepeatStep: handleRepeatStep,
    onSetTimer: handleSetTimer,
    onAskQuestion: handleVoiceQuestion
  });

  const speakStepText = (index) => {
    if (recipeDetails && recipeDetails.instructions[index]) {
      const step = recipeDetails.instructions[index];
      voice.speak(`Step ${step.step}: ${step.text}`);
    }
  };

  const toggleCookingMode = () => {
    if (isCooking) {
      voice.stopListening();
      setIsCooking(false);
    } else {
      setIsCooking(true);
      voice.speak("Cooking assistant activated. I will read steps. Say next step, repeat step, or set timer to control.");
      setTimeout(() => {
        speakStepText(0);
        setActiveStep(0);
        voice.startListening();
      }, 3500);
    }
  };

  const handleAddGrocery = async () => {
    if (!recipeDetails) return;
    await addRecipeIngredients(recipeDetails, servings);
    setIngredientsAdded(true);
    // Auto run price comparison quote
    await runComparison();
  };

  const handleCheckout = (platformName, total) => {
    setCheckoutMessage(`🎉 Ordered ingredients successfully from ${platformName} for Rs.${total}! Delivery is on the way.`);
    setTimeout(() => setCheckoutMessage(''), 8000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      await submitReview(id, ratingInput, commentInput);
      setCommentInput('');
    } catch (err) {
      alert('Failed to save review');
    }
  };

  if (detailsLoading || !recipeDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading recipe detail specs...</span>
      </div>
    );
  }

  // Calculate scaled ingredients list helper
  const scaleFactor = servings / recipeDetails.baseServings;

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Checkout toast alert bar */}
      <AnimatePresence>
        {checkoutMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white font-semibold flex items-center gap-3 shadow-xl max-w-xl mx-auto"
          >
            <Check size={20} className="bg-white/20 p-0.5 rounded-full" />
            <span className="text-sm">{checkoutMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back link */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm transition cursor-pointer"
      >
        <ChevronLeft size={16} />
        <span>Back to Recipes</span>
      </button>

      {/* Hero Banner Grid */}
      <section className="grid md:grid-cols-2 gap-8 items-start">
        {/* Banner image panel */}
        <div className="rounded-3xl overflow-hidden aspect-video relative border border-slate-900 shadow-xl">
          <img 
            src={recipeDetails.image} 
            alt={recipeDetails.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-xs font-bold text-slate-200 border border-slate-800">
            {recipeDetails.cuisine}
          </div>
        </div>

        {/* Recipe details tags header */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {recipeDetails.dietaryTags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-extrabold text-orange-400 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100">{recipeDetails.name}</h1>
            <p className="text-slate-400 text-sm leading-relaxed">{recipeDetails.description}</p>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-2xl text-center space-y-1">
              <Clock size={16} className="mx-auto text-orange-400" />
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Prep Time</span>
              <span className="text-xs font-bold text-slate-200">{recipeDetails.prepTime}m</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-2xl text-center space-y-1">
              <Clock size={16} className="mx-auto text-amber-400" />
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Cook Time</span>
              <span className="text-xs font-bold text-slate-200">{recipeDetails.cookTime}m</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-2xl text-center space-y-1">
              <Flame size={16} className="mx-auto text-red-400" />
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Calories</span>
              <span className="text-xs font-bold text-slate-200">{recipeDetails.calories || 350} kcal</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-2xl text-center space-y-1">
              <Star size={16} className="mx-auto text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Rating</span>
              <span className="text-xs font-bold text-slate-200">{recipeDetails.averageRating} / 5</span>
            </div>
          </div>

          {/* Favorites selector button */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleFavorite(recipeDetails._id)}
              className="flex-1 py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer btn-glow-orange"
            >
              <span>Add to Favorites Collection</span>
            </button>
          </div>
        </div>
      </section>

      {/* Split-screen Details Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column (Ingredients & Nutrition) */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Dynamic serving scale calculator */}
          <DynamicCalculator servings={servings} setServings={setServings} />

          {/* Ingredients list */}
          <div className="rounded-2xl glass-panel p-5 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="font-bold text-slate-100 text-sm">Ingredients Checklist</h2>
              <span className="text-[10px] text-slate-500">Scaled for {servings} servings</span>
            </div>

            <div className="space-y-3">
              {recipeDetails.ingredients.map((ing, idx) => {
                const finalAmt = Math.round(ing.amount * scaleFactor);
                
                return (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-slate-900/40 last:border-0 last:pb-0">
                    <span className="text-slate-300 font-medium">{ing.name}</span>
                    <div className="text-right">
                      <span className="font-bold text-orange-400">{finalAmt} {ing.unit}</span>
                      {ing.substitutes?.length > 0 && (
                        <span className="block text-[10px] text-slate-500 italic">
                          Alt: {ing.substitutes[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAddGrocery}
              className="w-full mt-2 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-orange-400 hover:border-orange-500/30 transition text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart size={15} />
              <span>Add scaled to Shopping List</span>
            </button>
          </div>

          {/* Nutrition Info */}
          <div className="rounded-2xl glass-panel p-5 space-y-4 border border-slate-800">
            <h2 className="font-bold text-slate-100 text-sm border-b border-slate-900 pb-3">Nutrition Facts</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center">
                <span className="text-slate-500">Protein:</span>
                <span className="font-bold text-slate-200">{recipeDetails.nutrition.protein}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center">
                <span className="text-slate-500">Carbs:</span>
                <span className="font-bold text-slate-200">{recipeDetails.nutrition.carbs}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center">
                <span className="text-slate-500">Fat:</span>
                <span className="font-bold text-slate-200">{recipeDetails.nutrition.fat}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center">
                <span className="text-slate-500">Fiber:</span>
                <span className="font-bold text-slate-200">{recipeDetails.nutrition.fiber || '2g'}</span>
              </div>
            </div>
          </div>

          {/* Equipment list */}
          {recipeDetails.equipment?.length > 0 && (
            <div className="rounded-2xl glass-panel p-5 space-y-3 border border-slate-800">
              <h2 className="font-bold text-slate-100 text-sm border-b border-slate-900 pb-2">Equipment Needed</h2>
              <div className="flex flex-wrap gap-2">
                {recipeDetails.equipment.map((eq, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-900 rounded-lg text-xs text-slate-400 border border-slate-900">
                    🍳 {eq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Instructions Steps & Kitchen Helpers) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Cooking Assistant voice guidance HUD */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <Volume2 className="text-orange-500 animate-pulse" size={20} />
                  <span>Hands-Free Cooking Assistant</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Speak voice commands to navigate the steps without touching your phone.
                </p>
              </div>

              <button
                onClick={toggleCookingMode}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isCooking 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-orange-500 text-white hover:bg-orange-600 btn-glow-orange'
                }`}
              >
                {isCooking ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{isCooking ? 'Stop Voice Mode' : 'Start Voice Mode'}</span>
              </button>
            </div>

            {/* Steps interactive timeline list */}
            <div className="space-y-4">
              {recipeDetails.instructions.map((step, idx) => {
                const isActive = activeStep === idx && isCooking;
                
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isCooking) {
                        setActiveStep(idx);
                        speakStepText(idx);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isActive 
                        ? 'bg-slate-950 border-orange-500/50 shadow-md scale-[1.01]' 
                        : activeStep > idx && isCooking
                        ? 'bg-slate-900/30 border-slate-950 opacity-60'
                        : 'bg-slate-900/50 border-slate-900/60'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isActive 
                          ? 'bg-orange-500 text-white' 
                          : activeStep > idx && isCooking
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-xs md:text-sm leading-relaxed ${isActive ? 'text-slate-100 font-medium' : 'text-slate-300'}`}>
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stepper manual back/forward controls */}
            {isCooking && (
              <div className="flex justify-between items-center border-t border-slate-900 pt-4 mt-2">
                <button
                  onClick={handlePrevStep}
                  disabled={activeStep === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40"
                >
                  Previous Step
                </button>
                <span className="text-xs text-slate-500">
                  Step {activeStep + 1} of {recipeDetails.instructions.length}
                </span>
                <button
                  onClick={handleNextStep}
                  disabled={activeStep === recipeDetails.instructions.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40"
                >
                  Next Step
                </button>
              </div>
            )}
          </div>

          {/* Active Timers Sidebar Binding */}
          {isCooking && (
            <KitchenTimer 
              timerRequest={voiceTimerRequest} 
              onClearRequest={() => setVoiceTimerRequest(null)} 
            />
          )}

          {/* Tips and Common Mistakes */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Cooking Tips */}
            {recipeDetails.tips?.length > 0 && (
              <div className="rounded-2xl glass-panel p-5 space-y-3 border border-slate-800">
                <h3 className="font-bold text-slate-200 text-xs border-b border-slate-900 pb-2">Chef Cooking Tips</h3>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-400 leading-relaxed">
                  {recipeDetails.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
              </div>
            )}

            {/* Mistakes & Fixes */}
            {recipeDetails.commonMistakes?.length > 0 && (
              <div className="rounded-2xl glass-panel p-5 space-y-3 border border-slate-800">
                <h3 className="font-bold text-slate-200 text-xs border-b border-slate-900 pb-2">Common Pitfalls & Fixes</h3>
                <div className="space-y-3">
                  {recipeDetails.commonMistakes.map((cm, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-red-400 font-semibold">
                        <AlertTriangle size={14} />
                        <span>{cm.mistake}</span>
                      </div>
                      <p className="text-slate-400 pl-5 leading-normal">{cm.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grocery Comparison Dashboard overlay panel */}
      {ingredientsAdded && (
        <section className="border-t border-slate-900 pt-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShoppingCart className="text-orange-500" size={22} />
              <span>Grocery Price Comparison Quotes</span>
            </h2>
            <span className="text-xs text-slate-500">Comparing totals for {servings} servings</span>
          </div>

          {compareLoading ? (
            <div className="h-40 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-900 flex items-center justify-center text-xs text-slate-500">
              Querying API pricing quotes across platforms...
            </div>
          ) : (
            <GroceryComparison results={compareResults} onCheckout={handleCheckout} />
          )}
        </section>
      )}

      {/* Reviews Section */}
      <section className="border-t border-slate-900 pt-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-100">Reviews & Discussion</h2>
        
        {/* Rating submit form */}
        <form onSubmit={handleReviewSubmit} className="rounded-2xl glass-panel p-5 border border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm">Add your Review</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1 sm:w-1/4">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rating</label>
              <select
                value={ratingInput}
                onChange={(e) => setRatingInput(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500/50"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            
            <div className="space-y-1 flex-1">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Comment</label>
              <input
                type="text"
                placeholder="Share your culinary results or substitute variations..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-xs transition cursor-pointer btn-glow-orange"
          >
            Submit Review
          </button>
        </form>

        {/* Reviews lists */}
        <div className="space-y-3">
          {recipeDetails.ratings?.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No reviews yet. Be the first to share your cooking experience!
            </div>
          ) : (
            recipeDetails.ratings.map((review, index) => (
              <div key={index} className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">{review.userName || 'Anonymous Cook'}</span>
                  <span className="text-amber-500">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-slate-400 leading-normal">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
export default RecipeDetails;
