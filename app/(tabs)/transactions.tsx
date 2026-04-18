/**
 * twae — Transactions Screen (Screen 2.2)
 * Full infinite-scroll history with search, filters, date grouping, export
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, TextInput, FlatList, Modal, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import TransactionRow from '../../components/molecules/TransactionRow';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { transactions } from '../../constants/mockData';

const FILTERS = ['All', 'Fund', 'Send', 'Capture', 'Invest'];
const statusFilters = ['All Status', 'Completed', 'Pending', 'Failed'];

type Transaction = typeof transactions[0];

export default function TransactionsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [page, setPage] = useState(1);

  // Filter + search
  const filtered = transactions.filter(txn => {
    const matchFilter = activeFilter === 'All' ? true
    : activeFilter === 'Fund' ? txn.type === 'credit'
    : activeFilter === 'Send' ? txn.type === 'debit'
    : activeFilter === 'Capture' ? txn.category === 'savings'
    : activeFilter === 'Invest' ? txn.category === 'investment'
    : true;

    const matchSearch = searchQuery.length === 0 ||
      txn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.amount.toString().includes(searchQuery);

    return matchFilter && matchSearch;
  });

  // Date grouping
  const groupByDate = (txns: Transaction[]) => {
    const groups: { date: string; data: Transaction[] }[] = [];
    const map: Record<string, Transaction[]> = {};
    txns.forEach(t => {
      const d = t.date;
      if (!map[d]) { map[d] = []; groups.push({ date: d, data: map[d] }); }
      map[d].push(t);
    });
    return groups;
  };
  const grouped = groupByDate(filtered.slice(0, page * 10));

  const openDetail = (txn: Transaction) => {
    setSelectedTxn(txn);
    setShowDetail(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Dark Background ── */}
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or amount..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}

          {/* Export Btn */}
          <TouchableOpacity style={[styles.chip, { borderColor: Colors.g2 }]}>
            <Ionicons name="download-outline" size={14} color={Colors.g2} />
            <Text style={[styles.chipText, { color: Colors.g2, marginLeft: 4 }]}>Export</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Transaction List ── */}
      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => setPage(p => p + 1)}
        onEndReachedThreshold={0.3}
        renderItem={({ item: group }) => (
          <View>
            <Text style={styles.dateLabel}>{group.date}</Text>
            {group.data.map(txn => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                onPress={() => openDetail(txn)}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />

      {/* ── Transaction Detail Modal ── */}
      <Modal visible={showDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={['#1e1b4b', '#0f172a']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.modalHandle} />

            {selectedTxn && (
              <View style={styles.modalContent}>
                <View style={[
                  styles.detailIconBox,
                  { backgroundColor: selectedTxn.type === 'credit' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)' }
                ]}>
                  <Ionicons
                    name={selectedTxn.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                    size={28}
                    color={selectedTxn.type === 'credit' ? Colors.greenBright : Colors.red}
                  />
                </View>

                <Text style={styles.detailName}>{selectedTxn.name}</Text>
                <Text style={[
                  styles.detailAmount,
                  { color: selectedTxn.type === 'credit' ? Colors.greenBright : Colors.red }
                ]}>
                  {selectedTxn.type === 'credit' ? '+' : '-'}₦{Math.abs(selectedTxn.amount).toLocaleString()}
                </Text>
                <Text style={styles.detailDate}>{selectedTxn.date}</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{selectedTxn.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reference</Text>
                  <Text style={styles.detailValue}>TXN_{selectedTxn.id.toUpperCase()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>MID-Hash</Text>
                  <Text style={styles.detailValue}>0x{Math.random().toString(16).slice(2, 10)}</Text>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDetail(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: '#fff', marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14, gap: 8,
  },
  searchInput: {
    flex: 1, color: '#fff', fontFamily: 'Inter_400', fontSize: 14,
  },
  filterScroll: { flexDirection: 'row', marginBottom: 4 },
  chip: {
    paddingVertical: 7, paddingHorizontal: 16, borderRadius: Radii.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  chipActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  chipText: { fontSize: 12, fontFamily: 'Inter_500', color: 'rgba(255,255,255,0.6)' },
  chipTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 120 },
  dateLabel: {
    fontSize: 11, fontFamily: 'Inter_600', color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: 0.6,
    paddingVertical: 10, paddingHorizontal: 4,
  },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_400', fontSize: 14, marginTop: 12 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden', minHeight: 420,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center', marginTop: 12, marginBottom: 20,
  },
  modalContent: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  detailIconBox: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  detailName: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff', marginBottom: 4 },
  detailAmount: { fontFamily: 'BricolageGrotesque_600', fontSize: 32, marginBottom: 4 },
  detailDate: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
    paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  detailLabel: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  detailValue: { fontFamily: 'Inter_500', fontSize: 13, color: '#fff' },
  statusBadge: {
    backgroundColor: 'rgba(74,222,128,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
  },
  statusText: { fontFamily: 'Inter_500', fontSize: 11, color: Colors.greenBright },
  closeBtn: {
    marginTop: 24, width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  closeBtnText: { fontFamily: 'Inter_600', fontSize: 14, color: '#fff' },
});
