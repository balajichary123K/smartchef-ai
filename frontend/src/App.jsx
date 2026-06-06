import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RecipeProvider } from './context/RecipeContext';
import { GroceryProvider } from './context/GroceryContext';
import { Home } from './pages/Home';
import { RecipeDetails } from './pages/RecipeDetails';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { MealPlanner } from './pages/MealPlanner';
import { AIChefAssistant } from './components/AIChefAssistant';
import { ChefHat, ShoppingBag, Sparkles, User, Calendar } from 'lucide-react';

// Navigation Bar Component
const Navigation = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-gradient font-black text-xl tracking-tight">
          <ChefHat size={24} className="text-orange-500" />
          <span>SmartChef AI</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <Link 
            to="/" 
            className={`hover:text-slate-200 transition ${path === '/' ? 'text-orange-400' : ''}`}
          >
            Discover Recipes
          </Link>
          <Link 
            to="/scanner" 
            className={`hover:text-slate-200 transition flex items-center gap-1.5 ${path === '/scanner' ? 'text-orange-400' : ''}`}
          >
            <Sparkles size={13} />
            <span>AI Kitchen Tools</span>
          </Link>
          <Link 
            to="/meal-planner" 
            className={`hover:text-slate-200 transition flex items-center gap-1.5 ${path === '/meal-planner' ? 'text-orange-400' : ''}`}
          >
            <Calendar size={13} />
            <span>Meal Planner</span>
          </Link>
          <Link 
            to="/dashboard" 
            className={`hover:text-slate-200 transition flex items-center gap-1.5 ${path === '/dashboard' ? 'text-orange-400' : ''}`}
          >
            <User size={13} />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Small Screen Nav Icons */}
        <div className="flex sm:hidden items-center gap-4 text-slate-400">
          <Link to="/" className={path === '/' ? 'text-orange-400' : ''}><ChefHat size={20} /></Link>
          <Link to="/scanner" className={path === '/scanner' ? 'text-orange-400' : ''}><Sparkles size={20} /></Link>
          <Link to="/meal-planner" className={path === '/meal-planner' ? 'text-orange-400' : ''}><Calendar size={20} /></Link>
          <Link to="/dashboard" className={path === '/dashboard' ? 'text-orange-400' : ''}><User size={20} /></Link>
        </div>

      </div>
    </header>
  );
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <RecipeProvider>
          <GroceryProvider>
            
            <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
              
              <div className="space-y-6">
                <Navigation />
                <main className="max-w-7xl mx-auto px-4">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/recipe/:id" element={<RecipeDetails />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/scanner" element={<Scanner />} />
                    <Route path="/meal-planner" element={<MealPlanner />} />
                  </Routes>
                </main>
              </div>

              {/* Global Floating AI Chef Assistant Widget */}
              <AIChefAssistant />

              {/* Footer */}
              <footer className="w-full border-t border-slate-900 py-6 text-center text-[10px] text-slate-600 bg-slate-950">
                <p>© 2026 SmartChef AI. All rights reserved. Crafted for delicious and waste-free cooking.</p>
              </footer>

            </div>

          </GroceryProvider>
        </RecipeProvider>
      </AuthProvider>
    </Router>
  );
};
export default App;
