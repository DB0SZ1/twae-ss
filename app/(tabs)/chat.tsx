import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { storage as SecureStore } from '../../utils/storage';
import { Colors, Radii } from '../../constants/theme';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Twae, your Unified Platform Agent. I can explain your recent investments, analyze market conditions, or help you with support tickets. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    Keyboard.dismiss();
    
    const userMsg = input.trim();
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: userMsg };
    setMessages(prev => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const token = await SecureStore.getItemAsync('twa_token');
      
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_BASE}/twa/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query: userMsg, history })
      });

      if (!response.ok) throw new Error('Failed to reach Twae AI');

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply
      }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the routing engine right now. Please check your network or try again in a few minutes."
      }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Bot size={18} color={Colors.blue} />
          </View>
        )}
        
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAssistant]}>
            {item.content}
          </Text>
        </View>

        {isUser && (
          <View style={[styles.avatar, styles.avatarUser]}>
            <User size={18} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Blue Header ── */}
      <LinearGradient
        colors={['#1a3575', '#3264d1', '#000c26']}
        start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Twae Insight</Text>
        <Text style={styles.headerSub}>AI Financial Analyst & Support</Text>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      />

      <BlurView intensity={80} tint="light" style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) + 70 }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.9)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={styles.inputInner}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about your portfolio or get help..."
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={300}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
               <ActivityIndicator size="small" color="#fff" />
            ) : (
               <Send size={18} color={input.trim() ? '#fff' : 'rgba(255,255,255,0.8)'} />
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  listContent: { padding: 20, paddingTop: 30 },
  messageWrapper: { flexDirection: 'row', marginBottom: 24, alignItems: 'flex-end' },
  wrapperUser: { justifyContent: 'flex-end' },
  wrapperAssistant: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(50, 100, 209, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(50, 100, 209, 0.2)' },
  avatarUser: { backgroundColor: Colors.g2, borderColor: Colors.g2, marginLeft: 12 },
  bubble: { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  bubbleUser: { backgroundColor: Colors.g2, borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, marginLeft: 12, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  messageText: { fontFamily: 'Inter_400', fontSize: 15, lineHeight: 22 },
  textUser: { color: '#fff' },
  textAssistant: { color: Colors.text },
  inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.blackAlpha04 },
  inputInner: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Colors.surface, borderRadius: 24, paddingHorizontal: 6, paddingVertical: 6, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  textInput: { flex: 1, minHeight: 40, maxHeight: 120, color: Colors.text, fontFamily: 'Inter_400', fontSize: 15, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.g2, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: Colors.blackAlpha15 }
});
