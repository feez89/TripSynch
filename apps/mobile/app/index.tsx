import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={isAuthenticated ? '/(app)/trips' : '/(auth)/sign-in'} />;
}
