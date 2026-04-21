/**
 * twae — Tickets List Screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { fetchTickets } from '../../controllers/supportController';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors } from '../../constants/theme';

export default function TicketsListScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all'); // all, open, resolved

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [tab])
  );

  const loadTickets = async () => {
    setLoading(true);
    try {
      const statusParam = tab === 'all' ? undefined : tab;
      const res = await fetchTickets(statusParam);
      setTickets(res);
    } catch (e) {
      //
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return Colors.gold2;
      case 'resolved': return Colors.greenBright;
      case 'closed': return Colors.dim;
      default: return Colors.muted;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/(settings)/ticket/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.catBox}><Text style={styles.catText}>{item.category}</Text></View>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
      </View>
      <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
      <Text style={styles.preview} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.footerRow}>
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.tkId}>#{item.id.substring(3, 10).toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="My Tickets" />

      {/* Tabs */}
      <View style={styles.tabRow}>
        {['all', 'open', 'resolved'].map(t => (
          <TouchableOpacity 
            key={t} 
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.gsheen} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="ticket-outline" size={48} color={Colors.blackAlpha04} />
              <Text style={styles.emptyTitle}>No tickets found</Text>
              <Text style={styles.emptySub}>You don't have any {tab !== 'all' ? tab : ''} tickets at the moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 12, gap: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  tabActive: { backgroundColor: 'rgba(50, 100, 209, 0.1)' },
  tabText: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.dim },
  tabTextActive: { color: Colors.gsheen, fontFamily: 'Inter_600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.02, shadowRadius:4, elevation:2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catBox: { backgroundColor: 'rgba(0,0,0,0.04)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  catText: { fontFamily: 'Inter_600', fontSize: 10, color: Colors.dim, textTransform: 'uppercase' },
  date: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted },
  subject: { fontFamily: 'Inter_600', fontSize: 15, color: Colors.text, marginBottom: 6 },
  preview: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted, lineHeight: 18, marginBottom: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.02)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'Inter_600', fontSize: 10, color: Colors.dim, letterSpacing: 0.5 },
  tkId: { fontFamily: 'Inter_500', fontSize: 11, color: Colors.muted },
  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginTop: 16 },
  emptySub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginTop: 8, textAlign: 'center' },
});
