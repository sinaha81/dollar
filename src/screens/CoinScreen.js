import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert,
  StyleSheet,
  Modal, // Import Modal
} from 'react-native';
import { SettingsContext } from '../contexts/SettingsContext'; // Adjust path
import { getStyles } from '../styles/dynamicStyles'; // Adjust path
import { Header } from '../components/Header'; // Adjust path
import { fetchCoinPrices } from '../api/fetchData'; // Adjust path
import { formatPrice } from '../utils/helpers'; // Adjust path
import { GradientButton } from '../components/GradientButton'; // Import GradientButton
// import LottieView from 'lottie-react-native'; // Comment out Lottie
import { Ionicons } from '@expo/vector-icons'; // Import icons
import { scale } from '../styles/themes'; // Import scale if needed
// import Icon from 'react-native-vector-icons/Ionicons';

// Define structure/keys expected from fetchCoinPrices
const COIN_ASSETS = [
    { key: 'emami', title: 'سکه امامی', unit: 'تومان' },
    { key: 'baharAzadi', title: 'سکه بهار آزادی', unit: 'تومان' },
    { key: 'nim', title: 'نیم سکه', unit: 'تومان' },
    { key: 'rob', title: 'ربع سکه', unit: 'تومان' },
    // Add other keys if needed (e.g., gerami)
    // { key: 'gerami', title: 'سکه گرمی', unit: 'تومان' }, 
];

// ---------------------- صفحه قیمت سکه ----------------------
export const CoinScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [coinData, setCoinData] = useState([]); // Structure: [{ label: string, value: string | number, unit: string, key: string }]
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Fetching logic
  const loadCoinData = useCallback(async () => {
    setLoading(true);
    try {
      // IMPORTANT: fetchCoinPrices needs correct implementation
      const fetchedPrices = await fetchCoinPrices(); // Returns object like { emami: 123, baharAzadi: 456 }
      
      // Map fetched prices to the display structure
       const formattedData = COIN_ASSETS.map(asset => {
          const price = fetchedPrices[asset.key];
          const formatted = formatPrice(price); // Use formatPrice
          // Note: formatPrice might need adjustments for Toman/Dollar based on unit
          return {
              label: asset.title,
              value: formatted === "erorr" || formatted === null ? "خطا" : formatted,
              unit: asset.unit,
              key: asset.key,
          };
      });

      setCoinData(formattedData);
    } catch (error) {
      console.error("Error loading coin data:", error);
      Alert.alert("خطا", "دریافت قیمت سکه با مشکل مواجه شد.");
      setCoinData(COIN_ASSETS.map(a => ({ label: a.title, value: "خطا", unit: a.unit, key: a.key })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCoinData();
  }, [loadCoinData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCoinData();
  }, [loadCoinData]);

  // Actions
  const handleShare = (item) => {
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
  const renderCoinCard = (item, index) => (
    <TouchableOpacity
      key={item.key || index}
      style={styles.card}
      onPress={() => showDetail(item)}
      accessibilityLabel={`${item.label} ${item.value} ${item.unit}`}
    >
        <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>{item.label}:</Text>
            <Text style={[styles.cardText, item.value === "خطا" && styles.errorText]}>{item.value}</Text>
            <Text style={styles.cardLabel}>{item.unit}</Text>
        </View>
        <TouchableOpacity onPress={() => handleShare(item)} style={styles.cardActions}>
            <Ionicons name="share-social-outline" size={24 * scale} color={theme.icon} style={styles.cardIcon} />
            {/* <Text style={{color: theme.icon, fontSize: 24}}>🔗</Text> */}
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
            tintColor={theme.rateExchangeText}
            colors={[theme.rateExchangeText]}
          />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>قیمت سکه 💰</Text>
        </View>
        <View style={styles.sectionContent}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={theme.rateExchangeText} style={styles.loadingIndicator} />
          ) : coinData.length > 0 ? (
            coinData.map(renderCoinCard)
          ) : (
            <Text style={styles.errorText}>اطلاعات سکه برای نمایش وجود ندارد.</Text>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDetailModalVisible}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.detailModalContainer}>
          <View style={styles.detailModalContent}>
            <Text style={styles.detailModalTitle}>{selectedDetail?.label}</Text>
            <Text style={styles.detailModalText}>
              {selectedDetail?.value} {selectedDetail?.unit}
            </Text>
            <GradientButton title="بستن" onPress={closeDetailModal} style={styles.detailModalCloseButton}/>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}; 