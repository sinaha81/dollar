import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider, SettingsContext } from './src/contexts/SettingsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SettingsPanel } from './src/components/SettingsPanel';
import { getStyles } from './src/styles/dynamicStyles';
import { darkColors } from './src/styles/themes';

// Main App component wrapper to access context for styling SafeAreaView
const AppContent = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const toggleSettings = () => setIsSettingsVisible(!isSettingsVisible);

  return (
    <View style={styles.safeArea}>
      <StatusBar style={theme === darkColors ? 'light' : 'dark'} />
      <NavigationContainer>
        <AppNavigator openSettings={toggleSettings} />
      </NavigationContainer>
      <SettingsPanel isVisible={isSettingsVisible} onClose={toggleSettings} />
    </View>
  );
}

// Root component
const App = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
