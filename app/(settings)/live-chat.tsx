import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import { Colors, Radii } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LiveChatScreen() {
  const [msg, setMsg] = useState('');

  return (
    <View style={styles.container}>
      <AppHeader title="Live Chat" />
      <ScrollView contentContainerStyle={styles.chatArea}>
        <View style={styles.chip}><Text style={styles.chipText}>Connecting to an agent...</Text></View>
        <View style={styles.messageAgent}>
          <Ionicons name="headset" size={20} color={Colors.g2} />
          <View style={styles.bubbleAgent}>
            <Text style={styles.bubbleTextAgent}>Hi there! Welcome to twae support. How can I help you today?</Text>
          </View>
        </View>
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
          <View style={{flex: 1}}>
            <AppInput label="" value={msg} onChangeText={setMsg} placeholder="Type your message..." />
          </View>
          <TouchableOpacity style={styles.sendBtn}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  chatArea: { flexGrow: 1, padding: 16 },
  chip: { alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, backgroundColor: Colors.surface, marginBottom: 20 },
  chipText: { fontSize: 11, color: Colors.dim, fontFamily: 'Inter_400' },
  messageAgent: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '80%' },
  bubbleAgent: { backgroundColor: Colors.card, padding: 12, borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  bubbleTextAgent: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.text, lineHeight: 20 },
  inputArea: { flexDirection: 'row', padding: 16, paddingBottom: 30, backgroundColor: Colors.card, borderTopWidth: 1, borderColor: Colors.blackAlpha04, alignItems: 'center', gap: 12 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.g2, alignItems: 'center', justifyContent: 'center' },
});
