import React, { useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { SettingsContext } from '../contexts/SettingsContext'; // Adjust path
import { getStyles } from '../styles/dynamicStyles'; // Adjust path
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'; // Import Reanimated
import { lightColors, Spacing, Typography, scale } from '../styles/themes'; // Import themes and constants
import { GradientButton } from './GradientButton'; // Import GradientButton

const { height } = Dimensions.get('window');

// ---------------------- پنل تنظیمات پیشرفته با Reanimated ----------------------
export const SettingsPanel = ({ isVisible, onClose }) => {
  const { theme, toggleTheme } = useContext(SettingsContext);
  const componentStyles = getPanelStyles(theme); // Use local dynamic styles for panel
  const panelHeight = height * 0.6;

  // Reanimated value for panel position
  const translateY = useSharedValue(panelHeight); // Start off-screen

  // Animate panel sliding in/out
  useEffect(() => {
    translateY.value = withTiming(isVisible ? 0 : panelHeight, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smoother easing
    });
  }, [isVisible, translateY, panelHeight]);

  // Animated style for the panel
  const animatedPanelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const donationAddress = "0x0a375bfe195477fe005ae49a1464db72b05f5748"; // Consider moving to a config file

  // Prevent touches when hidden (optional but good practice)
  if (!isVisible && translateY.value === panelHeight) {
      // Could also return null, but View ensures layout space isn't affected if needed
      return <View pointerEvents="none" />; 
  }

  return (
    <Animated.View style={[componentStyles.settingsPanel, { height: panelHeight }, animatedPanelStyle]}>
      <TouchableOpacity style={componentStyles.closeButtonPanel} onPress={onClose} accessibilityLabel="Close settings">
        <Text style={componentStyles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={componentStyles.settingsContentPanel}>
        <Text style={componentStyles.settingsTitlePanel}>تنظیمات پیشرفته</Text>

        {/* Theme Toggle Row */}
        <View style={componentStyles.settingsControlRow}>
          <Text style={componentStyles.settingsItemPanel}>تغییر تم</Text>
          <Switch
            value={theme === lightColors} // Check against imported lightColors
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={theme === lightColors ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e" // Style for iOS
          />
        </View>

        {/* Donation Section */}
        <View style={[componentStyles.settingsControlRow, { flexDirection: 'column', alignItems: 'center' }]}>
            <Text style={componentStyles.settingsItemPanel}>دونیت کریپتو (BSC)</Text>
            <Text selectable style={componentStyles.donationAddressText}>
                {donationAddress}
            </Text>
        </View>

        {/* Links using GradientButton */}
        <GradientButton
          title="امتیازدهی / مشاهده کد در گیت‌هاب" 
          onPress={() => Linking.openURL("https://github.com/sinaha81/dollar")} 
          style={{ marginTop: Spacing.large }} // Add margin top
        />
        <GradientButton 
          title="ارسال بازخورد / گزارش مشکل"
          onPress={() => Linking.openURL("https://github.com/sinaha81/dollar/issues")}
        />

      </ScrollView>
    </Animated.View>
  );
};

// Local dynamic styles specific to SettingsPanel
const getPanelStyles = (theme) => StyleSheet.create({
    settingsPanel: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.settingsPanelBackground,
      padding: Spacing.large,
      zIndex: 100, // Ensure it's above other content
      borderTopLeftRadius: 25 * scale,
      borderTopRightRadius: 25 * scale,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 * scale },
      shadowOpacity: 0.2,
      shadowRadius: 5 * scale,
      elevation: 20,
    },
    closeButtonPanel: {
      position: 'absolute', // Position precisely
      top: Spacing.medium,
      left: Spacing.large,
      padding: Spacing.small, // Easier to tap
      zIndex: 101, // Above content
    },
    closeButtonText: {
      fontSize: 30 * scale,
      fontWeight: 'bold',
      color: theme.settingsPanelText,
    },
    settingsContentPanel: {
      paddingTop: Spacing.large, // Add padding top to avoid close button
      alignItems: 'center', // Center content horizontally
    },
    settingsTitlePanel: {
      fontSize: Typography.settingsTitleFontSize * scale,
      fontWeight: 'bold',
      color: theme.settingsPanelText,
      marginBottom: Spacing.large * 1.5,
      textAlign: 'center',
    },
    settingsControlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%', // Take full width
      marginVertical: Spacing.medium,
      paddingHorizontal: Spacing.small, // Add horizontal padding
    },
    settingsItemPanel: {
      fontSize: Typography.settingsItemFontSize * scale,
      color: theme.settingsPanelText,
    },
    donationAddressText: {
        fontSize: Typography.settingsItemFontSize * scale * 0.7,
        color: theme.settingsPanelText,
        marginTop: Spacing.small,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Monospace for address
    }
}); 