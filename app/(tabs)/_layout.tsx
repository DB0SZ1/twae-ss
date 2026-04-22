import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { apiClient } from '../../utils/apiClient';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { LayoutGrid, ArrowLeftRight, BarChart2, CircleUser, MessageCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_CONFIG = [
  { name: 'index',        label: 'Home',     Icon: LayoutGrid     },
  { name: 'transactions', label: 'Activity', Icon: ArrowLeftRight  },
  { name: 'chat',         label: 'Twae',  Icon: MessageCircle  },
  { name: 'invest',       label: 'Invest',   Icon: BarChart2       },
  { name: 'profile',      label: 'Profile',  Icon: CircleUser      },
];

const THEME = {
  pillActive: 'rgba(187, 187, 188, 0.36)',
  content:    '#222244',
  action:     '#0052f5',
};

const LAYOUT_SPRING = {
  duration: 350,
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.8,
  },
};

const TabItem = ({ tab, isFocused, onPress }: any) => {
  const { Icon } = tab;

  const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        tension: 140,
        friction: 15,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <View
      style={[
        styles.tabItemContainer,
        {
          flex: isFocused ? 3.2 : 0.7,
          backgroundColor: isFocused ? THEME.pillActive : 'transparent',
        },
        // Active pill gets its own mini glass bevel
        isFocused && styles.tabItemActive,
      ]}
    >
      {/* Active pill inner tint */}
      {isFocused && (
        <View style={styles.pillTint} pointerEvents="none" />
      )}

      {/* Active pill shine — simulates inset box-shadow */}
      {isFocused && (
        <View style={styles.pillShine} pointerEvents="none" />
      )}

      {/* Active pill gradient sheen — simulates light refraction on pill */}
      {isFocused && (
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.30)',
            'rgba(255,255,255,0.05)',
            'transparent',
            'rgba(0,0,0,0.06)',
          ]}
          locations={[0, 0.15, 0.5, 1]}
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
              { opacity: opacityAnim },
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Animated.Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const prevIndex = useRef(state.index);

  // Trigger LayoutAnimation on every tab switch
  useEffect(() => {
    if (prevIndex.current !== state.index) {
      LayoutAnimation.configureNext(LAYOUT_SPRING);
      prevIndex.current = state.index;
    }
  }, [state.index]);

  return (
    <View
      style={[
        styles.tabBarOuter,
        { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 24 },
      ]}
    >
      <View style={styles.glassWrapper}>
        {/*
         * LAYER 0 — Blur (backdrop-filter: blur)
         * Moderate intensity — the "distortion" feel.
         * CSS uses 3px blur + SVG displacement. We compensate
         * for the missing displacement with stronger blur.
         */}
        <BlurView
          intensity={25}
          tint="default"
          style={[StyleSheet.absoluteFillObject, styles.glassBlur]}
        />

        {/*
         * LAYER 1 — Tint (background: rgba(255,255,255,0.50))
         * Exact match from the CSS .liquidGlass-tint
         */}
        <View
          style={[StyleSheet.absoluteFillObject, styles.glassTint]}
          pointerEvents="none"
        />

        {/*
         * LAYER 2 — Shine / bevel
         * Simulates: box-shadow: inset 2px 2px 1px 0 rgba(255,255,255,0.5),
         *                        inset -1px -1px 1px 1px rgba(255,255,255,0.5);
         * We approximate with bright top/left borders, subtle bottom/right
         */}
        <View
          style={[StyleSheet.absoluteFillObject, styles.glassShine]}
          pointerEvents="none"
        />

        {/*
         * LAYER 3 — Refraction gradient
         * Simulates the light bending you'd see through thick glass.
         * Top-bright → middle-clear → bottom-dark
         */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.22)',
            'rgba(255,255,255,0.08)',
            'transparent',
            'rgba(0,0,0,0.12)',
          ]}
          locations={[0, 0.2, 0.6, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/*
         * LAYER 4 — Specular highlight (subtle top glint)
         * Adds the "wet glass" look
         */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.35)',
            'transparent',
          ]}
          locations={[0, 0.08]}
          style={[StyleSheet.absoluteFillObject, { borderRadius: 999 }]}
          pointerEvents="none"
        />

        {/* Tab items */}
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
  useEffect(() => {
    async function registerPush() {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        await apiClient('/notifications/push-token', {
          method: 'POST',
          body: JSON.stringify({
            device_id: Device.osBuildId || 'dev-unknown',
            fcm_token: tokenData.data,
          })
        });
      } catch (err) {
        console.warn('Push registration failed:', err);
      }
    }
    registerPush();
  }, []);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"        />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="chat"         />
      <Tabs.Screen name="invest"       />
      <Tabs.Screen name="profile"      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  /* ════════════════════════════════════════════
   * OUTER CONTAINER
   * ════════════════════════════════════════════ */
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  /* ════════════════════════════════════════════
   * GLASS WRAPPER  (.liquidGlass-wrapper)
   *
   * box-shadow: 0 6px 6px rgba(0,0,0,0.2),
   *             0 0 20px rgba(0,0,0,0.1);
   * ════════════════════════════════════════════ */
  glassWrapper: {
    position: 'relative',
    width: '90%',
    maxWidth: 400,
    height: 70,
    borderRadius: 999,
    overflow: 'hidden',
    // Outer shadow — matches CSS box-shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    // Bevel border — bright top, subtle sides, dark bottom
    borderWidth: 1.2,
    borderTopColor:    'rgba(255,255,255,0.95)',
    borderRightColor:  'rgba(255,255,255,0.45)',
    borderLeftColor:   'rgba(255,255,255,0.45)',
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },

  /* .liquidGlass-effect — blur layer */
  glassBlur: {
    zIndex: 0,
    borderRadius: 999,
  },

  /* .liquidGlass-tint — rgba(255,255,255,0.50) */
  glassTint: {
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderRadius: 999,
  },

  /* .liquidGlass-shine — inset box-shadow simulation */
  glassShine: {
    zIndex: 2,
    borderRadius: 999,
    borderWidth: 1.5,
    borderTopColor:    'rgba(255,255,255,0.6)',
    borderLeftColor:   'rgba(255,255,255,0.5)',
    borderRightColor:  'rgba(255,255,255,0.3)',
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },

  /* ════════════════════════════════════════════
   * TAB BAR INNER ROW
   * ════════════════════════════════════════════ */
  tabBarInner: {
    zIndex: 3,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  /* ════════════════════════════════════════════
   * PER-TAB PILL (inactive state)
   * ════════════════════════════════════════════ */
  tabItemContainer: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    marginHorizontal: 3,
    borderWidth: 0.5,
    borderColor: 'transparent',
  },

  /* Active pill — gets its own bevel border */
  tabItemActive: {
    borderWidth: 1,
    borderTopColor:    'rgba(255,255,255,0.7)',
    borderLeftColor:   'rgba(255,255,255,0.4)',
    borderRightColor:  'rgba(255,255,255,0.3)',
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  tabItemInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  /* Active pill tint */
  pillTint: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderRadius: 999,
  },

  /* Active pill shine — inset shadow simulation */
  pillShine: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderTopColor:    'rgba(255,255,255,0.55)',
    borderLeftColor:   'rgba(255,255,255,0.4)',
    borderRightColor:  'rgba(255,255,255,0.2)',
    borderBottomColor: 'transparent',
  },

  /* ════════════════════════════════════════════
   * LABEL
   * ════════════════════════════════════════════ */
  tabLabel: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 13,
    color: THEME.action,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
});