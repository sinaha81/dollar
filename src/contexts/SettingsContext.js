import React, { useState, useEffect, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../styles/themes'; // Adjust path as needed

// ---------------------- Context تنظیمات ----------------------
export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkColors); // Default to dark theme

  // Load saved theme from AsyncStorage on component mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme !== null) {
          setTheme(savedTheme === 'light' ? lightColors : darkColors);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
        // Keep default theme if loading fails
      }
    };
    loadTheme();
  }, []);

  // Function to toggle theme and save preference
  const toggleTheme = async () => {
    try {
      const newTheme = theme === darkColors ? lightColors : darkColors;
      setTheme(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme === lightColors ? 'light' : 'dark');
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  // Provide theme and toggle function to children components
  return (
    <SettingsContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}; 