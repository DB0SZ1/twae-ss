/**
 * twae — Create Ticket Screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createTicket } from '../../controllers/supportController';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';

export default function CreateTicketScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCats, setShowCats] = useState(false);

  const categories = ['Payments & Transfers', 'Investments', 'Account & Security', 'KYC Verification', 'General Inquiry'];

  const handleSubmit = async () => {
    if (!category) return Alert.alert('Required', 'Please select a category');
    if (subject.length < 10) return Alert.alert('Required', 'Subject must be at least 10 characters');
    if (desc.length < 30) return Alert.alert('Required', 'Please provide a more detailed description (min 30 characters)');

    setLoading(true);
    try {
      const res = await createTicket({
        category,
        subject,
        description: desc,
      });
      // push to tickets list 
      Alert.alert('Ticket Created', `Your ticket #${res.id.substring(3, 8).toUpperCase()} has been opened. We will reply within 24h.`, [
        { text: 'View Tickets', onPress: () => router.replace('/(settings)/tickets') }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    if (subject || desc) {
      Alert.alert('Discard?', 'Your typed progress will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() }
      ]);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header to handle custom back logic */}
      <View style={styles.header}>
        <TouchableOpacity onPress={cancel} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise a Ticket</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        <Text style={styles.fieldLabel}>Category</Text>
        <TouchableOpacity style={styles.dropdownLine} onPress={() => setShowCats(!showCats)}>
          <Text style={[styles.dropText, !category && { color: Colors.dim }]}>
            {category || 'Select an issue category'}
          </Text>
          <Ionicons name={showCats ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.dim} />
        </TouchableOpacity>
        
        {showCats && (
          <View style={styles.catBox}>
            {categories.map(c => (
              <TouchableOpacity 
                key={c} 
                style={styles.catItem}
                onPress={() => { setCategory(c); setShowCats(false); }}
              >
                <Text style={styles.catItemText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.fieldLabel}>Subject Line</Text>
        <TextInput
          style={styles.inputLine}
          placeholder="Brief summary of the issue"
          placeholderTextColor="rgba(0,0,0,0.3)"
          value={subject}
          onChangeText={setSubject}
        />
        <Text style={styles.charCount}>{subject.length}/10 min</Text>

        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={styles.inputArea}
          placeholder="Please provide as much detail as possible to help us resolve the issue quickly..."
          placeholderTextColor="rgba(0,0,0,0.3)"
          multiline
          textAlignVertical="top"
          value={desc}
          onChangeText={setDesc}
        />
        <Text style={styles.charCount}>{desc.length}/30 min</Text>

        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="image-outline" size={20} color={Colors.gsheen} />
          <Text style={styles.attachText}>Attach Screenshot (Optional)</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 32 }}>
          {loading ? (
             <ActivityIndicator color={Colors.gsheen} size="large" />
          ) : (
            <AppButton label="Submit Ticket" onPress={handleSubmit} />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: Colors.bg },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text },
  body: { padding: 20, paddingBottom: 80 },
  fieldLabel: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.text, marginBottom: 8, marginTop: 16 },
  dropdownLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', height: 52, borderRadius: Radii.sm, paddingHorizontal: 16 },
  dropText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  catBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: Radii.sm, marginTop: 4, overflow: 'hidden' },
  catItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  catItemText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  inputLine: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', height: 52, borderRadius: Radii.sm, paddingHorizontal: 16, fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  inputArea: { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', height: 160, borderRadius: Radii.sm, padding: 16, fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  charCount: { fontFamily: 'Inter_400', fontSize: 10, color: Colors.muted, textAlign: 'right', marginTop: 6 },
  attachBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(50,100,209,0.08)', padding: 16, borderRadius: Radii.sm, marginTop: 16, borderWidth: 1, borderColor: 'rgba(50,100,209,0.1)' },
  attachText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.gsheen },
});
