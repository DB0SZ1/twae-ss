/**
 * ScreenWrapper — SafeArea + scroll + background — wraps every screen
 */
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  style?: ViewStyle;
  statusBarStyle?: 'light-content' | 'dark-content';
  backgroundColor?: string;
  safeTop?: boolean;
  safeBottom?: boolean;
}

export default function ScreenWrapper({
  children,
  scrollable = true,
  onRefresh,
  refreshing = false,
  style,
  statusBarStyle = 'dark-content',
  backgroundColor = Colors.bg,
  safeTop = true,
  safeBottom = true,
}: ScreenWrapperProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      {safeTop && (
        <SafeAreaView style={{ backgroundColor }}>
          <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} />
        </SafeAreaView>
      )}
      {scrollable ? (
        <ScrollView
          style={[styles.scroll, style]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.g3}
                colors={[Colors.g3]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, style]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fill: {
    flex: 1,
  },
});
