/**
 * Twae — Linked Bank Accounts (real API)
 * GET /bank/linked for listing, navigates to bank-link for adding.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Shadows } from '../../constants/theme';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { getLinkedBanks, LinkedBank } from '../../controllers/bankController';
import { getUserProfile } from '../../controllers/authController';
import { useRouter } from 'expo-router';

export default function BankAccountsScreen() {
  const router = useRouter();
  const [banks, setBanks] = useState<LinkedBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState('NG');

  useEffect(() => {
    async function fetchBanks() {
      try {
        const user = await getUserProfile();
        setCountryCode(user.country_code || 'NG');
        const b = await getLinkedBanks(user.id);
        setBanks(b);
      } catch (err) {
        console.warn('Banks fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader title="Linked Banks" />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.g3} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.body}>
        {banks.length === 0 ? (
          <View style={{ alignItems: 'center', marginVertical: 30 }}>
            <Text style={{ fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted }}>No bank accounts linked yet.</Text>
          </View>
        ) : (
          banks.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{b.bankName}</Text>
                {b.isPrimary && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>Primary</Text>
                  </View>
                )}
              </View>
              <Text style={styles.acct}>···· {b.accountMask} · {b.accountName}</Text>
            </View>
          ))
        )}
        <AppButton
          label="+ Link New Bank"
          onPress={() => router.push({ pathname: '/(onboarding)/bank-link', params: { countryCode } })}
          variant="secondary"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  acct: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted },
  activeBadge: { backgroundColor: 'rgba(74,222,128,.1)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  activeText: { fontFamily: 'Inter_500', fontSize: 10, color: Colors.greenBright },
});
