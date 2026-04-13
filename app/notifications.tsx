/**
 * twae — Notifications Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/layouts/AppHeader';
import { Colors, Radii, Shadows } from '../constants/theme';
import { notifications, Notification } from '../constants/mockData';

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  transaction: { icon: 'swap-horizontal', color: Colors.gsheen, bg: 'rgba(50,100,209,.06)' },
  security: { icon: 'shield-checkmark', color: Colors.gold3, bg: 'rgba(212,160,23,.06)' },
  promo: { icon: 'gift', color: Colors.greenBright, bg: 'rgba(74,222,128,.06)' },
  system: { icon: 'settings', color: Colors.muted, bg: 'rgba(0,0,0,.03)' },
};

export default function NotificationsScreen() {
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

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead}>
              <Ionicons name="checkmark-done" size={20} color={Colors.gsheen} />
            </TouchableOpacity>
          ) : undefined
        }
      />

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
            <Ionicons name="notifications-off-outline" size={48} color={Colors.dim} />
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
  container: { flex: 1, backgroundColor: Colors.bg },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: Radii.pill, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  filterActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  filterText: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.muted },
  filterTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 40 },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, backgroundColor: Colors.card, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card },
  notifUnread: { backgroundColor: 'rgba(50,100,209,.02)', borderColor: 'rgba(50,100,209,.1)' },
  notifIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  notifContent: { flex: 1 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text, flex: 1, marginRight: 8 },
  notifTime: { fontFamily: 'Inter_400', fontSize: 10, color: Colors.dim },
  notifMsg: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted, lineHeight: 18 },
  notifDate: { fontFamily: 'Inter_400', fontSize: 10, color: Colors.dim, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.g3, marginTop: 6 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginTop: 16, marginBottom: 4 },
  emptyText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
});
