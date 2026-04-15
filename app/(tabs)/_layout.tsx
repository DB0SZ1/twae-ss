/**
 * twae — Tab Layout
 * Ultra-Premium LIQUID GLASS expanding pill bottom bar.
 * Built with react-native-reanimated, expo-blur, and expo-linear-gradient.
 */
import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Home, Receipt, TrendingUp, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withTiming, 
  interpolateColor
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

const TAB_CONFIG = [
  { name: 'index', label: 'Home', Icon: Home },
  { name: 'transactions', label: 'Activity', Icon: Receipt },
  { name: 'invest', label: 'Invest', Icon: TrendingUp },
  { name: 'profile', label: 'Profile', Icon: User },
];

/**
 * Liquid physics: Slightly lower damping for a more organic, fluid "slosh" into place
 */
const SPRING_CONFIG = {
  damping: 14,
  stiffness: 130,
  mass: 1,
};

const TabItem = ({ tab, isFocused, onPress }: any) => {
  const IconComponent = tab.Icon;
  
  // Shared values for the expanding liquid effect
  const expandWidth = useSharedValue(isFocused ? 1 : 0);
  const opacityText = useSharedValue(isFocused ? 1 : 0);
  const scaleIcon = useSharedValue(isFocused ? 1.05 : 1);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    expandWidth.value = withSpring(isFocused ? 1 : 0, SPRING_CONFIG);
    opacityText.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
    scaleIcon.value = withSpring(isFocused ? 1.08 : 1, SPRING_CONFIG);
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Flex expands organically from 1 to 2.5
    const flexVal = 1 + (expandWidth.value * 1.5);
    return {
      flex: flexVal,
      backgroundColor: interpolateColor(
        expandWidth.value,
        [0, 1],
        ['transparent', 'rgba(255, 255, 255, 0.15)'] // Soft white overlay within the glass to simulate illumination
      ),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityText.value,
      transform: [{ translateX: withSpring(isFocused ? 0 : -10, SPRING_CONFIG) }],
      width: expandWidth.value > 0.05 ? 'auto' : 0,
      marginLeft: expandWidth.value * 6,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleIcon.value }],
    };
  });

  return (
    <Animated.View style={[styles.tabItemContainer, animatedContainerStyle, !isReady && { flex: isFocused ? 2.5 : 1 }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={() => {
          if (!isFocused) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }
        }}
        style={styles.tabItemInner}
        activeOpacity={1}
      >
        <Animated.View style={animatedIconStyle}>
          <IconComponent
            size={22}
            color={isFocused ? Colors.primary : Colors.muted}
            strokeWidth={isFocused ? 2.5 : 2}
          />
        </Animated.View>
        
        {isFocused && (
           <Animated.Text
             style={[styles.tabLabel, animatedTextStyle]}
             numberOfLines={1}
             ellipsizeMode="clip"
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
    <View style={[styles.tabBarOuter, { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 24 }]}>
      <BlurView intensity={65} tint="dark" style={styles.blurWrap}>
        
        {/* LIQUID GLASS GLOSSY HIGHLIGHT OVERLAY */}
        <LinearGradient 
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.02)', 'transparent']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const tab = TAB_CONFIG[index];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
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
      </BlurView>
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
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    
    // Ambient drop shadow for the liquid glass casing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  blurWrap: {
    borderRadius: 32, // More pill-like organic outer shape
    overflow: 'hidden',
    borderWidth: 1.5,
    // Glass edge highlights mimicking light refraction
    borderTopColor: 'rgba(255, 255, 255, 0.4)',  
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabBarInner: {
    width: '100%',
    height: 72, // Slightly taller for breathing room
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabItemContainer: {
    height: '100%',
    borderRadius: 24, // Inner pill curves organically within the outer pill
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  tabItemInner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 14,
    color: Colors.primary,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
});
