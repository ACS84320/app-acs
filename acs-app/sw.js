// ACS Service Worker — Notifications push 19h Bangkok
const CACHE = 'acs-v1';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// Recevoir un message de l'app principale
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE_19H') {
    const { villaNames, userName } = e.data;
    scheduleNotif(villaNames, userName);
  }
  if(e.data && e.data.type === 'TEST_NOTIF') {
    const { villaNames, userName } = e.data;
    fireNotif(villaNames, userName);
  }
});

let notifTimer = null;

function msUntil19hBangkok() {
  const now = new Date();
  // Bangkok = UTC+7
  const bangkokNow = new Date(now.getTime() + (7 * 60 - (-now.getTimezoneOffset())) * 60000);
  const target = new Date(bangkokNow);
  target.setHours(19, 0, 0, 0);
  if(bangkokNow >= target) target.setDate(target.getDate() + 1);
  return target - bangkokNow;
}

function scheduleNotif(villaNames, userName) {
  if(notifTimer) clearTimeout(notifTimer);
  const ms = msUntil19hBangkok();
  console.log('[ACS SW] Prochaine notification dans ' + Math.round(ms / 60000) + ' min');
  notifTimer = setTimeout(() => {
    fireNotif(villaNames, userName);
    // Replanifier pour le lendemain
    setTimeout(() => scheduleNotif(villaNames, userName), 60000);
  }, ms);
}

function fireNotif(villaNames, userName) {
  const villas = villaNames && villaNames.length > 0 ? villaNames.join(', ') : 'vos villas';
  const prenom = userName ? userName.split(' ')[0] : '';
  self.registration.showNotification('ACS — Rappel du soir 🏠', {
    body: prenom + ', avez-vous eu des dépenses aujourd\'hui pour ' + villas + ' ? Enregistrez-les maintenant.',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'acs-daily-' + new Date().toDateString(),
    renotify: false,
    requireInteraction: true,
    actions: [
      { action: 'open', title: '📋 Ajouter une dépense' },
      { action: 'dismiss', title: 'Plus tard' }
    ],
    data: { url: '/' }
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if(e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      if(cls.length > 0) { cls[0].focus(); return; }
      clients.openWindow('/');
    })
  );
});
