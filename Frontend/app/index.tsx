import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function Index() {
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) return <LoadingSpinner />;

  if (user) {
    if (profile?.role === 'admin') return <Redirect href="/Admin/dashboard" />;
    if (profile?.role === 'doctor') return <Redirect href="/(doctor)/dashboard" />;
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
