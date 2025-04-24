import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import { SettingsContext } from '../contexts/SettingsContext'; // Adjust path
import { getStyles } from '../styles/dynamicStyles'; // Adjust path
import { Typography, Spacing } from '../styles/themes'; // Adjust path

const { width } = Dimensions.get('window');

// ---------------------- کامپوننت تکِر (Ticker) با Reanimated ----------------------
export const Ticker = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme); // Get general styles
  const componentStyles = getTickerStyles(theme); // Get ticker-specific styles
  const [textWidth, setTextWidth] = useState(0);

  // Reanimated value for horizontal translation
  const translateX = useSharedValue(width); // Start off-screen right

  // Animation loop
  useEffect(() => {
    if (textWidth === 0) return; // Don't start animation until width is measured
    
    // Calculate the total distance to travel (screen width + text width)
    const totalDistance = width + textWidth;
    // Adjust duration based on distance for consistent speed
    const duration = totalDistance * 20; // Adjust multiplier for speed (lower is faster)

    translateX.value = withRepeat(
      withTiming(-textWidth, { // Move from right edge (width) to left edge (-textWidth)
        duration: duration,
        easing: Easing.linear, // Constant speed
      }),
      -1, // Infinite repeats
      false // Do not reverse
    );
  }, [translateX, textWidth]); // Rerun effect if textWidth changes

  // Animated style for the text
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Measure text width on layout
  const onTextLayout = (event) => {
    if (textWidth === 0) { // Measure only once
        setTextWidth(event.nativeEvent.layout.width);
    }
  };

  const tickerMessage = "با اشتراک گذاری اپلیکیشن به ما کمک کنید 🚀";

  return (
    <View style={componentStyles.tickerContainer}>
      <Animated.Text 
        style={[componentStyles.tickerText, animatedTextStyle]}
        onLayout={onTextLayout}
        numberOfLines={1}
      >
        {tickerMessage}
      </Animated.Text>
    </View>
  );
};

// Local dynamic styles specific to Ticker
const getTickerStyles = (theme) => StyleSheet.create({
    tickerContainer: {
        height: 35, // Adjust height as needed
        backgroundColor: theme.headerBackground, // Match header or use a distinct color
        justifyContent: 'center',
        overflow: 'hidden', // Important to clip the text
        width: '100%',
        marginTop: Spacing.small, // Space from header content
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: theme.borderColor,
    },
    tickerText: {
        fontSize: Typography.taglineFontSize, // Use appropriate font size
        color: theme.dateTimeText,
        position: 'absolute', // Position absolute for translation
        paddingHorizontal: 10, // Padding for start/end
        fontWeight: '500',
        // Ensure the text is wider than the container initially if possible
        // Or measure it dynamically
        width: Platform.OS === 'web' ? 'max-content' : undefined, // Helps with measurement on web
    },
}); 