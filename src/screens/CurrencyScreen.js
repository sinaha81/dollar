import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator, // Make sure ActivityIndicator is imported
  RefreshControl,
  Share,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { SettingsContext } from '../contexts/SettingsContext'; // Adjust path
import { getStyles } from '../styles/dynamicStyles'; // Adjust path
import { Header } from '../components/Header'; // Adjust path
import { fetchCurrencyPrices } from '../api/fetchData'; // Adjust path
import { formatPrice } from '../utils/helpers'; // Adjust path
import { GradientButton } from '../components/GradientButton'; // Import GradientButton
// import LottieView from 'lottie-react-native'; // Lottie is currently commented out
import { Ionicons } from '@expo/vector-icons'; // Import icons
import { scale } from '../styles/themes'; // Import scale if needed

// Define structure/keys expected from fetchCurrencyPrices
// Ensure these keys EXACTLY match the keys returned by fetchCurrencyPrices
const CURRENCY_ASSETS = [
    { key: 'usd', title: 'دلار آمریکا', unit: 'تومان' }, // Corrected key
    { key: 'eur', title: 'یورو', unit: 'تومان' },         // Corrected key
    { key: 'gbp', title: 'پوند', unit: 'تومان' },
    { key: 'aed', title: 'درهم', unit: 'تومان' },
    // Add other keys returned by fetchCurrencyPrices if needed
];

// ---------------------- صفحه ارزها ----------------------
export const CurrencyScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [currencyData, setCurrencyData] = useState([]); // Structure: [{ label: string, value: string | number, unit: string, key: string }]
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Fetching logic
  const loadCurrencyData = useCallback(async () => {
    if (!refreshing) setLoading(true); // Show loader only on initial load, not refresh
    try {
      // fetchCurrencyPrices should return an object like { usd: 123, eur: 456 }
      const fetchedPrices = await fetchCurrencyPrices();

      // Map fetched prices to the display structure
      const formattedData = CURRENCY_ASSETS.map(asset => {
          const price = fetchedPrices[asset.key]; // Use the corrected key
          const formatted = formatPrice(price); // Format the price
          return {
              label: asset.title,
              // Use a clear indicator for error/null values
              value: (formatted === "erorr" || formatted === null || typeof price !== 'number') ? "خطا در دریافت" : formatted,
              unit: asset.unit,
              key: asset.key,
          };
      });

      setCurrencyData(formattedData);
    } catch (error) {
        console.error("Error loading currency data:", error);
        Alert.alert("خطا", "دریافت قیمت ارزها با مشکل مواجه شد.");
        // Show error state in UI
        setCurrencyData(CURRENCY_ASSETS.map(a => ({ label: a.title, value: "خطا", unit: a.unit, key: a.key })));
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  }, [refreshing]); // Add refreshing as dependency if needed

  useEffect(() => {
    loadCurrencyData();
  }, [loadCurrencyData]); // Run once on mount

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // loadCurrencyData will be triggered because 'refreshing' state changes its dependency
  }, []); // No need for loadCurrencyData dependency here if it depends on refreshing

  // Actions
  const handleShare = (item) => {
      // Don't share if value is error
    if (String(item.value).includes("خطا")) {
        Alert.alert("اشتراک گذاری", "قیمت معتبر نیست.");
        return;
    }
    const message = `${item.label}: ${item.value} ${item.unit}`;
    Share.share({ message });
  };

  const showDetail = (item) => {
      setSelectedDetail(item);
      setIsDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedDetail(null);
  };

  // Render Item Card with Icon
  const renderCurrencyCard = (item, index) => (
    <TouchableOpacity
      key={item.key || index}
      style={styles.card}
      onPress={() => showDetail(item)}
      accessibilityLabel={`${item.label} ${item.value} ${item.unit}`}
    >
        <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>{item.label}:</Text>
            {/* Apply error style if value contains error text */}
            <Text style={[styles.cardText, String(item.value).includes("خطا") && styles.errorText]}>
                {item.value}
            </Text>
            <Text style={styles.cardLabel}>{item.unit}</Text>
        </View>
        <TouchableOpacity
            onPress={() => handleShare(item)}
            style={styles.cardActions}
            disabled={String(item.value).includes("خطا")} // Disable share if error
            >
            <Ionicons
                name="share-social-outline"
                size={24 * scale}
                color={String(item.value).includes("خطا") ? theme.placeholderText : theme.icon} // Dim icon if disabled
                style={styles.cardIcon}
                />
        </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onOpenSettings={() => {}} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.rateExchangeText} // iOS spinner color
            colors={[theme.rateExchangeText]} // Android spinner color
          />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>ارزها 💵</Text>
        </View>
        <View style={styles.sectionContent}>
          {loading ? ( // Show loader only on initial load
            // Use ActivityIndicator instead of Lottie for now
            <ActivityIndicator size="large" color={theme.rateExchangeText} style={styles.loadingIndicator} />
            /* <LottieView
                source={require('../../assets/lottie/loading_animation.json')}
                autoPlay
                loop
                style={{ width: 150, height: 150, alignSelf: 'center' }}
            /> */
          ) : currencyData.length > 0 ? (
            currencyData.map(renderCurrencyCard)
          ) : (
             <Text style={styles.errorText}>اطلاعات ارز برای نمایش وجود ندارد.</Text>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="fade" // Or "slide"
        transparent={true}
        visible={isDetailModalVisible}
        onRequestClose={closeDetailModal} // For Android back button
      >
        <View style={styles.detailModalContainer}>
          <View style={styles.detailModalContent}>
            <Text style={styles.detailModalTitle}>{selectedDetail?.label}</Text>
            {/* Show error message in modal too if needed */}
            <Text style={[styles.detailModalText, String(selectedDetail?.value).includes("خطا") && styles.errorText]}>
                {selectedDetail?.value} { String(selectedDetail?.value).includes("خطا") ? '' : selectedDetail?.unit }
            </Text>
            <GradientButton title="بستن" onPress={closeDetailModal} style={styles.detailModalCloseButton} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};