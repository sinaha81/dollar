import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  Share,
  Switch,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// ---------------------- ابعاد و تایپوگرافی ----------------------
const { width, height } = Dimensions.get('window');
const isTablet = Math.min(width, height) >= 600;
const isTV = Platform.isTV;
const BASE_WIDTH = isTV ? 1200 : isTablet ? 600 : 350;
const scale = width / BASE_WIDTH;
const Spacing = {
  small: 6 * scale,
  medium: 12 * scale,
  large: 24 * scale,
};

const Typography = {
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
const darkColors = {
  gradientStart: '#0f2027',
  gradientEnd: '#203a43',
  background: '#121212',
  headerBackground: '#1c1f33',
  rateExchangeText: '#ff6f61',
  dateTimeText: '#f0f0f0',
  cardBackground: '#07000d',
  borderColor: 'hsla(0, 0.00%, 100.00%, 0.15)',
  buttonBackground: '#2c3e50',
  buttonText: '#FFFF',
  linkColor: '#00ff00',
  settingsPanelBackground: '#07000d',
  settingsPanelText: '#FFD700',
};

const lightColors = {
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
  linkColor: 'ff6f61',
  settingsPanelBackground: '#ffffff',
  settingsPanelText: '#ff6f61',
};

// ---------------------- Context تنظیمات ----------------------
const SettingsContext = createContext();

const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkColors);

  // بارگذاری تم ذخیره‌شده از AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme !== null) {
          setTheme(savedTheme === 'light' ? lightColors : darkColors);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = theme === darkColors ? lightColors : darkColors;
      setTheme(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme === lightColors ? 'light' : 'dark');
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

// ---------------------- استایل‌های داینامیک ----------------------
const getStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 2,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || Spacing.medium : 0,
    },
    headerContainer: {
      width: '100%',
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || Spacing.medium) + Spacing.medium : Spacing.medium,
      paddingBottom: Spacing.medium,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 0,
      borderBottomColor: theme.borderColor,
      backgroundColor: theme.headerBackground,
      borderBottomLeftRadius: 60 * scale,
      borderBottomRightRadius: 60 * scale,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 * scale },
      shadowOpacity: 0.4,
      shadowRadius: 4 * scale,
      elevation: 6,
    },
    appName: {
      fontSize: Typography.headerFontSize * scale,
      fontWeight: 'bold',
      color: theme.buttonText,
      textShadowColor: 'rgba(0,0,0,0.7)',
      textShadowOffset: { width: 3.5 * scale, height: 2 * scale },
      textShadowRadius: 3 * scale,
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
      right: Spacing.medium,
      top: Spacing.medium,
      padding: Spacing.small,
    },
    settingsIconText: {
      fontSize: 26 * scale,
      color: theme.buttonText,
    },
    settingsPanel: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.settingsPanelBackground,
      padding: Spacing.large,
      zIndex: 20,
      borderTopLeftRadius: 20 * scale,
      borderTopRightRadius: 20 * scale,
    },
    closeButtonPanel: {
      alignSelf: 'flex-end',
    },
    closeButtonText: {
      fontSize: 30 * scale,
      color: theme.settingsPanelText,
    },
    settingsContentPanel: {
      marginTop: Spacing.medium,
    },
    settingsTitlePanel: {
      fontSize: Typography.settingsTitleFontSize * scale,
      fontWeight: 'bold',
      color: theme.settingsPanelText,
      marginBottom: Spacing.medium,
      textAlign: 'center',
    },
    settingsItemPanel: {
      fontSize: Typography.settingsItemFontSize * scale,
      color: theme.settingsPanelText,
      marginVertical: Spacing.small,
    },
    settingsControlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: Spacing.small,
    },
    scrollContainer: {
      padding: Spacing.large,
      alignItems: 'center',
      paddingBottom: Spacing.large,
    },
    homeContainer: {
      marginTop: 100 * scale,
      padding: Spacing.large,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContainer: {
      width: '85%',
      marginVertical: Spacing.small,
    },
    buttonWrapper: {
      borderRadius: 25 * scale,
      overflow: 'hidden',
    },
    gradientButton: {
      paddingVertical: 15 * scale,
      paddingHorizontal: 30 * scale,
      borderRadius: 25 * scale,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 3 * scale, height: 4 * scale },
      shadowOpacity: 0.3,
      shadowRadius: 4 * scale,
      elevation: 5,
    },
    navButtonText: {
      fontSize: Typography.navButtonFontSize * scale,
      fontWeight: 'bold',
      color: theme.buttonText,
    },
    sectionHeader: {
      backgroundColor: theme.buttonBackground,
      borderRadius: 25 * scale,
      paddingVertical: 12 * scale,
      paddingHorizontal: 20 * scale,
      marginVertical: Spacing.small,
      width: '100%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 * scale },
      shadowOpacity: 0.3,
      shadowRadius: 3 * scale,
      elevation: 3,
    },
    sectionHeaderText: {
      fontSize: Typography.sectionHeaderFontSize * scale,
      fontWeight: 'bold',
      color: theme.buttonText,
    },
    sectionContent: {
      width: '100%',
      marginBottom: Spacing.large,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 15 * scale,
      paddingVertical: 15 * scale,
      paddingHorizontal: 20 * scale,
      marginVertical: Spacing.small,
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 4 * scale, height: 6 * scale },
      shadowOpacity: 0.3,
      shadowRadius: 5 * scale,
      elevation: 5,
    },
    cardText: {
      fontSize: Typography.cardFontSize * scale,
      textAlign: 'center',
      color: theme === lightColors ? "#000000" : theme.buttonText,
    },
    input: {
      backgroundColor: theme.cardBackground,
      borderRadius: 15 * scale,
      padding: 12 * scale,
      marginVertical: Spacing.small,
      width: '100%',
      textAlign: 'center',
      fontSize: Typography.inputFontSize * scale,
      color: theme.buttonText,
    },
    picker: {
      height: 55 * scale,
      width: '100%',
      backgroundColor: theme.cardBackground,
      borderRadius: 15 * scale,
      marginVertical: Spacing.small,
    },
    footerLink: {
      fontSize: 18 * scale,
      marginTop: Spacing.small,
      textShadowColor: '#000',
      textShadowOffset: { width: 2 * scale, height: 4 * scale },
      textShadowRadius: 3 * scale,
      textAlign: 'center',
      color: theme.linkColor,
    },
  });

// ---------------------- توابع واکشی داده‌ها ----------------------
const chandeUrl = 'https://chande.net';
const tgjuUrl = 'https://www.tgju.org/profile/price_dollar_rl';
const currencies = [
  { code: 'usd', title: 'دلار', unit: 'تومان' },
  { code: 'gbp', title: 'پوند', unit: 'تومان' },
  { code: 'eur', title: 'یورو', unit: 'تومان' },
  { code: 'aed', title: 'درهم', unit: 'تومان' }
];
const additionalAssets = [
  { title: 'طلا 18 عیار', url: 'https://www.tgju.org/profile/geram18', unit: 'تومان' },
  { title: 'انس جهانی طلا', url: 'https://www.tgju.org/profile/ons', unit: 'دلار' },
  { title: 'مثقال طلا', url: 'https://www.tgju.org/profile/mesghal', unit: 'تومان' },
  { title: 'طلای ۲۴ عیار', url: 'https://www.tgju.org/profile/geram24', unit: 'تومان' },
  { title: 'آبشده نقدی', url: 'https://www.tgju.org/profile/gold_futures', unit: 'تومان' },
  { title: 'سکه امامی', url: 'https://www.tgju.org/profile/sekee', unit: 'تومان' },
  { title: 'نیم سکه', url: 'https://www.tgju.org/profile/nim', unit: 'تومان' },
  { title: 'ربع سکه', url: 'https://www.tgju.org/profile/rob', unit: 'تومان' },
  { title: 'سکه گرمی', url: 'https://www.tgju.org/profile/gerami', unit: 'تومان' },
];

const convertToToman = (price) => price / 10;
const formatPrice = (price) =>
  price === "erorr" ? price : Number(price).toLocaleString();

const fetchPriceFromChande = async (currency) => {
  try {
    const response = await fetch(chandeUrl);
    const html = await response.text();
    const regex = new RegExp(`<th.*?>${currency}</th>.*?<td.*?>(.*?)<\\/td>`, 'i');
    const match = html.match(regex);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''));
    } else {
      console.error(`Could not find price for ${currency}`);
      return "erorr";
    }
  } catch (error) {
    console.error(`Error fetching price for ${currency}:`, error);
    return "erorr";
  }
};

const fetchPriceFromTGJU = async () => {
  try {
    const response = await fetch(tgjuUrl);
    const html = await response.text();
    const regex = new RegExp(`<td.*?class="text-left".*?>(.*?)<\\/td>`, 'i');
    const match = html.match(regex);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, '')) / 10;
    } else {
      console.error('Could not find price on TGJU');
      return "erorr";
    }
  } catch (error) {
    console.error('Error fetching price from TGJU:', error);
    return "erorr";
  }
};

const fetchAdditionalPrice = async (url, selector) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const regex = new RegExp(`<td.*?class="text-left".*?>(.*?)<\\/td>`, 'i');
    const match = html.match(regex);
    if (match && match[1]) {
      return parseFloat(match[1].replace(/,/g, ''));
    } else {
      console.error(`Could not find price for ${selector}`);
      return "erorr";
    }
  } catch (error) {
    console.error(`Error fetching price from ${url}:`, error);
    return "erorr";
  }
};

const fetchCurrencyPrices = async () => {
  const promises = currencies.map(async ({ code, title, unit }) => {
    if (code === 'usd') {
      const priceChande = await fetchPriceFromChande('USD');
      const priceTGJU = await fetchPriceFromTGJU();
      return [
        { label: `${title} (نرخ 1): ${formatPrice(priceChande)} ${unit}` },
        { label: `${title} (نرخ 2): ${formatPrice(priceTGJU)} ${unit}` }
      ];
    } else {
      const price = await fetchPriceFromChande(code.toUpperCase());
      return [{ label: `${title}: ${formatPrice(price)} ${unit}` }];
    }
  });
  const results = await Promise.all(promises);
  return results.flat();
};

const fetchCurrencyRates = async () => {
  const promises = currencies.map(async ({ code }) => {
    const price = code === 'usd'
      ? await fetchPriceFromChande('USD')
      : await fetchPriceFromChande(code.toUpperCase());
    return { code, price };
  });
  const results = await Promise.all(promises);
  const rates = {};
  results.forEach(item => {
    rates[item.code] = item.price;
  });
  return rates;
};

const fetchGoldPrices = async () => {
  const goldAssets = additionalAssets.filter(asset => !asset.title.includes("سکه"));
  const promises = goldAssets.map(async (asset) => {
    const price = await fetchAdditionalPrice(asset.url, asset.title);
    let formattedPrice;
    if (asset.title === 'انس جهانی طلا') {
      formattedPrice = new Intl.NumberFormat('en-US').format(price);
    } else if (
      asset.title === 'طلا 18 عیار' ||
      asset.title === 'مثقال طلا' ||
      asset.title === 'طلای ۲۴ عیار' ||
      asset.title === 'آبشده نقدی'
    ) {
      formattedPrice = new Intl.NumberFormat('en-US').format(convertToToman(price));
    } else {
      formattedPrice = price.toLocaleString();
    }
    return { label: `${asset.title}: ${formattedPrice} ${asset.unit}` };
  });
  return await Promise.all(promises);
};

const fetchCoinPrices = async () => {
  const coinAssets = additionalAssets.filter(asset => asset.title.includes("سکه"));
  const promises = coinAssets.map(async (asset) => {
    const price = await fetchAdditionalPrice(asset.url, asset.title);
    let formattedPrice = new Intl.NumberFormat('en-US').format(convertToToman(price));
    return { label: `${asset.title}: ${formattedPrice} ${asset.unit}` };
  });
  return await Promise.all(promises);
};

// ---------------------- دکمه گرادیانی ----------------------
const GradientButton = ({ onPress, title }) => {
  const { theme } = useContext(SettingsContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const styles = getStyles(theme);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={onPress} style={styles.buttonWrapper} accessible accessibilityLabel={title}>
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}>
          <Text style={styles.navButtonText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ---------------------- پنل تنظیمات پیشرفته ----------------------
const SettingsPanel = ({ isVisible, onClose }) => {
  const { theme, toggleTheme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const panelHeight = height * 0.6;
  const translateY = useRef(new Animated.Value(panelHeight)).current;
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : panelHeight,
      useNativeDriver: true,
      damping: 20,
      stiffness: 100,
    }).start();
  }, [isVisible]);
  // آدرس کیف پول دونیت کریپتو قابل انتخاب است.
  const donationAddress =  "0x0a375bfe195477fe005ae49a1464db72b05f5748";
  return (
    <Animated.View style={[styles.settingsPanel, { height: panelHeight, transform: [{ translateY }] }]}>
      <TouchableOpacity style={styles.closeButtonPanel} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.settingsContentPanel}>
        <Text style={styles.settingsTitlePanel}>تنظیمات پیشرفته</Text>
        <View style={styles.settingsControlRow}>
          <Text style={styles.settingsItemPanel}>: تغییر تم </Text>
          <Switch 
            value={theme === lightColors} 
            onValueChange={toggleTheme} 
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={theme === lightColors ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        <View style={styles.settingsControlRow}>
          <Text style={styles.settingsItemPanel}>: دونیت کریپتو</Text>
        </View>
        <View style={styles.settingsControlRow}>
          <Text selectable style={[styles.settingsItemPanel, { fontSize: Typography.settingsItemFontSize * scale * 0.7 }]}>
            {donationAddress}
          </Text>
        </View>
        <TouchableOpacity style={[styles.buttonWrapper, { marginTop: Spacing.large }]} onPress={() => Linking.openURL("https://github.com/sinaha81/dollar")}>
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Text style={styles.navButtonText}>امتیازدهی به اپ</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonWrapper, { marginTop: Spacing.large }]} onPress={() => Linking.openURL("https://github.com/sinaha81/dollar/issues")}>
          <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Text style={styles.navButtonText}>بازخورد</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

// ---------------------- هدر مدرن با انیمیشن و تکِر ----------------------
const Header = ({ onOpenSettings }) => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [lastUpdate, setLastUpdate] = useState({ date: '', time: '' });
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  useEffect(() => {
    Animated.timing(taglineFade, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
  }, []);
  const updateLastUpdate = () => {
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      calendar: 'persian',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(new Date());
    let time = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date());
    time = time.replace('ق.ظ', 'صبح').replace('ب.ظ', 'عصر');
    setLastUpdate({ date: persianDate, time });
  };
  useEffect(() => {
    updateLastUpdate();
    const interval = setInterval(updateLastUpdate, 30000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY: headerAnim }] }}>
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: Spacing.small }}>
          <Text style={{ fontSize: Typography.headerFontSize * scale * 0.8, color: '#fc0303' }}>💀 Sina 💀</Text>
        </Animated.View>
        <Text style={styles.appName}>{`💵   Chand   💵`}</Text>
        <Text style={styles.updateText}>{`${lastUpdate.date}  ${lastUpdate.time}`}</Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
        </Animated.Text>
        <Ticker />
        <TouchableOpacity style={styles.settingsIcon} onPress={onOpenSettings}>
          <Text style={styles.settingsIconText}>⚙️</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// ---------------------- کامپوننت تکِر (Ticker) ----------------------
const Ticker = () => {
  const { theme } = useContext(SettingsContext);
  const scrollAnim = useRef(new Animated.Value(width)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -width,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateX: scrollAnim }], marginTop: Spacing.small }}>
      <Text style={{ color: theme.buttonText, fontSize: Typography.taglineFontSize * scale }}>
        با اشتراک گذاری اپلیکیشن به ما کمک کنید 
      </Text>
    </Animated.View>
  );
};

// ---------------------- صفحه اصلی ----------------------
const HomeScreen = ({ navigation, openSettings }) => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const shareApp = () => {
    Share.share({ message: "اپلیکیشن Rate Exchange  \n  بهترین اپ برای فهمیدن قیمت دلار , طلا و ...      \n      https://github.com/sinaha81/dollar" });
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header onOpenSettings={openSettings} />
      <ScrollView contentContainerStyle={styles.homeContainer}>
        <GradientButton title="ارزها 💵" onPress={() => navigation.navigate('Currency')} />
        <GradientButton title="تبدیل ارز 💱" onPress={() => navigation.navigate('Conversion')} />
        <GradientButton title="قیمت طلا 🪙" onPress={() => navigation.navigate('Gold')} />
        <GradientButton title="قیمت سکه 💰" onPress={() => navigation.navigate('Coin')} />
        <GradientButton title="اشتراک گذاری اپلیکیشن" onPress={shareApp} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------- صفحه ارزها ----------------------
const CurrencyScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [currencyData, setCurrencyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadCurrencyData = async () => {
    setLoading(true);
    const data = await fetchCurrencyPrices();
    setCurrencyData(data);
    setLoading(false);
  };
  useEffect(() => {
    loadCurrencyData();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCurrencyData();
    setRefreshing(false);
  };
  const handleShare = (message) => {
    Share.share({ message });
  };
  const showDetail = (label) => {
    Alert.alert("جزئیات", label);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>ارزها 💵</Text>
        </TouchableOpacity>
        <View style={styles.sectionContent}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.rateExchangeText} />
          ) : (
            currencyData.map((item, index) => (
              <TouchableOpacity key={index} style={styles.card} onPress={() => showDetail(item.label)} onLongPress={() => handleShare(item.label)}>
                <Text style={styles.cardText}>{item.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------- صفحه تبدیل ارز ----------------------
const ConversionScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [exchangeRates, setExchangeRates] = useState({});
  const [convertAmount, setConvertAmount] = useState('');
  const [convertSource, setConvertSource] = useState('usd');
  const [convertTarget, setConvertTarget] = useState('usd');
  const [conversionResult, setConversionResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadExchangeRates = async () => {
    const rates = await fetchCurrencyRates();
    setExchangeRates(rates);
  };
  useEffect(() => {
    loadExchangeRates();
  }, []);
  useEffect(() => {
    if (convertAmount !== '' && exchangeRates[convertSource] && exchangeRates[convertTarget]) {
      const amount = parseFloat(convertAmount);
      if (!isNaN(amount)) {
        const result = (amount * exchangeRates[convertSource]) / exchangeRates[convertTarget];
        setConversionResult(result.toLocaleString());
      } else {
        setConversionResult(null);
      }
    } else {
      setConversionResult(null);
    }
  }, [convertAmount, convertSource, convertTarget, exchangeRates]);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadExchangeRates();
    setRefreshing(false);
  };
  const selectedPickerStyle = { ...styles.picker, color: theme === darkColors ? "#FFFFFF" : "#000000" };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>تبدیل ارز 💱</Text>
        </TouchableOpacity>
        <View style={styles.sectionContent}>
          <Text style={styles.cardText}>مقدار:</Text>
          <TextInput
            style={styles.input}
            placeholder="مقدار را وارد کنید"
            placeholderTextColor="#BBBBBB"
            keyboardType="numeric"
            value={convertAmount}
            onChangeText={setConvertAmount}
          />
          <Text style={styles.cardText}>انتخاب ارز مبدا:</Text>
          <Picker
            selectedValue={convertSource}
            style={selectedPickerStyle}
            onValueChange={(itemValue) => setConvertSource(itemValue)}
            itemStyle={{ color: "#000000" }}>
            {currencies.map(({ code, title }) => (
              <Picker.Item key={code} label={title} value={code} color="#000000" />
            ))}
          </Picker>
          <Text style={styles.cardText}>انتخاب ارز مقصد:</Text>
          <Picker
            selectedValue={convertTarget}
            style={selectedPickerStyle}
            onValueChange={(itemValue) => setConvertTarget(itemValue)}
            itemStyle={{ color: "#000000" }}>
            {currencies.map(({ code, title }) => (
              <Picker.Item key={code} label={title} value={code} color="#000000" />
            ))}
          </Picker>
          {conversionResult !== null && (
            <Text style={styles.cardText}>نتیجه: {conversionResult}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------- صفحه قیمت طلا ----------------------
const GoldScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [goldData, setGoldData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadGoldData = async () => {
    setLoading(true);
    const data = await fetchGoldPrices();
    setGoldData(data);
    setLoading(false);
  };
  useEffect(() => {
    loadGoldData();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoldData();
    setRefreshing(false);
  };
  const handleShare = (message) => {
    Share.share({ message });
  };
  const showDetail = (label) => {
    Alert.alert("جزئیات", label);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>قیمت طلا 🪙</Text>
        </TouchableOpacity>
        <View style={styles.sectionContent}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.rateExchangeText} />
          ) : (
            goldData.map((item, index) => (
              <TouchableOpacity key={index} style={styles.card} onPress={() => showDetail(item.label)} onLongPress={() => handleShare(item.label)}>
                <Text style={styles.cardText}>{item.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------- صفحه قیمت سکه ----------------------
const CoinScreen = () => {
  const { theme } = useContext(SettingsContext);
  const styles = getStyles(theme);
  const [coinData, setCoinData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadCoinData = async () => {
    setLoading(true);
    const data = await fetchCoinPrices();
    setCoinData(data);
    setLoading(false);
  };
  useEffect(() => {
    loadCoinData();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCoinData();
    setRefreshing(false);
  };
  const handleShare = (message) => {
    Share.share({ message });
  };
  const showDetail = (label) => {
    Alert.alert("جزئیات", label);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>قیمت سکه 💰</Text>
        </TouchableOpacity>
        <View style={styles.sectionContent}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.rateExchangeText} />
          ) : (
            coinData.map((item, index) => (
              <TouchableOpacity key={index} style={styles.card} onPress={() => showDetail(item.label)} onLongPress={() => handleShare(item.label)}>
                <Text style={styles.cardText}>{item.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------- ناوبری ----------------------
const Stack = createStackNavigator();

const App = () => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const toggleSettings = () => setIsSettingsVisible(!isSettingsVisible);
  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // انیمیشن انتقال افقی بین صفحات
          }}>
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} openSettings={toggleSettings} />}
          </Stack.Screen>
          <Stack.Screen name="Currency" component={CurrencyScreen} />
          <Stack.Screen name="Conversion" component={ConversionScreen} />
          <Stack.Screen name="Gold" component={GoldScreen} />
          <Stack.Screen name="Coin" component={CoinScreen} />
        </Stack.Navigator>
        {isSettingsVisible && <SettingsPanel isVisible={isSettingsVisible} onClose={toggleSettings} />}
      </NavigationContainer>
    </SettingsProvider>
  );
};

export default App;
