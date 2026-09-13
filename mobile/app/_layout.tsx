import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';
import { isLoggedIn, useAuthStore } from '../lib/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// Public routes reachable without a session.
const PUBLIC_SEGMENTS = new Set(['login', 'signup']);

function useAuthGuard() {
  const segments = useSegments();
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const loggedIn = useAuthStore((s) => isLoggedIn(s));

  useEffect(() => {
    if (!hydrated) return;
    const top = segments[0] ?? '';
    const onPublicRoute = PUBLIC_SEGMENTS.has(top);

    if (!loggedIn && !onPublicRoute) {
      router.replace('/login');
    } else if (loggedIn && onPublicRoute) {
      router.replace('/(tabs)');
    }
  }, [hydrated, loggedIn, segments, router]);
}

function AppGate({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      hydrate();
    }
  }, [started, hydrate]);

  useAuthGuard();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const client = useMemo(() => queryClient, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <AppGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="scan-menu" options={{ presentation: 'modal' }} />
            <Stack.Screen name="assistant/index" options={{ presentation: 'modal' }} />
            <Stack.Screen name="item/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="item/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="billing/index" />
            <Stack.Screen name="billing/[orderId]" />
            <Stack.Screen name="staff/index" />
            <Stack.Screen name="staff/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="inventory/index" />
            <Stack.Screen name="inventory/stock-in" options={{ presentation: 'modal' }} />
            <Stack.Screen name="inventory/wastage/[stockItemId]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings/index" />
          </Stack>
        </AppGate>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
