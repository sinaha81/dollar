import React, { useContext, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  // Animated, // Remove old Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SettingsContext } from '../contexts/SettingsContext'; // Adjust path
import { getStyles } from '../styles/dynamicStyles'; // Adjust path
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'; // Import Reanimated
import { scale, Spacing } from '../styles/themes'; // Import scale and Spacing

// Reusable Gradient Button with Reanimated
export const GradientButton = ({ onPress, title, style = {}, textStyle = {} }) => {
  const { theme } = useContext(SettingsContext);
  const componentStyles = getDynamicStyles(theme); // Use local dynamic styles

  // Reanimated values for animation
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    opacityValue.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
  }, [opacityValue]);

  // Press animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withTiming(0.95, { duration: 150 });
  };

  const handlePressOut = () => {
    scaleValue.value = withTiming(1, { duration: 150 });
    if (onPress) {
      onPress(); // Call original onPress
    }
  };

  return (
    <Animated.View style={[componentStyles.buttonContainer, animatedStyle, style]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={componentStyles.buttonWrapper}
        accessible
        accessibilityLabel={title}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]} // Use theme colors
          style={componentStyles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[componentStyles.navButtonText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Local dynamic styles for GradientButton (subset of original styles)
const getDynamicStyles = (theme) => StyleSheet.create({
  buttonContainer: {
    width: '90%',
    marginVertical: Spacing.medium,
  },
  buttonWrapper: {
    borderRadius: 25 * scale,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 * scale }, // Slightly adjusted shadow
    shadowOpacity: 0.25,
    shadowRadius: 4 * scale,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 15 * scale,
    paddingHorizontal: 30 * scale,
    borderRadius: 25 * scale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 20 * scale, // Use Typography.navButtonFontSize if needed
    fontWeight: 'bold',
    color: theme.buttonText, // Use theme button text color
    textAlign: 'center',
  },
}); 