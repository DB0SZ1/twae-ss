/**
 * ProfileChecklist — Profile completion card for the dashboard
 * Shows remaining onboarding steps (phone verify, PIN, KYC, bank link)
 * Tapping a step navigates to its screen
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '../../constants/theme';

export interface ChecklistStep {
  key: string;
  label: string;
  done: boolean;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ProfileChecklistProps {
  steps: ChecklistStep[];
}

export default function ProfileChecklist({ steps }: ProfileChecklistProps) {
  const router = useRouter();
  const completed = steps.filter(s => s.done).length;
  const total = steps.length;
  const progress = total > 0 ? completed / total : 0;
  const allDone = completed === total;

  if (allDone) return null; // Don't show if all steps are complete

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(50,100,209,0.06)', 'rgba(50,100,209,0.02)']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Complete your profile</Text>
            <Text style={styles.subtitle}>
              {completed}/{total} steps done — unlock full access
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Steps */}
        <View style={styles.stepsList}>
          {steps.map(step => (
            <TouchableOpacity
              key={step.key}
              style={[styles.stepRow, step.done && styles.stepRowDone]}
              activeOpacity={step.done ? 1 : 0.7}
              onPress={() => {
                if (!step.done) {
                  router.push(step.route as any);
                }
              }}
            >
              <View style={[styles.stepIcon, step.done && styles.stepIconDone]}>
                <Ionicons
                  name={step.done ? 'checkmark' : step.icon}
                  size={16}
                  color={step.done ? '#fff' : Colors.g3}
                />
              </View>
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                {step.label}
              </Text>
              {!step.done && (
                <Ionicons name="chevron-forward" size={16} color={Colors.dim} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gradient: {
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Inter_400',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  progressCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(50,100,209,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.g3,
  },
  progressPct: {
    fontFamily: 'Inter_600',
    fontSize: 11,
    color: Colors.g3,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.g3,
  },
  stepsList: {
    gap: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  stepRowDone: {
    opacity: 0.5,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(50,100,209,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: Colors.greenBright,
  },
  stepLabel: {
    flex: 1,
    fontFamily: 'Inter_500',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  stepLabelDone: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.4)',
  },
});
