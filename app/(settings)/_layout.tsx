import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="change-pin" />
      <Stack.Screen name="2fa" />
      <Stack.Screen name="active-sessions" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="live-chat" />
      <Stack.Screen name="faqs" />
      <Stack.Screen name="security" />
      <Stack.Screen name="bank-accounts" />
      <Stack.Screen name="limits" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
