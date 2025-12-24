/**
 * Main application state store
 * Manages global app state, UI state, and navigation
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    // UI State
    sidebarOpen: false,
    settingsOpen: false,
    currentView: 'home', // 'home', 'explore', 'visualizer', 'settings'
    loading: false,
    error: null,

    // Selected Data
    selectedBlock: null,
    selectedTransaction: null,
    selectedContract: null,

    // Search
    searchQuery: '',
    searchResults: [],
    searchLoading: false,

    // Notifications
    notifications: [],

    // Actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    
    setSettingsOpen: (open) => set({ settingsOpen: open }),
    
    setCurrentView: (view) => set({ currentView: view }),
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),
    
    clearError: () => set({ error: null }),

    selectBlock: (block) => set({ 
      selectedBlock: block,
      sidebarOpen: true,
      selectedTransaction: null,
      selectedContract: null
    }),

    selectTransaction: (transaction) => set({ 
      selectedTransaction: transaction,
      sidebarOpen: true,
      selectedBlock: null,
      selectedContract: null
    }),

    selectContract: (contract) => set({ 
      selectedContract: contract,
      sidebarOpen: true,
      selectedBlock: null,
      selectedTransaction: null
    }),

    clearSelection: () => set({
      selectedBlock: null,
      selectedTransaction: null,
      selectedContract: null,
      sidebarOpen: false
    }),

    setSearchQuery: (query) => set({ searchQuery: query }),
    
    setSearchResults: (results) => set({ searchResults: results }),
    
    setSearchLoading: (loading) => set({ searchLoading: loading }),

    addNotification: (notification) => {
      const id = Date.now().toString();
      const duration = notification.duration || 5000; // Default 5 seconds
      const newNotification = {
        id,
        timestamp: Date.now(),
        type: 'info',
        ...notification
      };
      
      set(state => ({
        notifications: [...state.notifications, newNotification]
      }));

      // Auto-remove after specified duration
      setTimeout(() => {
        const currentState = get();
        // Check if notification still exists before removing
        if (currentState.notifications.some(n => n.id === id)) {
          currentState.removeNotification(id);
        }
      }, duration);

      return id;
    },

    removeNotification: (id) => set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),

    clearNotifications: () => set({ notifications: [] }),

    // Utility actions
    reset: () => set({
      sidebarOpen: false,
      settingsOpen: false,
      selectedBlock: null,
      selectedTransaction: null,
      selectedContract: null,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      error: null,
      notifications: []
    })
  }))
);