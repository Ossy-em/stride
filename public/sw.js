// Stride Service Worker - Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Stride',
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'stride-intervention',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/',
      interventionId: data.interventionId,
      sessionId: data.sessionId,
    },
    actions: [
      { action: 'focus', title: 'Back to focus' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Stride', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { url, interventionId, sessionId } = event.notification.data || {};

  // Handle dismiss action
  if (event.action === 'dismiss' && interventionId) {
    fetch('/api/interventions/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interventionId,
        action: 'dismissed',
      }),
    }).catch(() => {});
    return;
  }

  // Default click or "Back to focus" - find and focus existing window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // First, try to find any existing Stride window
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          // Found an existing Stride window - focus it and navigate if needed
          client.focus();
          if (sessionId && !client.url.includes('/session/active')) {
            client.navigate(`/session/active?id=${sessionId}`);
          }
          return client;
        }
      }
      // No existing window found - open a new one
      const targetUrl = sessionId ? `/session/active?id=${sessionId}` : '/';
      return self.clients.openWindow(targetUrl);
    })
  );
});