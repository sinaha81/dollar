import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen'; // Adjust path
import { CurrencyScreen } from '../screens/CurrencyScreen'; // Adjust path
import { ConversionScreen } from '../screens/ConversionScreen'; // Adjust path
import { GoldScreen } from '../screens/GoldScreen'; // Adjust path
import { CoinScreen } from '../screens/CoinScreen'; // Adjust path
// Import Reanimated for custom transitions if needed
// import Animated from 'react-native-reanimated';

const Stack = createStackNavigator();

// Custom transition (example using slide from bottom)
// const forSlideFromBottom = ({ current, layouts }) => {
//   return {
//     cardStyle: {
//       transform: [
//         {
//           translateY: current.progress.interpolate({
//             inputRange: [0, 1],
//             outputRange: [layouts.screen.height, 0],
//           }),
//         },
//       ],
//     },
//   };
// };

export const AppNavigator = ({ openSettings }) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        // Use default iOS horizontal slide or customize
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        // gestureEnabled: true, // Enable gestures for back navigation
        // gestureDirection: 'horizontal',
      }}
    >
      {/* Pass openSettings only to HomeScreen where Header is used */}
      <Stack.Screen name="Home">
        {(props) => <HomeScreen {...props} openSettings={openSettings} />}
      </Stack.Screen>
      <Stack.Screen name="Currency" component={CurrencyScreen} />
      <Stack.Screen name="Conversion" component={ConversionScreen} />
      <Stack.Screen name="Gold" component={GoldScreen} />
      <Stack.Screen name="Coin" component={CoinScreen} />
      {/* Add other screens like a dedicated DetailScreen if needed */}
       {/* <Stack.Screen 
            name="Detail"
            component={DetailScreen}
            options={{ cardStyleInterpolator: forSlideFromBottom }} // Example custom transition
       /> */}
    </Stack.Navigator>
  );
}; 