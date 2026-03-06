// ══ ACS Service Worker — Notifications 19h Bangkok ══
var scheduledTimer = null;
var userName = '';
var villaNames = [];

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('message', function(e) {
  var data = e.data;
  if (!data) return;

  if (data.type === 'SCHEDULE_19H') {
    userName = data.userName || '';
    villaNames = data.villaNames || [];
    schedule19h();
  }

  if (data.type === 'TEST_NOTIF') {
    userName = data.userName || '';
    villaNames = data.villaNames || [];
    sendNotif();
  }
});

function schedule19h() {
  if (scheduledTimer) clearTimeout(scheduledTimer);

  function tick() {
    // Heure Bangkok = UTC+7
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var bangkok = new Date(utc + 7 * 3600000);

    var h = bangkok.getHours();
    var m = bangkok.getMinutes();

    // Si c'est 19h (19:00 à 19:01), envoyer la notif
    if (h === 19 && m === 0) {
      sendNotif();
      // Attendre 61 secondes pour éviter un double envoi
      scheduledTimer = setTimeout(tick, 61000);
    } else {
      // Calculer le temps jusqu'à 19h00 Bangkok
      var target = new Date(bangkok);
      target.setHours(19, 0, 0, 0);
      if (bangkok >= target) {
        // Déjà passé aujourd'hui, viser demain
        target.setDate(target.getDate() + 1);
      }
      var ms = target.getTime() - bangkok.getTime();
      // Ne pas dépasser 30 minutes de timer pour rester précis
      var wait = Math.min(ms, 30 * 60000);
      scheduledTimer = setTimeout(tick, wait);
    }
  }

  tick();
}

function sendNotif() {
  var prenom = userName ? userName.split(' ')[0] : 'ami';
  var greetings = ['Salut', 'Hey', 'Coucou', 'Hello'];
  var greeting = greetings[Math.floor(Math.random() * greetings.length)];

  var body = greeting + ' ' + prenom + ' ! As-tu eu de nouvelles dépenses aujourd\'hui ?';
  if (villaNames.length > 0) {
    body += ' (' + villaNames.join(', ') + ')';
  }

  self.registration.showNotification('ACS — Rappel quotidien', {
    body: body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23080808" width="100" height="100" rx="20"/><text x="50" y="62" text-anchor="middle" fill="%23F5D06B" font-size="36" font-weight="bold" font-family="serif">ACS</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="%23C9950C" cx="50" cy="50" r="50"/></svg>',
    tag: 'acs-daily-19h',
    renotify: true,
    vibrate: [200, 100, 200]
  }).catch(function(e) {
    console.log('[ACS SW] Notification error:', e);
  });
}

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
      for (var i = 0; i < clients.length; i++) {
        if (clients[i].url && clients[i].focus) {
          return clients[i].focus();
        }
      }
      return self.clients.openWindow('./');
    })
  );
});
