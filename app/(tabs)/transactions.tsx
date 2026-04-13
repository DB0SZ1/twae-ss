/**
 * twae — Transactions Screen
 * Full paginated transaction history with filters
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import TransactionRow from '../../components/molecules/TransactionRow';
import { Colors, Fonts, FontSizes, Radii, Spacing, Shadows } from '../../constants/theme';
import { transactions } from '../../constants/mockData';

const filters = ['All', 'Debits', 'Credits', 'Savings', 'Investments'];

export default function TransactionsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeCurrency, setActiveCurrency] = useState<'ngn' | 'usd'>('ngn');

  const filtered = transactions.filter(txn => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Debits') return txn.type === 'debit';
    if (activeFilter === 'Credits') return txn.type === 'credit';
    if (activeFilter === 'Savings') return txn.category === 'savings';
    if (activeFilter === 'Investments') return txn.category === 'investment';
    return true;
  });

  // Group by date
  const grouped: Record<string, typeof transactions> = {};
  filtered.forEach(txn => {
    if (!grouped[txn.date]) grouped[txn.date] = [];
    grouped[txn.date].push(txn);
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <LinearGradient
        colors={['#1a3575', '#3264d1', '#001a0d']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.top}
      >
        <Text style={styles.title}>Transactions</Text>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Transaction List */}
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(grouped).map(([date, txns]) => (
          <View key={date}>
            <Text style={styles.dateGroup}>{date}</Text>
            {txns.map(txn => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                onPress={() => {}}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  top: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  title: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 24,
    color: '#fff',
    marginBottom: 14,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.15)',
    backgroundColor: 'rgba(255,255,255,.05)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.g2,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter_500',
    color: 'rgba(255,255,255,.6)',
  },
  filterTextActive: {
    color: '#fff',
  },
  currencyWrap: {
    alignItems: 'center',
  },
  currencyPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,.3)',
    borderRadius: Radii.pill,
    padding: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  currTab: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: Radii.pill,
  },
  currTabActive: {
    backgroundColor: Colors.g2,
  },
  currTabText: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque_600',
    color: 'rgba(255,255,255,.5)',
  },
  currTabTextActive: {
    color: '#fff',
  },
  body: {
    padding: 16,
    paddingBottom: 120,
  },
  dateGroup: {
    fontSize: 11,
    fontFamily: 'Inter_600',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
