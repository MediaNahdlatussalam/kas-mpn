/* Layanan offline sederhana. File aplikasi: jaringan dulu (selalu dapat versi terbaru), salinan tersimpan dipakai bila offline.
   Skrip Firebase dari gstatic: salinan tersimpan dulu (alamatnya berversi). Permintaan data Firestore tidak disentuh. */
var NAMA = 'kas-mpn-v1';
var INTI = ['./', 'index.html', 'style.css', 'tema.css', 'tema.js', 'app.js', 'data.js', 'sinkron.js', 'backend.js', 'firebase-config.js', 'logo-mpn.png', 'icon-192.png', 'icon-512.png', 'manifest.json', 'ikon.svg'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(NAMA).then(function (c) { return Promise.all(INTI.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== NAMA; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) { var salin = res.clone(); caches.open(NAMA).then(function (c) { c.put(r, salin); }); }
      return res;
    }).catch(function () { return caches.match(r).then(function (m) { return m || (r.mode === 'navigate' ? caches.match('index.html') : undefined); }); }));
  } else if (u.hostname === 'www.gstatic.com' && u.pathname.indexOf('/firebasejs/') === 0) {
    e.respondWith(caches.match(r).then(function (m) {
      return m || fetch(r).then(function (res) { if (res && res.ok) { var salin = res.clone(); caches.open(NAMA).then(function (c) { c.put(r, salin); }); } return res; });
    }));
  }
});
