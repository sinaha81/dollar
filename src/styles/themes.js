import { Dimensions, Platform } from 'react-native';

// ---------------------- ابعاد و تایپوگرافی ----------------------
const { width, height } = Dimensions.get('window');
const isTablet = Math.min(width, height) >= 600;
const isTV = Platform.isTV;
const BASE_WIDTH = isTV ? 1200 : isTablet ? 600 : 350;
export const scale = width / BASE_WIDTH;

export const Spacing = {
  small: 6 * scale,
  medium: 12 * scale,
  large: 24 * scale,
};

export const Typography = {
  headerFontSize: 25,
  updateFontSize: 13,
  taglineFontSize: 15,
  settingsTitleFontSize: 26,
  settingsItemFontSize: 20,
  cardFontSize: 18,
  navButtonFontSize: 20,
  sectionHeaderFontSize: 24,
  inputFontSize: 18,
};

// ---------------------- تم‌های اصلی ----------------------
export const darkColors = {
  gradientStart: '#0B132B',  // Dark Navy Blue
  gradientEnd: '#1C2541',    // Dark Slate Blue
  background: '#121212',
  headerBackground: '#1c1f33', // This is less relevant now as gradient is used
  rateExchangeText: '#ff6f61',
  dateTimeText: '#FFD700',
  cardBackground: '#07000d',
  borderColor: 'hsla(0, 0.00%, 100.00%, 0.15)',
  buttonBackground: '#2c3e50',
  buttonText: '#FFFF',
  linkColor: '#00ff00',
  settingsPanelBackground: '#07000d',
  settingsPanelText: '#FFD700',
  text: '#00ff00', // Added general text color for dark theme
  inputBackground: '#2A2D34', // Added specific input background for dark theme
  placeholderText: '#A0A0A0', // Added placeholder text color
  icon: '#fff', // Added icon color
};

export const lightColors = {
  gradientStart: '#ffffff',
  gradientEnd: '#e0e0e0',
  background: '#faeabe',
  headerBackground: '#ffffff',
  rateExchangeText: '#ff6f61',
  dateTimeText: '#000000',
  cardBackground: '#f9f9f9',
  borderColor: 'rgba(0,0,0,0.15)',
  buttonBackground: '#007aff',
  buttonText: '#000000',
  linkColor: '#ff6f61',
  settingsPanelBackground: '#ffffff',
  settingsPanelText: '#ff6f61',
  text: '#000000', // Added general text color for light theme
  inputBackground: '#FFFFFF', // Added specific input background for light theme
  placeholderText: '#A0A0A0', // Added placeholder text color
  icon: '#000000', // Added icon color
}; 