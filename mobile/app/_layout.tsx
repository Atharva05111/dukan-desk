import { Stack } from 'expo-router';

export default function RootLayout() {
  // TODO: wrap with QueryClientProvider (react-query) and an auth guard
  // that redirects to /login if no session is found.
  return <Stack screenOptions={{ headerShown: false }} />;
}
