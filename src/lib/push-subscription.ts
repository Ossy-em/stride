const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushSetupResult {
  supported: boolean;
  subscribed: boolean;
  permission: NotificationPermission | null;
  error?: string;
  debug?: string;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error: any) {
    console.error('SW registration failed:', error);
    return null;
  }
}

export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<{ subscription: PushSubscription | null; error?: string }> {
  if (!('PushManager' in window)) return { subscription: null, error: 'No PushManager' };
  if (!VAPID_PUBLIC_KEY) return { subscription: null, error: 'No VAPID key' };

  try {
    const existing = await (registration as any).pushManager.getSubscription();
    if (existing) return { subscription: existing };

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { subscription: null, error: `Permission: ${permission}` };

    const subscription = await (registration as any).pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    return { subscription };
  } catch (error: any) {
    return { subscription: null, error: error?.message || String(error) };
  }
}

export async function saveSubscription(subscription: PushSubscription): Promise<{ saved: boolean; error?: string }> {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { saved: false, error: `${data.error || response.status} | code:${data.code || 'none'}` };
    }

    // Pass through server debug info
    return { 
      saved: true, 
      error: `rows:${data.upsertedRows} total:${data.totalSubscriptions} user:${data.userId?.substring(0, 8)}` 
    };
  } catch (error: any) {
    return { saved: false, error: error.message };
  }
}

export async function setupPushNotifications(): Promise<PushSetupResult> {
  if (typeof window === 'undefined') {
    return { supported: false, subscribed: false, permission: null, debug: 'Not in browser' };
  }

  if (!('serviceWorker' in navigator)) {
    return { supported: false, subscribed: false, permission: null, debug: 'No SW support' };
  }

  if (!('PushManager' in window)) {
    return { supported: false, subscribed: false, permission: null, debug: 'No PushManager' };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { supported: true, subscribed: false, permission: null, debug: 'No VAPID public key' };
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    return { supported: true, subscribed: false, permission: Notification.permission, debug: 'SW register failed' };
  }

  // Wait for SW to activate
  if (registration.installing || registration.waiting) {
    const worker = registration.installing || registration.waiting;
    await new Promise<void>((resolve) => {
      worker!.addEventListener('statechange', (e) => {
        if ((e.target as ServiceWorker).state === 'activated') resolve();
      });
      // Resolve immediately if already activated
      if (worker!.state === 'activated') resolve();
    });
  }

  const { subscription, error: subError } = await subscribeToPush(registration);
  if (!subscription) {
    return {
      supported: true,
      subscribed: false,
      permission: Notification.permission,
      debug: `Sub failed: ${subError}`,
    };
  }

  const { saved, error } = await saveSubscription(subscription);
  if (!saved) {
    return {
      supported: true,
      subscribed: false,
      permission: Notification.permission,
      debug: `Save failed: ${error}`,
    };
  }

   return { supported: true, subscribed: saved, permission: Notification.permission, debug: saved ? `OK ${error}` : `Save failed: ${error}` };

}