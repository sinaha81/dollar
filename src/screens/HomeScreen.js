import React, { useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Share,
  StyleSheet,
  Platform,
} from 'react-native';
import { SettingsContext } from '../contexts/SettingsContext'; // Adjust path
import { getStyles } from '../styles/dynamicStyles'; // Adjust path
import { Header } from '../components/Header'; // Adjust path
import { GradientButton } from '../components/GradientButton'; // Adjust path

// ---------------------- صفحه اصلی ----------------------
export const HomeScreen = ({ navigation, openSettings }) => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);

  const shareApp = () => {
    // Customize the message and URL
    const message = Platform.select({
      ios: "اپلیکیشن قیمت لحظه‌ای دلار و سکه رو ببین! نرخ‌های به‌روز و نمودارها:", // iOS specific message
      android: "اپلیکیشن قیمت لحظه‌ای دلار و سکه رو ببین! نرخ‌های به‌روز و نمودارها:" // Android specific message
    });
    const url = "https://github.com/sinaha81/dollar"; // Replace with actual app store link later
    
    Share.share({
      message: `${message} ${url}`,
      url: url, // URL is mainly used on iOS
      title: "اپلیکیشن قیمت لحظه ای دلار و سکه" // Title is mainly used on Android
    }).catch(error => console.log('Share error:', error));
  };

  return (
    // SafeAreaView provides padding for notches/status bars
    <SafeAreaView style={styles.safeArea}>
      {/* Header receives the function to open the settings panel */}
      <Header onOpenSettings={openSettings} />
      
      {/* Apply styles.scrollView to the ScrollView component */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.homeContainer}
      >
        {/* Navigation Buttons */}
        <GradientButton title="ارزها 💵" onPress={() => navigation.navigate('Currency')} />
        <GradientButton title="تبدیل ارز 💱" onPress={() => navigation.navigate('Conversion')} />
        <GradientButton title="قیمت طلا 🪙" onPress={() => navigation.navigate('Gold')} />
        <GradientButton title="قیمت سکه 💰" onPress={() => navigation.navigate('Coin')} />
        
        {/* Spacer View (Optional) */}
        <View style={{ height: 20 }} /> 

        {/* Share Button */}
        <GradientButton title="اشتراک گذاری اپلیکیشن 🚀" onPress={shareApp} />
      </ScrollView>
    </SafeAreaView>
  );
}; 