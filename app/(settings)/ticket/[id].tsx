/**
 * twae — Ticket Detail Screen
 * Chat bubble thread.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchTicketDetails, replyToTicket, rateTicket } from '../../../controllers/supportController';
import AppHeader from '../../../components/layouts/AppHeader';
import AppButton from '../../../components/atoms/AppButton';
import { Colors, Radii } from '../../../constants/theme';

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [stars, setStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const pollTimer = useRef<any>(null);

  useEffect(() => {
    if (id) loadData();
    
    // Poll for new Agent Messages if ticket is open
    pollTimer.current = setInterval(() => {
       if (ticket && ticket.status !== 'resolved' && ticket.status !== 'closed') {
         loadData(false);
       }
    }, 15000);

    return () => clearInterval(pollTimer.current);
  }, [id, ticket?.status]);

  const loadData = async (showLoad = true) => {
    if (showLoad) setLoading(true);
    try {
      const res = await fetchTicketDetails(id as string);
      setTicket(res);
      if (res.status === 'resolved' && !res.rating && !showRating) {
        setShowRating(true); // Agent resolved it, ask for rating
      }
    } catch(e) {
      // ignore
    } finally {
      if (showLoad) setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!replyMsg.trim()) return;
    setSending(true);
    try {
      const newMsg = await replyToTicket(id as string, { body: replyMsg });
      setReplyMsg('');
      setTicket((prev: any) => ({
        ...prev,
        messages: [...(prev.messages || []), newMsg]
      }));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch(err: any) {
      Alert.alert('Could not send message', err.message);
    } finally {
      setSending(false);
    }
  };

  const submitRating = async () => {
    if (stars === 0) return Alert.alert('Required', 'Please select a star rating');
    setLoading(true);
    try {
      await rateTicket(id as string, stars, ratingComment);
      setShowRating(false);
      Alert.alert('Thank You', 'Your feedback has been recorded.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setLoading(false);
    }
  };

  if (loading && !ticket) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.gsheen} size="large" />
      </View>
    );
  }

  if (!ticket) return null;

  return (
    <View style={styles.container}>
      <AppHeader title={`Ticket #${(id as string).substring(3, 10).toUpperCase()}`} />

      <KeyboardAvoidingView 
        style={styles.keyboardWrap} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollRef}
          contentContainerStyle={styles.body} 
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Issue Header */}
          <View style={styles.issueHeader}>
            <Text style={styles.issueCat}>{ticket.category.toUpperCase()}</Text>
            <Text style={styles.issueSub}>{ticket.subject}</Text>
            <Text style={styles.issueDesc}>{ticket.description}</Text>
          </View>

          <View style={styles.messagesWrap}>
            {ticket.messages?.map((msg: any) => {
              const isUser = msg.sender === 'user';
              return (
                <View key={msg.id} style={[styles.bubbleWrap, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
                  {!isUser && (
                    <View style={styles.agentAvatar}>
                      <Ionicons name="headset" size={14} color="#fff" />
                    </View>
                  )}
                  <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
                    <Text style={[styles.bubbleText, isUser && { color: '#fff' }]}>{msg.body}</Text>
                    {msg.attachment_url && (
                      <View style={styles.attachmentBox}>
                        <Ionicons name="image" size={16} color={isUser ? '#fff' : Colors.gsheen} />
                        <Text style={isUser ? {color:'#fff', fontSize: 12} : {color:Colors.gsheen, fontSize: 12}}>Attachment</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Input Bar */}
        {(ticket.status === 'open') ? (
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn}>
              <Ionicons name="add" size={24} color={Colors.muted} />
            </TouchableOpacity>
            <TextInput
              style={styles.inputField}
              placeholder="Type your reply..."
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={replyMsg}
              onChangeText={setReplyMsg}
              multiline
            />
            {sending ? (
              <ActivityIndicator color={Colors.gsheen} style={{ paddingHorizontal: 12 }} />
            ) : (
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={!replyMsg.trim()}>
                <Ionicons name="send" size={20} color={replyMsg.trim() ? Colors.gsheen : Colors.dim} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.resolvedBar}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.dim} />
            <Text style={styles.resolvedText}>This ticket is {ticket.status}. Replied are disabled.</Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Star Rating Modal on Close */}
      <Modal visible={showRating} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Ionicons name="star-half-outline" size={48} color={Colors.gold1} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Rate your support</Text>
            <Text style={styles.modalSub}>How would you rate the resolution provided by our agent?</Text>

            <View style={styles.starRow}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setStars(s)}>
                  <Ionicons name={stars >= s ? "star" : "star-outline"} size={36} color={Colors.gold1} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Any additional comments?"
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
            />

            <AppButton label="Submit Feedback" onPress={submitRating} disabled={stars === 0} />
            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => setShowRating(false)}>
              <Text style={{ fontFamily: 'Inter_500', color: Colors.dim }}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  keyboardWrap: { flex: 1 },
  body: { padding: 20, paddingBottom: 20 },
  issueHeader: { backgroundColor: '#fff', borderRadius: Radii.md, padding: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', marginBottom: 24 },
  issueCat: { fontFamily: 'Inter_600', fontSize: 10, color: Colors.dim, letterSpacing: 0.5, marginBottom: 8 },
  issueSub: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginBottom: 12 },
  issueDesc: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 20 },
  messagesWrap: { paddingBottom: 20 },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, maxWidth: '85%' },
  bubbleRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  bubbleLeft: { alignSelf: 'flex-start', justifyContent: 'flex-start' },
  bubble: { padding: 14, borderRadius: 18 },
  bubbleUser: { backgroundColor: Colors.gsheen, borderBottomRightRadius: 4 },
  bubbleAgent: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  bubbleText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.text, lineHeight: 20 },
  agentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.dim, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  attachmentBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)', backgroundColor: '#fff' },
  attachBtn: { padding: 8, marginRight: 4, marginBottom: 4 },
  inputField: { flex: 1, maxHeight: 100, minHeight: 40, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  sendBtn: { padding: 12, marginLeft: 4, marginBottom: 2 },
  resolvedBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)', backgroundColor: '#fafafa' },
  resolvedText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.dim },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: Colors.text, textAlign: 'center', marginBottom: 6 },
  modalSub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  starRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 32 },
  modalInput: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 12, height: 80, padding: 16, fontFamily: 'Inter_400', fontSize: 14, marginBottom: 24 }
});
