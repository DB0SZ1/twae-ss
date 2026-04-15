import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LayoutGrid, ArrowLeftRight, BarChart2, CircleUser } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

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

const SPRING = { damping: 15, stiffness: 140, mass: 1 };

// SVG glass-distortion filter — injected as an invisible overlay
const GLASS_FILTER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute">
  <defs>
    <filter
      id="glass-distortion"
      x="0%" y="0%" width="100%" height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.01 0.01"
        numOctaves="1"
        seed="5"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1"  offset="0"   />
        <feFuncB type="gamma" amplitude="0" exponent="1"  offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lighting-color="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0" k2="1" k3="1" k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="150"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </defs>
</svg>
`;

const TabItem = ({ tab, isFocused, onPress }: any) => {
  const { Icon } = tab;

  const expandWidth = useSharedValue(isFocused ? 1 : 0);
  const opacityText = useSharedValue(isFocused ? 1 : 0);
  const scaleIcon   = useSharedValue(isFocused ? 1.1 : 1);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    expandWidth.value = withSpring(isFocused ? 1 : 0, SPRING);
    opacityText.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    scaleIcon.value   = withSpring(isFocused ? 1.1 : 1, SPRING);
  }, [isFocused]);

  const animatedContainer = useAnimatedStyle(() => ({
    flex: 1 + expandWidth.value * 1.5,
    backgroundColor: interpolateColor(
      expandWidth.value,
      [0, 1],
      ['transparent', THEME.pillActive]
    ),
  }));

  const animatedText = useAnimatedStyle(() => ({
    opacity: opacityText.value,
    transform: [{ translateX: withSpring(isFocused ? 0 : -10, SPRING) }],
    width: expandWidth.value > 0.05 ? 'auto' : 0,
    marginLeft: expandWidth.value * 6,
  }));

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [{ scale: scaleIcon.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.tabItemContainer,
        animatedContainer,
        !isReady && { flex: isFocused ? 2.5 : 1 },
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

      {/* Gradient sheen (replaces old LinearGradient) */}
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
        <Animated.View style={animatedIcon}>
          <Icon
            size={22}
            color={isFocused ? THEME.action : THEME.content}
            strokeWidth={isFocused ? 2.5 : 2}
          />
        </Animated.View>

        {isFocused && (
          <Animated.Text style={[styles.tabLabel, animatedText]} numberOfLines={1}>
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
      {/* Hidden SVG filter definition — needed for glass-distortion on web/RN Web */}
      <View style={styles.svgFilterHost} pointerEvents="none">
        <SvgXml xml={GLASS_FILTER_SVG} width={0} height={0} />
      </View>

      {/* Liquid glass wrapper */}
      <View style={styles.liquidGlassWrapper}>
        {/* Glass effect layer: blur + distortion */}
        <BlurView
          intensity={3}
          tint="light"
          style={[StyleSheet.absoluteFillObject, styles.liquidGlassEffect]}
        />

        {/* Tint */}
        <View style={[StyleSheet.absoluteFillObject, styles.liquidGlassTintOuter]} pointerEvents="none" />

        {/* Shine bevel */}
        <View style={[StyleSheet.absoluteFillObject, styles.liquidGlassShineOuter]} pointerEvents="none" />

        {/* Existing gradient overlay */}
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
  /* ── SVG filter host (invisible, just provides the filter def) ── */
  svgFilterHost: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: -1,
    overflow: 'hidden',
  },

  /* ── Outer container ── */
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  /* ── Liquid glass wrapper (replaces blurWrap) ── */
  liquidGlassWrapper: {
    position: 'relative',
    width: '90%',
    maxWidth: 400,
    height: 70,
    borderRadius: 999,
    overflow: 'hidden',
    display: 'flex',
    // matches .liquidGlass-wrapper box-shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    // bevel border
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