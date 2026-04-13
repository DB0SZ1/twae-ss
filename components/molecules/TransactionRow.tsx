/**
 * TransactionRow — Icon, title, subtitle, amount, and date in a row
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '../../constants/theme';

interface TransactionRowProps {
  transaction: Transaction;
  onPress: () => void;
}

const categoryIcons: Record<string, { name: string; color: string }> = {
  transfer: { name: 'arrow-forward-outline', color: Colors.red },
  savings: { name: 'repeat', color: Colors.red },
  investment: { name: 'trending-up', color: Colors.greenBright },
  salary: { name: 'arrow-down-outline', color: Colors.greenBright },
  fx: { name: 'swap-horizontal', color: Colors.greenBright },
  deposit: { name: 'arrow-down-outline', color: Colors.greenBright },
  withdrawal: { name: 'arrow-forward-outline', color: Colors.red },
};

export default function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const { format } = useCurrency();
  const isDebit = transaction.type === 'debit';
  const icon = categoryIcons[transaction.category] || categoryIcons.transfer;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, isDebit ? styles.iconDebit : styles.iconCredit]}>
        <Ionicons
          name={isDebit ? 'arrow-forward-outline' : 'arrow-down-outline'}
          size={18}
          color={isDebit ? Colors.red : Colors.greenBright}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{transaction.name}</Text>
        <Text style={styles.sub} numberOfLines={1}>{transaction.description}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, isDebit ? styles.amountDebit : styles.amountCredit]}>
          {isDebit ? '-' : '+'}{format(transaction.amount, transaction.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radii.sm,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDebit: {
    backgroundColor: 'rgba(239,68,68,.12)',
  },
  iconCredit: {
    backgroundColor: 'rgba(74,222,128,.1)',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.bodyMedium,
    color: Colors.text,
  },
  sub: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.bodyRegular,
    color: Colors.dim,
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.headingSemiBold,
  },
  amountDebit: {
    color: Colors.red,
  },
  amountCredit: {
    color: Colors.greenBright,
  },
});
