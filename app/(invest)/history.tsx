import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors } from '../../constants/theme';
import { fetchOrderHistory } from '../../controllers/investController';
import { useCurrency } from '../../hooks/useCurrency';

export default function InvestHistoryScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    fetchOrderHistory().then(data => {
      setOrders(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader title="Investment History" />
      <ScrollView contentContainerStyle={styles.body}>
        {loading ? (
          <ActivityIndicator color={Colors.g3} style={{marginTop: 50}} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No History found</Text>
            <Text style={styles.emptySub}>You haven't made any investments yet.</Text>
          </View>
        ) : (
          orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
               <View style={styles.orderLeft}>
                 <Text style={styles.orderType}>{order.type.toUpperCase()} {order.asset.symbol}</Text>
                 <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
               </View>
               <View style={styles.orderRight}>
                 <Text style={styles.orderTotal}>{format(order.totalAmount, order.currency)}</Text>
                 <Text style={styles.orderStatus}>{order.status}</Text>
               </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  emptyWrap: { marginTop: 60, alignItems: 'center' },
  emptyTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginBottom: 8 },
  emptySub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted },
  orderCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  orderLeft: {},
  orderRight: { alignItems: 'flex-end' },
  orderType: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  orderDate: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginTop: 4 },
  orderTotal: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  orderStatus: { fontFamily: 'Inter_600', fontSize: 12, color: Colors.greenBright, marginTop: 4, textTransform: 'capitalize' },
});
