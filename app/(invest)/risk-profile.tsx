/**
 * twae — Risk Profile Questionnaire
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
const riskProfileQuestions: any[] = [];
import { submitRiskProfile } from '../../controllers/investController';

export default function RiskProfileScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const q = riskProfileQuestions[step];
  const isLast = step === riskProfileQuestions.length - 1;

  const [result, setResult] = useState<{riskLevel: string; recommendedAllocation: string} | null>(null);

  const handleSelect = (i: number) => {
    const next = [...answers];
    next[step] = i;
    setAnswers(next);
  };

  const handleNext = async () => {
    if (isLast) {
      try {
        setLoading(true);
        // Calculate mock score
        const totalScore = answers.reduce((acc, curr) => acc + (curr + 1) * 2, 0); // basic mock logic (2, 4, 6)
        const profile = await submitRiskProfile(totalScore);
        setResult(profile);
      } catch (err) {
        console.error('Profile failed', err);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Risk Profile" />
      <View style={styles.body}>
        {result ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Your Profile: {result.riskLevel.toUpperCase()}</Text>
              <Text style={styles.resultText}>MicroDest Vault Recommendation:</Text>
              <Text style={styles.resultValue}>{result.recommendedAllocation}</Text>
            </View>
            <AppButton label="Done" onPress={() => router.back()} style={{ marginTop: 24 }} />
          </View>
        ) : (
          <View>
            <View style={styles.progressWrap}>
              {riskProfileQuestions.map((_, i) => (
                <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
              ))}
            </View>
            <Text style={styles.question}>{q.question}</Text>
            {q.options.map((opt, i) => (
              <TouchableOpacity key={i} style={[styles.option, answers[step] === i && styles.optionActive]} onPress={() => handleSelect(i)}>
                <Text style={[styles.optionText, answers[step] === i && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <AppButton label={isLast ? 'Submit Profile' : 'Next'} onPress={handleNext} loading={loading} disabled={answers[step] === undefined} style={{ marginTop: 24 }} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  progressWrap: { flexDirection: 'row', gap: 6, marginBottom: 32 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.blackAlpha05 },
  progressDotActive: { backgroundColor: Colors.g3 },
  question: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.text, lineHeight: 28, marginBottom: 24 },
  option: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.blackAlpha05, marginBottom: 8 },
  optionActive: { borderColor: Colors.g3, backgroundColor: 'rgba(50,100,209,.06)' },
  optionText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text },
  optionTextActive: { color: Colors.g3 },
  resultCard: { backgroundColor: Colors.surface, padding: 24, borderRadius: Radii.card, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  resultTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 16 },
  resultText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.dim, marginBottom: 8 },
  resultValue: { fontFamily: 'Inter_600', fontSize: 16, color: Colors.g3, lineHeight: 24 }
});
