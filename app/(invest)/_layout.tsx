import { Stack } from 'expo-router';

export default function InvestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="discovery" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="buy" />
      <Stack.Screen name="sell" />
      <Stack.Screen name="portfolio" />
      <Stack.Screen name="history" />
      <Stack.Screen name="risk-profile" />
    </Stack>
  );
}
