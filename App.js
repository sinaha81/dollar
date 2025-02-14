import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  SafeAreaView,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  Share
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
const Colors = {
  background: '#141E30',             
  headerBackground: '#1c1f33',         
  rateExchangeText: '#ff0000',  
  dateTimeText: '#545',      
  cardBackground: '#00162e',           
  borderColor: '#444',                 
  buttonBackground: '#2c3e50',         
  buttonText: '#FFFFFF',               
  linkColor: '#00ff00',                
  settingsPanelBackground: '#000',
  settingsPanelText: '#FFD700',       
};
const Typography = {
  headerFontSize: 30,
  updateFontSize: 16,
  settingsTitleFontSize: 24,
  settingsItemFontSize: 18,
  cardFontSize: 18,
  navButtonFontSize: 20,
  sectionHeaderFontSize: 22,
  inputFontSize: 18,
};
const { width, height } = Dimensions.get('window');
const isTablet = Math.min(width, height) >= 600;
const isTV = Platform.isTV;
const BASE_WIDTH = isTV ? 1200 : isTablet ? 600 : 300;
const scale = width / BASE_WIDTH;
const Spacing = {
  small: 5 * scale,
  medium: 10 * scale,
  large: 20 * scale,
};
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
  { title: 'سکه تمام بهار آزادی', url: 'https://www.tgju.org/profile/sekeb', unit: 'تومان' },
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
const SettingsPanel = ({ isVisible, onClose }) => {
  const panelHeight = height / 2;
  const translateY = useRef(new Animated.Value(panelHeight)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : panelHeight,
      useNativeDriver: true,
      damping: 20,
      stiffness: 100,
    }).start();
  }, [isVisible]);
  return (
    <Animated.View style={[styles.settingsPanel, { height: panelHeight, transform: [{ translateY }] }]}>
      <TouchableOpacity style={styles.closeButtonPanel} onPress={onClose}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
      <View style={styles.settingsContentPanel}>
        <Text style={styles.settingsTitlePanel}>تنظیمات</Text>
        <Text style={styles.settingsItemPanel}>ورژن برنامه: 3.0.1</Text>
        <Text style={styles.settingsItemPanel}>سازنده: $ Sina $</Text>
        <Text style={styles.settingsItemPanel}>آدرس دونیت کریپتو:</Text>
        <Text style={styles.settingsItemPanel}>0x0a375bfe195477fe005ae49a1464db72b05f5748</Text>
      </View>
    </Animated.View>
  );
};
const Header = ({ onOpenSettings }) => {
  const [lastUpdate, setLastUpdate] = useState({ date: '', time: '' });
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
    <View style={styles.headerContainer}>
      <Text style={styles.appName}>{`$ Rate Exchange $`}</Text>
      <Text style={styles.updateText}>{`${lastUpdate.date}  ${lastUpdate.time}`}</Text>
      <Text style={styles.footerLink}>{`$ sina $`}</Text>
      <TouchableOpacity style={styles.settingsIcon} onPress={onOpenSettings}>
        <Text style={styles.settingsIconText}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
};
const HomeScreen = ({ navigation, openSettings }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header onOpenSettings={openSettings} />
      <ScrollView contentContainerStyle={styles.homeContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Currency')}>
          <Text style={styles.navButtonText}>ارزها 💵</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Conversion')}>
          <Text style={styles.navButtonText}>تبدیل ارز 💱</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Gold')}>
          <Text style={styles.navButtonText}>قیمت طلا 🪙</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Coin')}>
          <Text style={styles.navButtonText}>قیمت سکه 💰</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const CurrencyScreen = () => {
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
      <StatusBar barStyle="light-content" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>ارزها 💵</Text>
        </TouchableOpacity>
        <View style={styles.sectionContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#fac3dc" />
          ) : (
            currencyData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => showDetail(item.label)}
                onLongPress={() => handleShare(item.label)}>
                <Text style={styles.cardText}>{item.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const ConversionScreen = () => {
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
            style={styles.picker}
            onValueChange={(itemValue) => setConvertSource(itemValue)}>
            {currencies.map(({ code, title }) => (
              <Picker.Item key={code} label={title} value={code} />
            ))}
          </Picker>
          <Text style={styles.cardText}>انتخاب ارز مقصد:</Text>
          <Picker
            selectedValue={convertTarget}
            style={styles.picker}
            onValueChange={(itemValue) => setConvertTarget(itemValue)}>
            {currencies.map(({ code, title }) => (
              <Picker.Item key={code} label={title} value={code} />
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
const GoldScreen = () => {
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
      <StatusBar barStyle="light-content" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>قیمت طلا 🪙</Text>
        </TouchableOpacity>
        <View style={styles.sectionContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#fac3dc" />
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
const CoinScreen = () => {
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
      <StatusBar barStyle="light-content" />
      <Header onOpenSettings={() => {}} />
      <ScrollView contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>قیمت سکه 💰</Text>
        </TouchableOpacity>
        <View style={styles.sectionContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#fac3dc" />
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
const AboutScreen = () => {
  return (
    <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
      <StatusBar barStyle="light-content" />
      <Header onOpenSettings={() => {}} />
      <View style={{ padding: Spacing.large }}>
        <Text style={{ fontSize: Typography.headerFontSize * scale * 0.8, textAlign: 'center', marginBottom: Spacing.medium, color: Colors.dateTimeText }}>
          این اپلیکیشن اطلاعات به‌روز ارز، طلا و سکه را از منابع معتبر دریافت و نمایش می‌دهد.
        </Text>
        <Text style={{ fontSize: Typography.headerFontSize * scale * 0.7, textAlign: 'center', color: Colors.dateTimeText }}>
          از امکانات تبدیل ارز و اشتراک‌گذاری اطلاعات بهره ببرید.
        </Text>
      </View>
    </SafeAreaView>
  );
};
const Stack = createStackNavigator();
const App = () => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const toggleSettings = () => setIsSettingsVisible(!isSettingsVisible);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} openSettings={toggleSettings} />}
        </Stack.Screen>
        <Stack.Screen name="Currency" component={CurrencyScreen} />
        <Stack.Screen name="Conversion" component={ConversionScreen} />
        <Stack.Screen name="Gold" component={GoldScreen} />
        <Stack.Screen name="Coin" component={CoinScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
      {isSettingsVisible && <SettingsPanel isVisible={isSettingsVisible} onClose={toggleSettings} />}
    </NavigationContainer>
  );
};
export default App;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100 * scale,
    backgroundColor: Colors.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  appName: {
    fontSize: Typography.headerFontSize * scale,
    fontWeight: 'bold',
    color: Colors.rateExchangeText,
    textShadowColor: '#000',
    textShadowOffset: { width: 3 * scale, height: 3 * scale },
    textShadowRadius: 3 * scale,
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  updateText: {
    fontSize: Typography.updateFontSize * scale,
    color: Colors.dateTimeText,
    marginTop: Spacing.small,
  },
  settingsIcon: {
    position: 'absolute',
    right: 10 * scale,
    top: 10 * scale,
    padding: Spacing.small,
  },
  settingsIconText: {
    fontSize: 26 * scale,
    color: Colors.buttonText,
  },
  settingsPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.settingsPanelBackground,
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
    color: Colors.settingsPanelText,
  },
  settingsContentPanel: {
    marginTop: Spacing.medium,
    alignItems: 'center',
  },
  settingsTitlePanel: {
    fontSize: Typography.settingsTitleFontSize * scale,
    fontWeight: 'bold',
    color: Colors.settingsPanelText,
    marginBottom: Spacing.medium,
  },
  settingsItemPanel: {
    fontSize: Typography.settingsItemFontSize * scale,
    color: Colors.settingsPanelText,
    marginVertical: Spacing.small,
  },
  scrollContainer: {
    padding: Spacing.large,
    alignItems: 'center',
    paddingBottom: Spacing.large,
  },
  homeContainer: {
    marginTop: 110 * scale,
    padding: Spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    backgroundColor: Colors.buttonBackground,
    borderRadius: 25 * scale,
    paddingVertical: 15 * scale,
    paddingHorizontal: 30 * scale,
    marginVertical: Spacing.small,
    width: '85%',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: Typography.navButtonFontSize * scale,
    fontWeight: 'bold',
    color: Colors.buttonText,
  },
  sectionHeader: {
    backgroundColor: Colors.buttonBackground,
    borderRadius: 25 * scale,
    paddingVertical: 12 * scale,
    paddingHorizontal: 20 * scale,
    marginVertical: Spacing.small,
    width: '100%',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: Typography.sectionHeaderFontSize * scale,
    fontWeight: 'bold',
    color: Colors.buttonText,
  },
  sectionContent: {
    width: '100%',
    marginBottom: Spacing.large,
  },
  card: {
    backgroundColor: Colors.cardBackground,
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
    color: Colors.buttonText,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15 * scale,
    padding: 12 * scale,
    marginVertical: Spacing.small,
    width: '100%',
    textAlign: 'center',
    fontSize: Typography.inputFontSize * scale,
    color: Colors.buttonText,
  },
  picker: {
    height: 55 * scale,
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 15 * scale,
    marginVertical: Spacing.small,
  },
  footerLink: {
    fontSize: 18 * scale,
    marginTop: 0,
    textShadowColor: '#000',
    textShadowOffset: { width: 2 * scale, height: 4 * scale },
    textShadowRadius: 3 * scale,
    textAlign: 'center',
    color: Colors.linkColor,
  },
});