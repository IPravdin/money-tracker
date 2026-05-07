"use client";

import { useState, useEffect } from "react";
import { CategoryDefinition } from "@/lib/categories";

const STORAGE_KEY = "money-tracker-custom-categories";

/**
 * Hook for managing custom categories with localStorage persistence
 */
export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState<CategoryDefinition[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load custom categories from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Note: Icons are lost in JSON serialization, they need to be restored
        // For now, we'll store just the data and reconstruct icons when needed
        setCustomCategories(parsed);
      }
    } catch (error) {
      console.error("Failed to load custom categories:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save custom categories to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
      } catch (error) {
        console.error("Failed to save custom categories:", error);
      }
    }
  }, [customCategories, isLoaded]);

  const addCategory = (category: CategoryDefinition) => {
    setCustomCategories((prev) => [...prev, category]);
  };

  const removeCategory = (categoryId: string) => {
    setCustomCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const updateCategory = (categoryId: string, updates: Partial<CategoryDefinition>) => {
    setCustomCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, ...updates } : cat))
    );
  };

  const getCategoryById = (categoryId: string) => {
    return customCategories.find((cat) => cat.id === categoryId);
  };

  const getCategoryByName = (name: string) => {
    return customCategories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );
  };

  return {
    customCategories,
    isLoaded,
    addCategory,
    removeCategory,
    updateCategory,
    getCategoryById,
    getCategoryByName,
  };
}
