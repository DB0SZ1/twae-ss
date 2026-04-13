import { Stack } from 'expo-router';

export default function SavingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create-pocket" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="fund" />
      <Stack.Screen name="auto-save" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
