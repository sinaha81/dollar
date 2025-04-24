import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  LinearGradient,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsContext } from '../contexts/SettingsContext';
import { getStyles } from '../styles/dynamicStyles';
import { getPersianDate } from '../utils/helpers';
import { Ticker } from './Ticker';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../styles/themes';

// ---------------------- هدر مدرن با انیمیشن و تکِر ----------------------
export const Header = ({ onOpenSettings }) => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [lastUpdate, setLastUpdate] = useState(getPersianDate());
  const insets = useSafeAreaInsets();

  // Function to update the timestamp
  const updateLastUpdate = () => {
    setLastUpdate(getPersianDate());
  };

  useEffect(() => {
    const interval = setInterval(updateLastUpdate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Apply dynamic padding top based on safe area inset
  const headerStyleWithPadding = {
    ...styles.headerContainer, 
    paddingTop: insets.top + (Platform.OS === 'android' ? styles.headerContainer.paddingTop : 10),
  };

   // Adjust icon top position based on inset
  const settingsIconStyle = {
      ...styles.settingsIcon,
      top: insets.top + (Platform.OS === 'android' ? 10 : 5),
  };

  return (
    <View style={headerStyleWithPadding}>
      <Text style={styles.appName}>What Price?</Text>
      <Text style={styles.tagline}>نرخ لحظه ای ارز، طلا و سکه</Text>
      <Text style={styles.updateText}>آخرین بروزرسانی: {lastUpdate}</Text>

      {/* Settings Icon using Expo Vector Icons */}
      <TouchableOpacity style={settingsIconStyle} onPress={onOpenSettings} accessibilityRole="button" accessibilityLabel="تنظیمات">
         <Ionicons name="settings-outline" size={28 * scale} color={theme.icon} />
      </TouchableOpacity>
      
      <Ticker />

    </View>
  );
}; 