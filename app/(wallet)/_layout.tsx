import { Stack } from 'expo-router';

export default function WalletLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-money" />
      <Stack.Screen name="send" />
      <Stack.Screen name="beneficiaries" />
      <Stack.Screen name="fx-convert" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="receipt" />
      <Stack.Screen name="schedule" />
    </Stack>
  );
}
