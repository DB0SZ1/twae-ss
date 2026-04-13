import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import TransactionRow from '../../components/molecules/TransactionRow';
import { Colors } from '../../constants/theme';
import { transactions } from '../../constants/mockData';

export default function InvestHistoryScreen() {
  const investTxns = transactions.filter(t => t.category === 'investment');
  return (
    <View style={styles.container}>
      <AppHeader title="Investment History" />
      <ScrollView contentContainerStyle={styles.body}>
        {investTxns.map(txn => <TransactionRow key={txn.id} transaction={txn} onPress={() => {}} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
});
