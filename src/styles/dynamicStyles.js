import { StyleSheet, Platform } from 'react-native';
// Import base constants and themes
import { Spacing, Typography, scale, lightColors, darkColors } from './themes';
// Import StatusBar height helper if needed (used in original header style)
import { StatusBar } from 'expo-status-bar';

// ---------------------- Dynamic Styles Function ----------------------
export const getStyles = (theme) =>
  StyleSheet.create({
    // --- General Layout ---
    safeArea: {
      flex: 1, // Use 1 to take full height (Changed from original flex: 2)
      backgroundColor: theme.background,
      // paddingTop is now handled within Header component using useSafeAreaInsets for accuracy
    },
    scrollView: { // Style for the ScrollView component itself
      flex: 1,
      width: '100%',
    },
    scrollContainer: { // Style for the content *inside* the ScrollView
      padding: Spacing.medium, // Unified padding (updated from original Spacing.large)
      alignItems: 'center',
      paddingBottom: Spacing.large * 2, // Ensure space at the bottom (updated)
    },
    homeContainer: { // Specific content container style for HomeScreen
      flex: 1, // Make it take available space (updated)
      padding: Spacing.large,
      alignItems: 'center',
      justifyContent: 'center', // Center content vertically (updated)
      width: '100%', // Ensure it takes full width (updated)
       // marginTop: 100 * scale, // Removed marginTop from original as flex:1 handles positioning
    },

    // --- Original Header Styles (Restored) ---
    headerContainer: {
      width: '100%',
      // paddingTop calculation is now handled dynamically within Header.js using insets
      // But keep original base padding values if needed for calculation there
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || Spacing.medium) + Spacing.medium : Spacing.medium,
      paddingBottom: Spacing.medium,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 0, // Original had 0
      borderBottomColor: theme.borderColor, // Original used theme.borderColor
      // backgroundColor is handled by LinearGradient in Header.js
      borderBottomLeftRadius: 60 * scale, // Original radius
      borderBottomRightRadius: 60 * scale, // Original radius
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 * scale }, // Original shadow
      shadowOpacity: 0.4, // Original shadow
      shadowRadius: 4 * scale, // Original shadow
      elevation: 6, // Original elevation
    },
    appName: {
      fontSize: Typography.headerFontSize * scale,
      fontWeight: 'bold',
      color: theme.buttonText, // Original used theme.buttonText
      textShadowColor: 'hsla(272, 100.00%, 8.00%, 0.70)', // Original shadow
      textShadowOffset: { width: 3.5 * scale, height: 2 * scale }, // Original shadow
      textShadowRadius: 3 * scale, // Original shadow
      textAlign: 'center',
    },
    updateText: {
      fontSize: Typography.updateFontSize * scale,
      color: theme.dateTimeText,
      marginTop: Spacing.small,
    },
    tagline: {
      fontSize: Typography.taglineFontSize * scale,
      color: theme.dateTimeText,
      fontStyle: 'italic',
      marginTop: Spacing.small,
    },
    settingsIcon: {
      position: 'absolute',
      right: Spacing.medium, // Original spacing
      // top calculation is now handled dynamically within Header.js using insets
      top: Spacing.medium, // Original base top spacing value
      padding: Spacing.small, // Original padding
    },
    settingsIconText: { // Used for the emoji icon in the original header
      fontSize: 26 * scale, // Original size
      color: theme.buttonText, // Original color
    },
    // --- End Original Header Styles ---

    // --- Updated Component Styles ---
    // Note: GradientButton styles are now defined within GradientButton.js
    // Note: SettingsPanel styles are now defined within SettingsPanel.js
    // Note: Ticker styles are now defined within Ticker.js (Header.js in this case)

    sectionHeader: { // Style for section titles (e.g., "ارزها 💵")
      backgroundColor: theme.buttonBackground, // Use theme button background (updated)
      borderRadius: 15 * scale, // Softer radius (updated)
      paddingVertical: Spacing.small, // Updated padding
      paddingHorizontal: Spacing.medium, // Updated padding
      marginVertical: Spacing.medium, // Updated margin
      width: '100%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 * scale }, // Subtle shadow (updated)
      shadowOpacity: 0.2, // Subtle shadow (updated)
      shadowRadius: 2 * scale, // Subtle shadow (updated)
      elevation: 3, // Updated elevation
    },
    sectionHeaderText: {
      fontSize: Typography.sectionHeaderFontSize * scale * 0.9, // Slightly smaller (updated)
      fontWeight: '600', // Medium weight (updated)
      color: theme.buttonText,
    },
    sectionContent: { // Container for content below a section header
      width: '100%',
      marginBottom: Spacing.large,
    },
    card: { // Style for displaying individual price items
      backgroundColor: theme.cardBackground,
      borderRadius: 15 * scale, // Consistent radius (updated)
      paddingVertical: Spacing.medium, // Updated padding
      paddingHorizontal: Spacing.medium, // Updated padding
      marginVertical: Spacing.small,
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 * scale }, // Subtle shadow (updated)
      shadowOpacity: 0.1, // Subtle shadow (updated)
      shadowRadius: 4 * scale, // Subtle shadow (updated)
      elevation: 3, // Updated elevation
      flexDirection: 'row', // Layout for icon and text (updated)
      justifyContent: 'space-between', // Space out elements (updated)
      alignItems: 'center', // Align items vertically (updated)
    },
    cardContent: { // Wrapper for text elements in the card (updated)
        flex: 1, // Take available space
        // Adjust text alignment within the content area if needed
        // alignItems: 'center', // Original centered text, maybe change to flex-start?
        flexDirection: 'row', // Align label and value horizontally
        justifyContent: 'center', // Center label/value pair
        alignItems: 'baseline', // Align text baselines
    },
    cardText: { // Style for the main value text (e.g., price)
      fontSize: Typography.cardFontSize * scale,
      color: theme.text, // Use general theme text color (updated)
      fontWeight: '500', // Updated weight
      textAlign: 'right', // Align value to the right
      flexShrink: 1, // Allow text to shrink if needed
      marginHorizontal: Spacing.small, // Add some space around value
    },
    cardLabel: { // Style for the label part (e.g., "دلار آمریکا:")
        fontSize: Typography.cardFontSize * scale * 0.9, // Slightly smaller (updated)
        color: theme.placeholderText, // Dimmed color (updated)
        fontWeight: '400', // Normal weight
        textAlign: 'left', // Align label to the left
    },
    cardActions: { // Container for action icons (like share) (updated)
        // Removed marginLeft, padding handled by cardIcon
    },
    cardIcon: { // Style added for icons within cards (updated)
        padding: Spacing.small,
    },
    input: { // Style for TextInput in ConversionScreen
      backgroundColor: theme.inputBackground, // Use theme input background (updated)
      borderRadius: 10 * scale, // Smaller radius (updated)
      padding: Spacing.medium, // Updated padding
      marginVertical: Spacing.small,
      width: '100%',
      textAlign: 'center',
      fontSize: Typography.inputFontSize * scale,
      color: theme.text,
      borderWidth: 1, // Added border (updated)
      borderColor: theme.borderColor, // Added border (updated)
    },
    pickerContainer: { // Container for Picker styling (updated)
      backgroundColor: theme.inputBackground,
      borderRadius: 10 * scale,
      marginVertical: Spacing.small,
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: 'hidden', // Clip picker content
      width: '100%',
    },
    picker: { // Style for the Picker component itself
      width: '100%',
      color: theme.text, // Ensure text color matches theme (critical)
      backgroundColor: 'transparent', // Make background transparent as container handles it
      // height: 55 * scale, // Height might be platform dependent, often better to omit
    },
    pickerItem: { // Style for Picker.Item (mainly for color consistency)
      color: theme.text, // Ensure dropdown item text matches theme
      // backgroundColor might be needed for some platforms/themes
      // backgroundColor: theme.inputBackground,
    },
    footerLink: { // Style for links (e.g., in SettingsPanel)
      fontSize: 16 * scale, // Slightly smaller (updated)
      marginTop: Spacing.large, // Updated spacing
      textAlign: 'center',
      color: theme.linkColor,
      textDecorationLine: 'underline', // Added underline (updated)
    },
    loadingIndicator: { // Style for ActivityIndicator
        marginTop: Spacing.large,
        padding: Spacing.large, // Add padding around indicator
    },
    errorText: { // Style for displaying error messages
        color: theme.rateExchangeText, // Use a distinct error color
        fontSize: Typography.cardFontSize * scale,
        textAlign: 'center',
        marginVertical: Spacing.small,
        paddingHorizontal: Spacing.medium, // Add padding
    },

    // --- Modal Styles (Added) ---
    detailModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'hsla(291, 100.00%, 6.30%, 0.60)', // Semi-transparent background
    },
    detailModalContent: {
      backgroundColor: theme.cardBackground,
      padding: Spacing.large,
      borderRadius: 15 * scale,
      width: '85%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 * scale },
      shadowOpacity: 0.3,
      shadowRadius: 5 * scale,
      elevation: 10,
    },
    detailModalTitle: {
      fontSize: Typography.sectionHeaderFontSize * scale,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: Spacing.medium,
      textAlign: 'center', // Center title
    },
    detailModalText: {
      fontSize: Typography.cardFontSize * scale * 1.1, // Slightly larger for modal
      color: theme.text,
      marginBottom: Spacing.large,
      textAlign: 'center',
    },
    detailModalCloseButton: {
      // Use buttonContainer style or define specific modal button style
       width: '80%', // Example: make close button wider
       marginTop: Spacing.medium,
    },
  });