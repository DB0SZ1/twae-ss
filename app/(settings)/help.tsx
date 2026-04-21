/**
 * twae — Help & Support Screen
 * Full support hub unifying live chat, ticket system overviews, and deep search FAQs.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchFAQs, fetchTickets } from '../../controllers/supportController';
import { Colors, Radii } from '../../constants/theme';
import AppHeader from '../../components/layouts/AppHeader';

interface FAQ {
  category: string;
  question: string;
  answer: string;
  view_count: number;
}

export default function HelpScreen() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [activeChip, setActiveChip] = useState('All');
  const [ticketCount, setTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      const [faqData, ticketData] = await Promise.all([
        fetchFAQs(),
        fetchTickets('open')
      ]);
      setFaqs(faqData);
      setTicketCount(ticketData.length || 0);
    } catch (err: any) {
      console.warn("Could not load support data", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchQ.toLowerCase()) || f.answer.toLowerCase().includes(searchQ.toLowerCase());
    const matchesCat = activeChip === 'All' || f.category === activeChip;
    return matchesSearch && matchesCat;
  });

  const handleLiveChat = async () => {
    try {
      Alert.alert('Live Chat', 'Intercom/Zendesk window will open over this view natively.');
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Help & Support" />
      
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        
        {/* Support Tools Box */}
        <View style={styles.toolsRow}>
          <TouchableOpacity 
            style={[styles.toolCard, { backgroundColor: 'rgba(50, 100, 209, 0.05)' }]} 
            onPress={() => router.push('/(settings)/tickets')}
          >
            <View style={styles.toolIconWrap}><Ionicons name="ticket" size={20} color={Colors.gsheen} /></View>
            <Text style={styles.toolTitle}>My Tickets</Text>
            {ticketCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{ticketCount}</Text></View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toolCard, { backgroundColor: 'rgba(16, 185, 129, 0.05)' }]} 
            onPress={handleLiveChat}
          >
            <View style={styles.toolIconWrap}><Ionicons name="chatbubbles" size={20} color={Colors.greenBright} /></View>
            <Text style={styles.toolTitle}>Live Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="rgba(0,0,0,0.3)" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search our knowledge base..."
            value={searchQ}
            onChangeText={setSearchQ}
            style={styles.searchInput}
          />
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {categories.map(c => (
            <TouchableOpacity key={c} style={[styles.chip, activeChip === c && styles.chipActive]} onPress={() => setActiveChip(c)}>
              <Text style={[styles.chipText, activeChip === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* FAQ Results */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {loading ? (
          <ActivityIndicator color={Colors.gsheen} style={{ marginTop: 24 }} />
        ) : filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, i) => (
             <TouchableOpacity key={i} style={styles.faqCard} onPress={() => Alert.alert(faq.question, faq.answer)}>
               <View style={styles.faqCardHeader}>
                 <Text style={styles.faqCat}>{faq.category}</Text>
                 <Ionicons name="chevron-forward" size={14} color="rgba(0,0,0,0.3)" />
               </View>
               <Text style={styles.faqQuestion}>{faq.question}</Text>
             </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyWrap}>
             <Text style={styles.emptyText}>No articles found matching "{searchQ}".</Text>
          </View>
        )}

        {/* Still Need Help Nudge */}
        <TouchableOpacity style={styles.nudgeBtn} onPress={() => router.push('/(settings)/create-ticket')}>
           <LinearGradient colors={['#3264d1', '#1a3575']} style={[StyleSheet.absoluteFillObject, { borderRadius: Radii.md }]} />
           <Text style={styles.nudgeTitle}>Still need help?</Text>
           <Text style={styles.nudgeSub}>Raise a support ticket right now.</Text>
           <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.nudgeIcon} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 20, paddingBottom: 60 },
  toolsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  toolCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  toolIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  toolTitle: { fontFamily: 'Inter_600', fontSize: 13, color: Colors.text },
  badge: { position: 'absolute', top: 12, right: 12, backgroundColor: Colors.red, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontFamily: 'Inter_600', fontSize: 10, color: '#fff' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 16, shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  chipScroll: { gap: 8, paddingBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  chipActive: { backgroundColor: Colors.gsheen, borderColor: Colors.gsheen },
  chipText: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.dim },
  chipTextActive: { color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 16 },
  sectionTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text, marginBottom: 16 },
  faqCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  faqCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  faqCat: { fontFamily: 'Inter_600', fontSize: 10, color: Colors.gsheen, textTransform: 'uppercase', letterSpacing: 0.5 },
  faqQuestion: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text, lineHeight: 20 },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted },
  nudgeBtn: { marginTop: 24, padding: 24, borderRadius: Radii.md, overflow: 'hidden' },
  nudgeTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff', marginBottom: 4 },
  nudgeSub: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  nudgeIcon: { position: 'absolute', right: 24, top: '50%', transform: [{translateY: 8}] }
});
