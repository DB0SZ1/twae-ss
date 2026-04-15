import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { LayoutGrid, ArrowLeftRight, BarChart2, CircleUser } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_CONFIG = [
  { name: 'index',        label: 'Home',     Icon: LayoutGrid     },
  { name: 'transactions', label: 'Activity', Icon: ArrowLeftRight  },
  { name: 'invest',       label: 'Invest',   Icon: BarChart2       },
  { name: 'profile',      label: 'Profile',  Icon: CircleUser      },
];

const THEME = {
  glass:      'rgba(187, 187, 188, 0.12)',
  pillActive: 'rgba(187, 187, 188, 0.36)',
  tint:       'rgba(255, 255, 255, 0.50)',
  content:    '#222244',
  action:     '#0052f5',
};

const SPRING_CONFIG = {
  tension: 140,
  friction: 15,
  useNativeDriver: false,
};

const TabItem = ({ tab, isFocused, onPress }: any) => {
  const { Icon } = tab;

  const expandAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(expandAnim, {
        toValue: isFocused ? 1 : 0,
        ...SPRING_CONFIG,
      }),
      Animated.timing(opacityAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        ...SPRING_CONFIG,
      }),
    ]).start();
  }, [isFocused]);

  // flex: 1 + expandAnim * 1.5
  const animatedFlex = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const animatedBg = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', THEME.pillActive],
  });

  const animatedTranslateX = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const animatedMarginLeft = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  return (
    <Animated.View
      style={[
        styles.tabItemContainer,
        {
          flex: animatedFlex,
          backgroundColor: animatedBg,
        },
      ]}
    >
      {/* Liquid glass tint layer */}
      {isFocused && (
        <View style={styles.liquidGlassTint} pointerEvents="none" />
      )}

      {/* Liquid glass shine layer */}
      {isFocused && (
        <View style={styles.liquidGlassShine} pointerEvents="none" />
      )}

      {/* Gradient sheen */}
      {isFocused && (
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'transparent', 'rgba(0,0,0,0.1)']}
          locations={[0, 0.2, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={() => {
          if (!isFocused) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }
        }}
        style={styles.tabItemInner}
        activeOpacity={1}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Icon
            size={22}
            color={isFocused ? THEME.action : THEME.content}
            strokeWidth={isFocused ? 2.5 : 2}
          />
        </Animated.View>

        {isFocused && (
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                opacity: opacityAnim,
                transform: [{ translateX: animatedTranslateX }],
                marginLeft: animatedMarginLeft,
              },
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Animated.Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarOuter,
        { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 24 },
      ]}
    >
      {/* Liquid glass wrapper */}
      <View style={styles.liquidGlassWrapper}>
        {/* Glass effect layer: blur */}
        <BlurView
          intensity={3}
          tint="light"
          style={[StyleSheet.absoluteFillObject, styles.liquidGlassEffect]}
        />

        {/* Tint */}
        <View style={[StyleSheet.absoluteFillObject, styles.liquidGlassTintOuter]} pointerEvents="none" />

        {/* Shine bevel */}
        <View style={[StyleSheet.absoluteFillObject, styles.liquidGlassShineOuter]} pointerEvents="none" />

        {/* Gradient overlay */}
        <LinearGradient
          colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.08)']}
          locations={[0, 0.3, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const tab       = TAB_CONFIG[index];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                tab={tab}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
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
      <Tabs.Screen name="index"        />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="invest"       />
      <Tabs.Screen name="profile"      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  /* ── Outer container ── */
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  /* ── Liquid glass wrapper ── */
  liquidGlassWrapper: {
    position: 'relative',
    width: '90%',
    maxWidth: 400,
    height: 70,
    borderRadius: 999,
    overflow: 'hidden',
    display: 'flex',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 1,
    borderTopColor:    'rgba(255,255,255,0.9)',
    borderRightColor:  'rgba(255,255,255,0.5)',
    borderLeftColor:   'rgba(255,255,255,0.5)',
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },

  /* .liquidGlass-effect */
  liquidGlassEffect: {
    zIndex: 0,
    borderRadius: 999,
  },

  /* .liquidGlass-tint (outer bar) */
  liquidGlassTintOuter: {
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.50)',
    borderRadius: 999,
  },

  /* .liquidGlass-shine (outer bar) */
  liquidGlassShineOuter: {
    zIndex: 2,
    borderRadius: 999,
    shadowColor: 'rgba(255,255,255,0.5)',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  /* ── Inner row ── */
  tabBarInner: {
    zIndex: 3,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  /* ── Per-tab pill ── */
  tabItemContainer: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor:    'rgba(255,255,255,0.05)',
    borderTopColor: 'rgba(255,255,255,0.6)',
  },

  tabItemInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* .liquidGlass-tint on active pill */
  liquidGlassTint: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
  },

  /* .liquidGlass-shine on active pill */
  liquidGlassShine: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  tabLabel: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 13,
    color: THEME.action,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
});