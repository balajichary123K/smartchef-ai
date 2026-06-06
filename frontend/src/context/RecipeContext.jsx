import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  
  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    search: '',
    cuisine: '',
    mealType: '',
    dietary: '',
    maxTime: ''
  });

  // Fetch recipes with current search parameters
  const fetchRecipes = async (params = searchParams) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.cuisine) queryParams.append('cuisine', params.cuisine);
      if (params.mealType) queryParams.append('mealType', params.mealType);
      if (params.dietary) queryParams.append('dietary', params.dietary);
      if (params.maxTime) queryParams.append('maxTime', params.maxTime);

      const res = await axios.get(`/api/recipes?${queryParams.toString()}`);
      setRecipes(res.data);
    } catch (err) {
      console.error('Failed to fetch recipes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single recipe details
  const fetchRecipeById = async (id) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(`/api/recipes/${id}`);
      setRecipeDetails(res.data);
      return res.data;
    } catch (err) {
      console.error(`Failed to fetch recipe ${id}:`, err.message);
      setRecipeDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Submit recipe review/rating
  const submitReview = async (recipeId, rating, comment) => {
    try {
      const res = await axios.post(`/api/recipes/${recipeId}/rate`, {
        rating,
        comment,
        userName: user ? user.name : 'Anonymous Cook'
      });
      // Update details if currently viewed
      if (recipeDetails && recipeDetails._id === recipeId) {
        setRecipeDetails(res.data);
      }
      // Refresh recipes list
      fetchRecipes();
      return res.data;
    } catch (err) {
      console.error('Failed to submit rating:', err.message);
      throw err;
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (recipeId) => {
    if (!user || user.role === 'guest') {
      alert('Please sign in to save recipes to your favorites!');
      return;
    }

    try {
      const res = await axios.post(`/api/recipes/${recipeId}/favorite`);
      // Update favorites array in user context
      if (res.data) {
        user.favorites = res.data.favorites;
      }
      return res.data;
    } catch (err) {
      console.error('Failed to toggle favorite:', err.message);
    }
  };

  // Fetch Collections
  const fetchCollections = async () => {
    if (!user || user.role === 'guest') return;
    setCollectionsLoading(true);
    try {
      const res = await axios.get('/api/collections');
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to fetch collections:', err.message);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // Create custom folder/collection
  const createCollection = async (name, description) => {
    try {
      const res = await axios.post('/api/collections', { name, description });
      setCollections(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to create collection:', err.message);
      throw err;
    }
  };

  // Toggle Recipe binding in folder/collection
  const toggleRecipeInCollection = async (collectionId, recipeId) => {
    try {
      const res = await axios.post(`/api/collections/${collectionId}/toggle`, { recipeId });
      setCollections(prev => prev.map(c => c._id === collectionId ? res.data : c));
      return res.data;
    } catch (err) {
      console.error('Failed to add recipe to collection:', err.message);
    }
  };

  // Delete collection
  const deleteCollection = async (collectionId) => {
    try {
      await axios.delete(`/api/collections/${collectionId}`);
      setCollections(prev => prev.filter(c => c._id !== collectionId));
    } catch (err) {
      console.error('Failed to delete collection:', err.message);
    }
  };

  // Fetch initial recipes on mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Fetch collections when user logs in
  useEffect(() => {
    if (user && user.role !== 'guest') {
      fetchCollections();
    } else {
      setCollections([]);
    }
  }, [user]);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        loading,
        recipeDetails,
        detailsLoading,
        collections,
        collectionsLoading,
        searchParams,
        setSearchParams,
        fetchRecipes,
        fetchRecipeById,
        submitReview,
        toggleFavorite,
        fetchCollections,
        createCollection,
        toggleRecipeInCollection,
        deleteCollection
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};
