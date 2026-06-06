import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const GroceryContext = createContext();

export const GroceryProvider = ({ children }) => {
  const { user, syncGroceryList } = useContext(AuthContext);
  const [groceryItems, setGroceryItems] = useState([]);
  const [compareResults, setCompareResults] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Sync state with user profile grocery list
  useEffect(() => {
    if (user && user.groceryList) {
      setGroceryItems(user.groceryList);
    } else {
      setGroceryItems([]);
    }
  }, [user]);

  // Update list locally and sync with backend
  const updateList = async (newList) => {
    setGroceryItems(newList);
    if (syncGroceryList) {
      await syncGroceryList(newList);
    }
  };

  // Add items from a recipe
  const addRecipeIngredients = async (recipe, servingsCount) => {
    const scaleFactor = servingsCount / recipe.baseServings;
    
    const newItems = recipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: `${Math.round(ing.amount * scaleFactor)}${ing.unit}`,
      checked: false,
      recipeId: recipe._id
    }));

    // Merge logic: if item name exists, combine them or just append
    const updatedList = [...groceryItems];
    newItems.forEach(newItem => {
      const matchIndex = updatedList.findIndex(item => 
        item.name.toLowerCase() === newItem.name.toLowerCase() && !item.checked
      );
      if (matchIndex > -1) {
        // Simple append new quantity or overwrite with larger
        updatedList[matchIndex].quantity = `${newItem.quantity} (scaled)`;
      } else {
        updatedList.push({
          ...newItem,
          _id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        });
      }
    });

    await updateList(updatedList);
  };

  // Add individual custom item
  const addCustomItem = async (name, quantity = '') => {
    const newItem = {
      _id: `item_${Date.now()}`,
      name,
      quantity,
      checked: false
    };
    await updateList([...groceryItems, newItem]);
  };

  // Toggle item checked state
  const toggleItem = async (itemId) => {
    const updated = groceryItems.map(item => 
      item._id === itemId ? { ...item, checked: !item.checked } : item
    );
    await updateList(updated);
  };

  // Clear checked items
  const clearCheckedItems = async () => {
    const filtered = groceryItems.filter(item => !item.checked);
    await updateList(filtered);
    setCompareResults(null);
  };

  // Run comparative pricing engine
  const runComparison = async () => {
    const activeItems = groceryItems.filter(item => !item.checked);
    if (activeItems.length === 0) return;

    setCompareLoading(true);
    try {
      // Parse quantities for backend comparison logic
      const formattedItems = activeItems.map(item => {
        // Extract numerical amount and unit from quantity string e.g. "400g" -> amount: 400, unit: "g"
        const amtMatch = item.quantity.match(/^(\d+)([a-zA-Z]+)$/);
        const amount = amtMatch ? parseInt(amtMatch[1]) : 250;
        const unit = amtMatch ? amtMatch[2] : 'g';
        return {
          name: item.name,
          amount,
          unit
        };
      });

      const res = await axios.post('/api/grocery/compare', { items: formattedItems });
      setCompareResults(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to run grocery price comparison:', err.message);
      setCompareResults(null);
    } finally {
      setCompareLoading(false);
    }
  };

  // Clear comparison result
  const resetComparison = () => {
    setCompareResults(null);
  };

  return (
    <GroceryContext.Provider
      value={{
        groceryItems,
        compareResults,
        compareLoading,
        addRecipeIngredients,
        addCustomItem,
        toggleItem,
        clearCheckedItems,
        runComparison,
        resetComparison
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};
