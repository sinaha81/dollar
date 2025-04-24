import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  RefreshControl,
  StyleSheet,
  ActivityIndicator, // Added for loading state
  Alert, // Added for error handling
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SettingsContext } from '../contexts/SettingsContext'; // Adjust path
import { getStyles } from '../styles/dynamicStyles'; // Adjust path
import { Header } from '../components/Header'; // Adjust path
import { fetchCurrencyRates } from '../api/fetchData'; // Adjust path
import { darkColors } from '../styles/themes'; // For picker style (can likely be removed if not used elsewhere)

// Define currencies (consider moving to a constants file)
const CURRENCIES = [
  { code: 'usd', title: 'دلار آمریکا', symbol: 'USD' }, // Use standard codes
  { code: 'eur', title: 'یورو', symbol: 'EUR' },
  { code: 'gbp', title: 'پوند بریتانیا', symbol: 'GBP' },
  { code: 'aed', title: 'درهم امارات', symbol: 'AED' },
  // Add more currencies as needed
];

// ---------------------- صفحه تبدیل ارز ----------------------
export const ConversionScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [exchangeRates, setExchangeRates] = useState({}); // Store rates like { USD: 1, EUR: 0.9, ...}
  const [convertAmount, setConvertAmount] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState(CURRENCIES[0].code); // Default to first currency
  const [targetCurrency, setTargetCurrency] = useState(CURRENCIES[1]?.code || CURRENCIES[0].code); // Default to second or first
  const [conversionResult, setConversionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetching logic
  const loadExchangeRates = useCallback(async () => {
    setLoading(true);
    try {
       // IMPORTANT: fetchCurrencyRates needs proper implementation
       // It should return rates relative to a base (e.g., USD)
      const rates = await fetchCurrencyRates();
      if (rates && Object.keys(rates).length > 0) {
        // Filter out potential null rates before setting state
        const validRates = Object.entries(rates).reduce((acc, [key, value]) => {
            if (value !== null && typeof value === 'number') {
                acc[key] = value;
            }
            return acc;
        }, {});

        if (Object.keys(validRates).length > 0) {
             setExchangeRates(validRates);
        } else {
             console.warn("Fetched rates were all null or invalid.");
             throw new Error("Failed to fetch valid rates");
        }

      } else {
         throw new Error("Failed to fetch rates or rates object is empty");
      }
    } catch (error) {
        console.error("Error loading exchange rates:", error);
        Alert.alert("خطا", "دریافت نرخ‌های تبدیل با مشکل مواجه شد.");
        setExchangeRates({}); // Clear rates on error
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadExchangeRates();
  }, [loadExchangeRates]);

  // Calculation logic
  useEffect(() => {
    // Ensure rates are loaded and valid before calculating
    if (convertAmount === '' || isNaN(parseFloat(convertAmount)) || Object.keys(exchangeRates).length === 0 || !exchangeRates[sourceCurrency] || !exchangeRates[targetCurrency]) {
      setConversionResult(null);
      return;
    }

    const amount = parseFloat(convertAmount);
    const sourceRate = exchangeRates[sourceCurrency];
    const targetRate = exchangeRates[targetCurrency];

    // Basic check if rates are valid numbers
    if (typeof sourceRate !== 'number' || typeof targetRate !== 'number' || sourceRate === 0) {
         setConversionResult(null);
         console.warn("Invalid rates for calculation:", sourceCurrency, sourceRate, targetCurrency, targetRate);
         return;
    }


    // Assuming rates are normalized based on USD (e.g., rate for EUR is EUR per 1 USD)
    // Convert source amount to base currency (USD), then to target currency
    const result = (amount / sourceRate) * targetRate;

    // Format with locale string for better readability
    setConversionResult(result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  }, [convertAmount, sourceCurrency, targetCurrency, exchangeRates]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadExchangeRates();
  }, [loadExchangeRates]);

  // Dynamic picker style based on theme
  const pickerStyle = [styles.picker, { color: theme.text }]; // Style for the Picker component itself
  const pickerContainerStyle = styles.pickerContainer; // Style for the View container

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onOpenSettings={() => {}} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.rateExchangeText} colors={[theme.rateExchangeText]} />}
        keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside inputs
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>تبدیل ارز 💱</Text>
        </View>
        <View style={styles.sectionContent}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={theme.rateExchangeText} style={styles.loadingIndicator}/>
          ) : Object.keys(exchangeRates).length === 0 ? (
             <Text style={styles.errorText}>نرخ‌های تبدیل در دسترس نیستند. لطفاً صفحه را رفرش کنید.</Text>
          ) : (
            <>
              <Text style={styles.cardLabel}>مقدار:</Text>
              <TextInput
                style={styles.input}
                placeholder="مقدار برای تبدیل"
                placeholderTextColor={theme.placeholderText}
                keyboardType="numeric"
                value={convertAmount}
                onChangeText={setConvertAmount}
              />

              <Text style={styles.cardLabel}>از ارز:</Text>
              <View style={pickerContainerStyle}>
                 <Picker
                  selectedValue={sourceCurrency}
                  style={pickerStyle} // Apply style to Picker itself
                  onValueChange={(itemValue) => setSourceCurrency(itemValue)}
                  dropdownIconColor={theme.icon} // Style dropdown icon
                 >
                  {/* Use only currencies for which we have valid rates */}
                  {CURRENCIES.filter(c => exchangeRates[c.code]).map(({ code, title }) => (
                    // Add color prop directly to Picker.Item
                    <Picker.Item key={code} label={`${title} (${code.toUpperCase()})`} value={code} color={theme.text} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.cardLabel}>به ارز:</Text>
              <View style={pickerContainerStyle}>
                <Picker
                  selectedValue={targetCurrency}
                  style={pickerStyle} // Apply style to Picker itself
                  onValueChange={(itemValue) => setTargetCurrency(itemValue)}
                  dropdownIconColor={theme.icon} // Style dropdown icon
                >
                   {/* Use only currencies for which we have valid rates */}
                  {CURRENCIES.filter(c => exchangeRates[c.code]).map(({ code, title }) => (
                     // Add color prop directly to Picker.Item
                     <Picker.Item key={code} label={`${title} (${code.toUpperCase()})`} value={code} color={theme.text} />
                  ))}
                </Picker>
              </View>

              {conversionResult !== null && (
                <View style={styles.card}>
                  {/* Display result with target currency symbol */}
                  <Text style={styles.cardText}>
                    نتیجه: {conversionResult} {targetCurrency.toUpperCase()}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};