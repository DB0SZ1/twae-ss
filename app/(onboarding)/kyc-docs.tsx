/**
 * twae — KYC Documents Upload Screen (Screen 1.5b)
 * Camera permission flow, gov ID front+back capture, liveness selfie
 * Upload progress indicator, retry on failure
 * Step 2/3 progress bar
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { uploadDocument, performLivenessCheck } from '../../controllers/kycController';
import * as ImagePicker from 'expo-image-picker';

const IS_DEV = process.env.EXPO_PUBLIC_APP_ENV === 'development' || __DEV__;

type DocStep = 'permission' | 'capture' | 'uploading' | 'done';

export default function KYCDocsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; countryCode?: string }>();

  const [cameraGranted, setCameraGranted] = useState(false);
  const [idFront, setIdFront] = useState(false);
  const [idBack, setIdBack] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeUpload, setActiveUpload] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const fadeIn = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.timing(progressWidth, { toValue: 66, duration: 600, useNativeDriver: false }).start();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setCameraGranted(status === 'granted');
    if (status !== 'granted') {
      Alert.alert(
        'Camera Access Required',
        'twae needs camera access to capture your government ID and verify your identity through a selfie.',
        [{ text: 'OK' }]
      );
    }
  };

  const simulateCapture = async (docType: 'id_front' | 'id_back' | 'selfie') => {
    if (!cameraGranted) {
      requestCameraPermission();
      return;
    }

    setUploadError('');
    setActiveUpload(docType);
    setUploadProgress(0);

    try {
      const resultAction = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (resultAction.canceled) {
        setActiveUpload(null);
        return;
      }

      setUploadProgress(10); // Fake quick progress init
      const base64Data = resultAction.assets[0].base64 || 'dummy_base64';

      const result = await uploadDocument(
        params.userId || 'demo_user',
        docType,
        base64Data,
        (pct) => setUploadProgress(pct)
      );

      if (result.success) {
        if (docType === 'id_front') setIdFront(true);
        if (docType === 'id_back') setIdBack(true);
        if (docType === 'selfie') {
          // Also run liveness check
          const liveness = await performLivenessCheck(params.userId || 'demo_user', base64Data);
          if (liveness.success) {
            setSelfie(true);
          } else {
            setUploadError('Liveness check failed. Please try again.');
            return;
          }
        }
      }
    } catch (err: any) {
      setUploadError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setActiveUpload(null);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Documents already uploaded; just navigate
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(onboarding)/investment-options',
        params: { userId: params.userId, countryCode: params.countryCode },
      });
    }, 1000);
  };

  const DocSlot = ({
    label,
    subtitle,
    done,
    docType,
    isUploading,
    progress,
  }: {
    label: string;
    subtitle: string;
    done: boolean;
    docType: 'id_front' | 'id_back' | 'selfie';
    isUploading: boolean;
    progress: number;
  }) => (
    <TouchableOpacity
      style={[styles.docSlot, done && styles.docSlotDone]}
      onPress={() => !done && !isUploading && simulateCapture(docType)}
      activeOpacity={0.7}
      disabled={done || isUploading}
    >
      <View style={[styles.docIcon, done && styles.docIconDone]}>
        <Ionicons
          name={done ? 'checkmark' : docType === 'selfie' ? 'person' : 'camera'}
          size={24}
          color={done ? '#fff' : Colors.g3}
        />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={styles.docStatus}>
          {isUploading ? `Uploading… ${progress}%` : done ? 'Captured ✓' : subtitle}
        </Text>
      </View>
      {isUploading && (
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      )}
      {!done && !isUploading && (
        <Ionicons name="chevron-forward" size={18} color={Colors.dim} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Document Upload" />

      {/* Progress bar — Step 2/3 */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, {
          width: progressWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }]} />
        <Text style={styles.progressLabel}>Step 2 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn }}>
          <Text style={styles.title}>Upload documents</Text>
          <Text style={styles.sub}>
            Take photos of your government-issued ID and a selfie for liveness verification.
          </Text>

          {/* Camera permission card */}
          {!cameraGranted && (
            <TouchableOpacity style={styles.permissionCard} onPress={requestCameraPermission} activeOpacity={0.8}>
              <View style={styles.permissionIcon}>
                <Ionicons name="camera" size={28} color={Colors.g3} />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>Camera Permission</Text>
                <Text style={styles.permissionSub}>
                  We need camera access to capture your ID and selfie. Your photos are encrypted and stored securely.
                </Text>
              </View>
              <AppButton label="Allow Camera" onPress={requestCameraPermission} size="sm" style={{ marginTop: 12 }} />
            </TouchableOpacity>
          )}

          {/* Document slots */}
          <DocSlot
            label="Government ID — Front"
            subtitle="Tap to capture front of your ID"
            done={idFront}
            docType="id_front"
            isUploading={activeUpload === 'id_front'}
            progress={activeUpload === 'id_front' ? uploadProgress : 0}
          />
          <DocSlot
            label="Government ID — Back"
            subtitle="Tap to capture back of your ID"
            done={idBack}
            docType="id_back"
            isUploading={activeUpload === 'id_back'}
            progress={activeUpload === 'id_back' ? uploadProgress : 0}
          />

          {/* Selfie with liveness guide */}
          <View style={styles.selfieSection}>
            <DocSlot
              label="Liveness Selfie"
              subtitle="Follow the face guide to verify identity"
              done={selfie}
              docType="selfie"
              isUploading={activeUpload === 'selfie'}
              progress={activeUpload === 'selfie' ? uploadProgress : 0}
            />
            {!selfie && (
              <View style={styles.selfieHint}>
                <Ionicons name="information-circle" size={14} color={Colors.dim} />
                <Text style={styles.selfieHintText}>
                  You'll be asked to smile during capture for liveness verification
                </Text>
              </View>
            )}
          </View>

          {/* Error */}
          {uploadError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.red} />
              <Text style={styles.errorText}>{uploadError}</Text>
              <TouchableOpacity onPress={() => setUploadError('')}>
                <Ionicons name="close" size={16} color={Colors.dim} />
              </TouchableOpacity>
            </View>
          ) : null}

          <AppButton
            label="Continue"
            onPress={handleSubmit}
            loading={loading}
            disabled={!idFront || !idBack || !selfie}
            style={{ marginTop: 16 }}
          />

          {/* Dev-mode skip */}
          {IS_DEV && (
            <AppButton
              label="Skip for now (Dev)"
              onPress={() => router.replace('/(tabs)')}
              variant="ghost"
              style={{ marginTop: 12 }}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.blackAlpha05,
    marginHorizontal: 24,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: Colors.g3, borderRadius: 2 },
  progressLabel: {
    fontFamily: 'Inter_500',
    fontSize: 11,
    color: Colors.dim,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
  content: { padding: 24, paddingTop: 16 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 20, marginBottom: 24 },
  permissionCard: {
    backgroundColor: 'rgba(50,100,209,.04)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(50,100,209,.08)',
    marginBottom: 20,
    alignItems: 'center',
  },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(50,100,209,.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  permissionInfo: { alignItems: 'center' },
  permissionTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text, marginBottom: 6 },
  permissionSub: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, textAlign: 'center', lineHeight: 18 },
  docSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.blackAlpha05,
    padding: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    gap: 14,
  },
  docSlotDone: { borderColor: Colors.greenBright, backgroundColor: 'rgba(34,197,94,.04)' },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(50,100,209,.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconDone: { backgroundColor: Colors.greenBright },
  docInfo: { flex: 1 },
  docLabel: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text, marginBottom: 3 },
  docStatus: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted },
  progressBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.blackAlpha05,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: Colors.g3 },
  selfieSection: { marginBottom: 4 },
  selfieHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginTop: -4,
    marginBottom: 12,
  },
  selfieHintText: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,.06)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,.1)',
  },
  errorText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.red, flex: 1 },
});
