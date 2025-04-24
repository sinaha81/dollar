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
import { fetchGoldPrices } from '../api/fetchData'; // Adjust path
import { formatPrice, convertToToman } from '../utils/helpers'; // Adjust path
import { GradientButton } from '../components/GradientButton'; // Import GradientButton
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../styles/themes';
// import LottieView from 'lottie-react-native'; // Comment out Lottie

// Define structure/keys expected from fetchGoldPrices
const GOLD_ASSETS = [
    { key: 'geram18', title: 'طلا 18 عیار', unit: 'تومان' },
    // { key: 'ons', title: 'انس جهانی طلا', unit: 'دلار' }, // Requires different formatting
    { key: 'mithqal', title: 'مثقال طلا', unit: 'تومان' },
    { key: 'geram24', title: 'طلای ۲۴ عیار', unit: 'تومان' },
    // { key: 'abshode', title: 'آبشده نقدی', unit: 'تومان' }, // Need key from API
];

// ---------------------- صفحه قیمت طلا ----------------------
export const GoldScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [goldData, setGoldData] = useState([]); // Structure: [{ label: string, value: string | number, unit: string, key: string }]
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Fetching logic
  const loadGoldData = useCallback(async () => {
    setLoading(true);
    try {
      // IMPORTANT: fetchGoldPrices needs correct implementation
      const fetchedPrices = await fetchGoldPrices(); // Returns object like { geram18: 123, mithqal: 456 }

      // Map fetched prices to the display structure
       const formattedData = GOLD_ASSETS.map(asset => {
          const price = fetchedPrices[asset.key];
          let formatted;
          // Handle different units/formatting if needed (e.g., for ONS)
          // if (asset.key === 'ons') { formatted = formatPrice(price); }
          // else {
          // Assuming prices are in Rial and need conversion to Toman
             const priceInToman = convertToToman(price); 
             formatted = formatPrice(priceInToman); 
          // }
          
          return {
              label: asset.title,
              value: formatted === "erorr" || formatted === null ? "خطا" : formatted,
              unit: asset.unit,
              key: asset.key,
          };
      });

      setGoldData(formattedData);
    } catch (error) {
      console.error("Error loading gold data:", error);
      Alert.alert("خطا", "دریافت قیمت طلا با مشکل مواجه شد.");
      setGoldData(GOLD_ASSETS.map(a => ({ label: a.title, value: "خطا", unit: a.unit, key: a.key })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGoldData();
  }, [loadGoldData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoldData();
  }, [loadGoldData]);

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

  // Render Item Card
  const renderGoldCard = (item, index) => (
    <TouchableOpacity
      key={item.key || index} // Use unique key
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
           {/* <Icon name="share-social-outline" size={24} color={theme.icon} /> */}
           <Text style={{color: theme.icon, fontSize: 24}}>🔗</Text> 
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
          <Text style={styles.sectionHeaderText}>قیمت طلا 🪙</Text>
        </View>
        <View style={styles.sectionContent}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={theme.rateExchangeText} style={styles.loadingIndicator} />
            /* <LottieView 
                source={require('../../assets/lottie/loading_animation.json')}
                autoPlay 
                loop 
                style={{ width: 150, height: 150, alignSelf: 'center' }} 
            /> */
          ) : goldData.length > 0 ? (
            goldData.map(renderGoldCard)
          ) : (
            <Text style={styles.errorText}>اطلاعات طلا برای نمایش وجود ندارد.</Text>
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