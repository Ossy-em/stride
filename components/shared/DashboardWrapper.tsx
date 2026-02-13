'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem('stride_onboarded');
    if (!hasOnboarded && session?.user) {
      setShowOnboarding(true);
    }
    setChecking(false);
  }, [session]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('stride_onboarded', 'true');
    setShowOnboarding(false);
  };

  if (checking) return null;

  if (showOnboarding) {
    return (
      <OnboardingFlow
        userName={session?.user?.name || undefined}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <>{children}</>;
}