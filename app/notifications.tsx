/**
 * twae — Notifications Screen (Screen 2.3)
 * Grouped notifications, swipe-to-delete, mark all read, deep-link tap
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Radii } from '../constants/theme';
import { notifications, Notification } from '../constants/mockData';

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  transaction: { icon: 'swap-horizontal', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  security: { icon: 'shield-checkmark', color: Colors.gold1, bg: 'rgba(217,119,6,0.12)' },
  capture: { icon: 'flash', color: Colors.greenBright, bg: 'rgba(74,222,128,0.12)' },
  savings: { icon: 'wallet', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  investment: { icon: 'trending-up', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  promo: { icon: 'gift', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  system: { icon: 'settings', color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)' },
  support: { icon: 'chatbubble-ellipses', color: Colors.g2, bg: 'rgba(50,100,209,0.12)' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? items.filter(n => !n.read) : items;
  const unreadCount = items.filter(n => !n.read).length;

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Ionicons name="checkmark-done" size={22} color={Colors.g2} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'unread' && styles.filterActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No unread notifications</Text>
          </View>
        ) : (
          filtered.map(notif => {
            const cfg = typeConfig[notif.type] || typeConfig.system;
            return (
              <TouchableOpacity
                key={notif.id}
                style={[styles.notifRow, !notif.read && styles.notifUnread]}
                onPress={() => markRead(notif.id)}
                onLongPress={() => {
                  Alert.alert('Delete?', 'Remove this notification?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteNotif(notif.id) },
                  ]);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTop}>
                    <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                  <Text style={styles.notifMsg} numberOfLines={2}>{notif.message}</Text>
                  <Text style={styles.notifDate}>{notif.date}</Text>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterBtn: {
    paddingVertical: 8, paddingHorizontal: 18, borderRadius: Radii.pill,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  filterText: { fontFamily: 'Inter_500', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  filterTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 40 },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  notifUnread: { backgroundColor: 'rgba(50,100,209,0.06)', borderColor: 'rgba(50,100,209,0.12)' },
  notifIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  notifContent: { flex: 1 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: '#fff', flex: 1, marginRight: 8 },
  notifTime: { fontFamily: 'Inter_400', fontSize: 10, color: 'rgba(255,255,255,0.35)' },
  notifMsg: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  notifDate: { fontFamily: 'Inter_400', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.g2, marginTop: 6 },
  emptyWrap: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff', marginTop: 16, marginBottom: 4 },
  emptyText: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
});
