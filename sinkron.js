/* Konversi data aplikasi <-> dokumen Firestore, plus pembanding perubahan (dipakai backend.js).
   Dokumen publik kas/data : { pengaturan:{}, warga:{id:{id,nama}}, bayar:{pekan:{id:tanggal}}, kas:{id:{...}} }
   Dokumen kontak kontak/data (hanya pengurus) : { hp:{id:'08...'} }
   Perubahan dikirim per field (bukan seluruh dokumen), jadi dua pengurus yang mengubah hal berbeda tidak saling menimpa. */
(function () {
  function klon(x) { return JSON.parse(JSON.stringify(x)); }
  function keN(D) {
    var pub = { pengaturan: klon(D.pengaturan || {}), warga: {}, bayar: {}, kas: {} }, hp = {};
    (D.warga || []).forEach(function (w) { pub.warga[w.id] = { id: w.id, nama: w.nama }; if (w.nonaktif) pub.warga[w.id].nonaktif = true; if (w.hp) hp[w.id] = w.hp; });
    Object.keys(D.bayar || {}).forEach(function (k) {
      var m = D.bayar[k] || {}, ids = Object.keys(m);
      if (ids.length) { pub.bayar[k] = {}; ids.forEach(function (id) { pub.bayar[k][id] = m[id]; }); }
    });
    (D.kas || []).forEach(function (x) {
      var o = { id: x.id, tgl: x.tgl, jenis: x.jenis, ket: x.ket, jumlah: x.jumlah };
      if (x.ref) o.ref = x.ref;
      pub.kas[x.id] = o;
    });
    return { pub: pub, hp: hp };
  }
  function dariN(pub, hp) {
    pub = pub || {}; hp = hp || {};
    var kas = Object.keys(pub.kas || {}).map(function (id) { return klon(pub.kas[id]); });
    kas.sort(function (a, b) { return a.tgl < b.tgl ? -1 : a.tgl > b.tgl ? 1 : (a.id < b.id ? -1 : 1); });
    return {
      versi: 1, pengaturan: klon(pub.pengaturan || {}),
      warga: Object.keys(pub.warga || {}).map(function (id) { var o = { id: id, nama: pub.warga[id].nama, hp: hp[id] || '' }; if (pub.warga[id].nonaktif) o.nonaktif = true; return o; }),
      bayar: klon(pub.bayar || {}), bukti: {}, kas: kas
    };
  }
  function ratakan(pub) {
    var o = {};
    function t(p, v) { o[p.join('\u0001')] = { p: p, v: v, j: JSON.stringify(v) }; }
    Object.keys(pub.pengaturan || {}).forEach(function (k) { t(['pengaturan', k], pub.pengaturan[k]); });
    Object.keys(pub.warga || {}).forEach(function (id) { t(['warga', id], pub.warga[id]); });
    Object.keys(pub.bayar || {}).forEach(function (wk) { Object.keys(pub.bayar[wk]).forEach(function (id) { t(['bayar', wk, id], pub.bayar[wk][id]); }); });
    Object.keys(pub.kas || {}).forEach(function (id) { t(['kas', id], pub.kas[id]); });
    return o;
  }
  function ratakanHp(hp) { var o = {}; Object.keys(hp || {}).forEach(function (id) { o[['hp', id].join('\u0001')] = { p: ['hp', id], v: hp[id], j: JSON.stringify(hp[id]) }; }); return o; }
  function beda(lama, baru) {
    var set = [], hapus = [];
    Object.keys(baru).forEach(function (k) { if (!lama[k] || lama[k].j !== baru[k].j) set.push(baru[k]); });
    Object.keys(lama).forEach(function (k) { if (!baru[k]) hapus.push(lama[k]); });
    return { set: set, hapus: hapus };
  }
  var api = { keN: keN, dariN: dariN, ratakan: ratakan, ratakanHp: ratakanHp, beda: beda };
  if (typeof window !== 'undefined') window.SINKRON = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
