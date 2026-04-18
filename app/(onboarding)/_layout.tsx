import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="confirm-pin" />
      <Stack.Screen name="kyc-identity" />
      <Stack.Screen name="kyc-docs" />
      <Stack.Screen name="bank-link" />
      <Stack.Screen name="investment-options" />
    </Stack>
  );
}
