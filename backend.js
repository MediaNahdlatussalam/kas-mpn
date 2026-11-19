/* Penghubung ke Firebase (login pengurus + data bersama). Memuat SDK Firebase dari CDN Google saat dibutuhkan.
   Aplikasi (app.js) hanya memakai window.BACKEND: pasang(), masuk(), keluar(), tulis(). */
(function () {
  var BASE = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var fb, db, auth, refPub, refHp, cb, user = null, unsubHp = null, admin = false;
  var lastPub = null, lastHp = {}, adaPub = false, adaHp = false, dasarPub = {}, dasarHp = {}, siap = false;
  function kosongPub() { return { pengaturan: {}, warga: {}, bayar: {}, kas: {} }; }
  function kirim() { if (lastPub) cb.saatData(SINKRON.dariN(lastPub, lastHp)); }
  function ikutiHp() {
    if (unsubHp) { unsubHp(); unsubHp = null; }
    admin = false; lastHp = {}; adaHp = false; dasarHp = {};
    if (!user) { cb.saatPeran('anggota', ''); kirim(); return; }
    cb.saatPeran('anggota', user.email || '');
    unsubHp = fb.fs.onSnapshot(refHp, function (s) {
      adaHp = s.exists(); lastHp = (adaHp && s.data().hp) || {}; dasarHp = SINKRON.ratakanHp(lastHp);
      if (!admin) { admin = true; cb.saatPeran('admin', user.email || ''); }
      kirim();
    }, function () { admin = false; cb.saatPeran('anggota', (user && user.email) || ''); kirim(); });
  }
  function args(ref, d) {
    var a = [ref];
    d.set.forEach(function (x) { a.push(new fb.fs.FieldPath(...x.p), x.v); });
    d.hapus.forEach(function (x) { a.push(new fb.fs.FieldPath(...x.p), fb.fs.deleteField()); });
    return a;
  }
  window.BACKEND = {
    pasang: function (c) {
      cb = c;
      Promise.all([import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js')]).then(function (m) {
        fb = { app: m[0], auth: m[1], fs: m[2] };
        var app = fb.app.initializeApp(window.FIREBASE_CONFIG);
        try { db = fb.fs.initializeFirestore(app, { localCache: fb.fs.persistentLocalCache({ tabManager: fb.fs.persistentMultipleTabManager() }) }); }
        catch (e) { db = fb.fs.getFirestore(app); }
        auth = fb.auth.getAuth(app);
        refPub = fb.fs.doc(db, 'kas', 'data'); refHp = fb.fs.doc(db, 'kontak', 'data');
        siap = true;
        fb.fs.onSnapshot(refPub, function (s) {
          adaPub = s.exists(); lastPub = adaPub ? s.data() : kosongPub();
          dasarPub = SINKRON.ratakan(lastPub); kirim();
        }, function (e) { cb.saatGalat('Gagal memuat data (' + (e.code || 'galat') + ').'); });
        fb.auth.onAuthStateChanged(auth, function (u) { user = u; ikutiHp(); });
      }).catch(function () { cb.saatGalat('Tidak bisa terhubung ke layanan online. Periksa koneksi internet.'); });
    },
    masuk: function (email, sandi) { if (!siap) return Promise.reject({ code: 'belum-siap' }); return fb.auth.signInWithEmailAndPassword(auth, email, sandi); },
    keluar: function () { return siap ? fb.auth.signOut(auth) : Promise.resolve(); },
    tulis: function (D) {
      if (!siap || !admin) return Promise.reject({ code: 'permission-denied' });
      var n = SINKRON.keN(D), pubBaru = SINKRON.ratakan(n.pub), hpBaru = SINKRON.ratakanHp(n.hp), jj = [];
      if (!adaPub) { jj.push(fb.fs.setDoc(refPub, n.pub)); adaPub = true; }
      else { var d = SINKRON.beda(dasarPub, pubBaru); if (d.set.length || d.hapus.length) jj.push(fb.fs.updateDoc.apply(null, args(refPub, d))); }
      dasarPub = pubBaru;
      if (!adaHp) { jj.push(fb.fs.setDoc(refHp, { hp: n.hp })); adaHp = true; }
      else { var h = SINKRON.beda(dasarHp, hpBaru); if (h.set.length || h.hapus.length) jj.push(fb.fs.updateDoc.apply(null, args(refHp, h))); }
      dasarHp = hpBaru;
      return Promise.all(jj);
    }
  };
})();
