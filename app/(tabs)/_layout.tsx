/**
 * twae — Tab Layout
 * Premium floating glass tab bar with animated indicators
 * Uses React Native built-in Animated API — no moti/reanimated dependency
 */
import React, { useRef, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Home, Receipt, TrendingUp, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 48;
const TAB_COUNT = 4;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

const TAB_CONFIG = [
  { name: 'index', label: 'Home', Icon: Home },
  { name: 'transactions', label: 'History', Icon: Receipt },
  { name: 'invest', label: 'Invest', Icon: TrendingUp },
  { name: 'profile', label: 'Profile', Icon: User },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const indicatorX = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;
  const iconScales = useRef(TAB_CONFIG.map(() => new Animated.Value(1))).current;
  const labelOpacities = useRef(TAB_CONFIG.map((_, i) =>
    new Animated.Value(state.index === i ? 1 : 0)
  )).current;

  useEffect(() => {
    // Slide the indicator
    Animated.spring(indicatorX, {
      toValue: state.index * TAB_WIDTH,
      tension: 68,
      friction: 12,
      useNativeDriver: true,
    }).start();

    // Animate icons & labels
    TAB_CONFIG.forEach((_, i) => {
      const isFocused = state.index === i;
      Animated.parallel([
        Animated.spring(iconScales[i], {
          toValue: isFocused ? 1.15 : 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacities[i], {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [state.index]);

  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBar}>
        {/* Sliding Indicator */}
        <Animated.View style={[styles.indicatorWrap, { transform: [{ translateX: indicatorX }] }]}>
          <LinearGradient
            colors={[Colors.g2, Colors.g3]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.indicator}
          />
        </Animated.View>

        {state.routes.map((route: any, index: number) => {
          const tab = TAB_CONFIG[index];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const IconComponent = tab.Icon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: iconScales[index] }] }}>
                <IconComponent
                  size={20}
                  color={isFocused ? '#ffffff' : Colors.muted}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </Animated.View>
              <Animated.Text
                style={[
                  styles.tabLabel,
                  { opacity: labelOpacities[index] },
                  isFocused && { color: '#ffffff' },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="invest" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingHorizontal: 24,
  },
  tabBar: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(50,100,209,.1)',
    ...Shadows.card,
    shadowColor: 'rgba(50,100,209,.2)',
  },
  indicatorWrap: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  indicator: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    opacity: 0.95,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 2,
    gap: 3,
  },
  tabLabel: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 0.3,
  },
});
