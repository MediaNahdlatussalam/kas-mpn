/* kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id. Lisensi Nonkomersial Maliki Studio: wajib kredit, dilarang dijual (lihat LICENSE). */
/* Iuran & Kas RT — logika aplikasi (tanpa build, tanpa library).
   Peta: 1. util · 2. data & simpan · 3. tema/customizer · 4. render · 5. aksi · 6. ekspor */
/* KONFIG gambar: ganti logo cukup timpa img/logo-rt.svg (atau ubah path ke .png/.jpg). */
var KONFIG = {
  logo: 'logo-mpn.png',                // logo MPN: header + laporan cetak
  contohBukti: 'img/contoh-bukti.svg', // contoh rasio foto bukti bayar (3:4)
  maksFoto: 400                        // sisi terpanjang foto bukti (px) sebelum disimpan
};
(function () {
  'use strict';
  /* ========== 1. Util ========== */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var KUNCI = 'iuran-kas-rt-data', KUNCI_MODE = 'iuran-kas-rt-mode';
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var GERAK = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rp(n) { return 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID'); }
  function ribu(n) { return Math.round(Number(n) || 0).toLocaleString('id-ID'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function hariIni() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function kunciBulan(y, m) { return y + '-' + pad(m + 1); }
  function namaBulan(k) { var p = k.split('-'); return BULAN[+p[1] - 1] + ' ' + p[0]; }
  function tglPendek(t) { var p = t.split('-'); return +p[2] + ' ' + BULAN[+p[1] - 1].slice(0, 3); }
  /* Pekan: Senin–Minggu. Kunci pekan = tanggal Senin (YYYY-MM-DD). Pekan masuk ke bulan tempat Senin-nya jatuh. */
  function isoTgl(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function tambahHari(t, n) { var p = t.split('-'); return isoTgl(new Date(+p[0], +p[1] - 1, +p[2] + n)); }
  function seninDari(t) { var p = t.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); return tambahHari(t, -((d.getDay() + 6) % 7)); }
  function akhirMinggu(b) { return tambahHari(b, 6); }
  function mingguBulan(y, m) { var h = [], n = new Date(y, m + 1, 0).getDate(); for (var i = 1; i <= n; i++) { if (new Date(y, m, i).getDay() === 1) h.push(y + '-' + pad(m + 1) + '-' + pad(i)); } return h; }
  function rentang(b) { var a = b.split('-'), z = akhirMinggu(b).split('-'); return (+a[2]) + (a[1] !== z[1] ? ' ' + BULAN[+a[1] - 1].slice(0, 3) : '') + '–' + (+z[2]) + ' ' + BULAN[+z[1] - 1].slice(0, 3); }
  function namaPeriode(b) { return 'minggu ' + rentang(b) + ' ' + akhirMinggu(b).split('-')[0]; }
  function idBaru(a) { return a + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function inisial(n) { return n.split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase(); }
  function batasTeks() { return String(D.pengaturan.batas == null ? '' : D.pengaturan.batas).trim(); }
  function urutNama(x, y) { return x.nama.localeCompare(y.nama, 'id'); }
  function noWA(hp) { var d = String(hp || '').replace(/\D/g, ''); if (!d) return ''; if (d[0] === '0') d = '62' + d.slice(1); else if (d.slice(0, 2) !== '62') d = '62' + d; return d; }
  var IK = {
    cek: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/></svg>',
    naik: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>',
    turun: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>',
    hapus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
    ubah: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    foto: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    kalender: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
    kosong: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/></svg>'
  };

  /* ========== 2. Data & simpan ========== */
  var D, ADMIN = false, emailMasuk = '';
  /* Data kini disimpan online (Firestore) dan dipakai bersama; localStorage tidak dipakai lagi untuk data. */
  function muat() { D = { versi: 1, pengaturan: {}, warga: [], bayar: {}, bukti: {}, kas: [] }; migrasi(D); }
  function pesanGalat(e) {
    var c = (e && e.code) || '';
    if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)) return 'Email atau kata sandi salah.';
    if (/too-many-requests/.test(c)) return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.';
    if (/network/.test(c)) return 'Tidak ada koneksi internet.';
    if (/permission-denied/.test(c)) return 'Akun ini tidak punya izin mengubah data.';
    if (c === 'belum-siap') return 'Layanan online belum siap. Coba lagi sebentar.';
    return 'Terjadi kesalahan (' + (c || 'tidak dikenal') + ').';
  }
  // Tambah field baru di sini supaya data lama tetap terbaca.
  function migrasi(d) {
    d.versi = d.versi || 1;
    d.pengaturan = Object.assign({ iuran: 50000, batas: '', bendahara: 'Bendahara', bayarKe: '' }, d.pengaturan || {});
    if (typeof d.pengaturan.batas !== 'string') d.pengaturan.batas = '';  /* data lama: batas berupa tanggal (angka) -> kosongkan, isi ulang di Pengaturan */
    d.bayar = d.bayar || {}; d.bukti = d.bukti || {}; d.kas = d.kas || [];
    d.warga.forEach(function (w) { w.hp = w.hp || ''; });
    /* Data lama dicatat per bulan (kunci 'YYYY-MM'): pindahkan ke pekan tempat tanggal bayarnya jatuh. */
    Object.keys(d.bayar).forEach(function (k) {
      if (!/^\d{4}-\d{2}$/.test(k)) return;
      var isi = d.bayar[k]; delete d.bayar[k];
      Object.keys(isi).forEach(function (id) {
        var tg = isi[id], mon = seninDari(tg), refLama = k + ':' + id, refBaru = mon + ':' + id;
        d.bayar[mon] = d.bayar[mon] || {};
        var bentrok = !!d.bayar[mon][id];
        if (!bentrok) d.bayar[mon][id] = tg;
        d.kas.forEach(function (x) { if (x.ref === refLama) { if (bentrok) delete x.ref; else x.ref = refBaru; } });
        if (d.bukti[k] && d.bukti[k][id] && !bentrok) { d.bukti[mon] = d.bukti[mon] || {}; d.bukti[mon][id] = d.bukti[k][id]; }
      });
      delete d.bukti[k];
    });
  }
  function simpan() { if (!ADMIN || !window.BACKEND) return; BACKEND.tulis(D).catch(function (e) { toast('Gagal menyimpan: ' + pesanGalat(e)); }); }
  function catat(teks) { if (ADMIN && window.BACKEND && BACKEND.catat) BACKEND.catat(teks).catch(function () {}); }  /* riwayat perubahan */
  var kini = new Date();
  function awalIdx(y, m) { var t = hariIni(), idx = 0; mingguBulan(y, m).forEach(function (k, i) { if (k <= t) idx = i; }); return idx; }
  var S = { tahun: kini.getFullYear(), bulan: kini.getMonth(), minggu: awalIdx(kini.getFullYear(), kini.getMonth()), saring: 'semua', cari: '', tab: 'ingat', memuat: true, lap: 'minggu' };
  function idxMinggu() { var n = mingguBulan(S.tahun, S.bulan).length; return Math.max(0, Math.min(S.minggu, n - 1)); }
  function bk() { return mingguBulan(S.tahun, S.bulan)[idxMinggu()]; }  /* kunci pekan terpilih */
  function lunasDi(b, id) { return !!(D.bayar[b] && D.bayar[b][id]); }
  function saldo(sampaiTgl) { return D.kas.reduce(function (s, x) { return (!sampaiTgl || x.tgl <= sampaiTgl) ? s + (x.jenis === 'masuk' ? 1 : -1) * x.jumlah : s; }, 0); }
  function kasBulan(b) { var m = 0, k = 0, iu = 0; D.kas.forEach(function (x) { if (x.tgl >= b && x.tgl <= akhirMinggu(b)) { if (x.jenis === 'masuk') { m += x.jumlah; if (x.ref) iu += x.jumlah; } else k += x.jumlah; } }); return { masuk: m, keluar: k, iuran: iu }; }
  /* Anggota nonaktif hanya ikut dihitung di pekan tempat ia punya catatan lunas. */
  function anggotaPekan(b) { return D.warga.filter(function (w) { return !w.nonaktif || lunasDi(b, w.id); }); }
  function rekap(b) {
    var semua = anggotaPekan(b);
    var lunas = semua.filter(function (w) { return lunasDi(b, w.id); });
    var belum = semua.filter(function (w) { return !lunasDi(b, w.id); });
    return { lunas: lunas, belum: belum, total: semua.length, kurang: belum.length * D.pengaturan.iuran, terkumpul: kasBulan(b).iuran };
  }
  function setLunas(w, b, lunas, tgl, jeda) {
    var ref = b + ':' + w.id;
    D.kas = D.kas.filter(function (x) { return x.ref !== ref; });
    D.bayar[b] = D.bayar[b] || {};
    if (lunas) {
      var t = tgl || ((hariIni() >= b && hariIni() <= akhirMinggu(b)) ? hariIni() : b);
      D.bayar[b][w.id] = t;
      D.kas.push({ id: idBaru('k'), tgl: t, jenis: 'masuk', ket: 'Iuran ' + w.nama, jumlah: Number(D.pengaturan.iuran) || 0, ref: ref });
    } else delete D.bayar[b][w.id];
    if (!jeda) simpan();
  }

  /* ========== 3. Tema (kontrak customizer Maliki Studio) ========== */
  var FONT = ['Plus Jakarta Sans', 'Inter', 'Poppins', 'DM Sans', 'Space Grotesk', 'Nunito'];
  function modeAktif(m) { if (m === 'auto' || !m) return matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang'; return m; }
  function muatFont(nama) {
    if (FONT.indexOf(nama) < 0) return;
    var href = 'https://fonts.googleapis.com/css2?family=' + nama.replace(/ /g, '+') + ':wght@400;500;600;700;800&display=swap';
    var l = $('#fontTema'); if (l && l.getAttribute('href') !== href) l.setAttribute('href', href);
  }
  function terapkan(t) {
    t = t || {}; var r = document.documentElement.style;
    if (t.utama) r.setProperty('--tema-utama', t.utama);
    if (t.aksen) r.setProperty('--tema-aksen', t.aksen);
    if (t.radius != null && t.radius !== '') r.setProperty('--tema-radius', /px$/.test(String(t.radius)) ? t.radius : t.radius + 'px');
    if (t.font) { var nm = String(t.font).split(',')[0].replace(/["']/g, '').trim(); r.setProperty('--tema-font', '"' + nm + '", system-ui, sans-serif'); muatFont(nm); }
    if (t.mode) document.documentElement.setAttribute('data-mode', modeAktif(t.mode));
    if (t.nama) { window.TEMA.nama = t.nama; $$('[data-tema-nama]').forEach(function (el) { el.textContent = t.nama; }); perbaruiTeks(); }
    if (t.bagian) {
      var peta = { latar: ['--latar', '--tema-latar'], panel: ['--permukaan', '--tema-panel'], nav: ['--nav', '--tema-nav'], teks: ['--teks', '--tema-teks'] };
      Object.keys(peta).forEach(function (k) { var v = t.bagian[k]; if (v) { r.setProperty(peta[k][0], v); r.setProperty(peta[k][1], v); } else if (v === null) { r.removeProperty(peta[k][0]); r.removeProperty(peta[k][1]); } });
    }
    hitungKontras();
  }
  function hex(c) {
    c = String(c).trim();
    if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    if (/^#[0-9a-f]{6}$/i.test(c)) return c;
    var m = c.match(/\d+(\.\d+)?/g); if (!m) return '#000000';
    return '#' + m.slice(0, 3).map(function (v) { return pad(Math.round(+v).toString(16)); }).join('');
  }
  function luminansi(c) { var x = hex(c); return [1, 3, 5].map(function (i) { var n = parseInt(x.substr(i, 2), 16) / 255; return n <= .03928 ? n / 12.92 : Math.pow((n + .055) / 1.055, 2.4); }).reduce(function (s, v, i) { return s + v * [.2126, .7152, .0722][i]; }, 0); }
  function teksUntuk(c) { var L = luminansi(c); return (1.05 / (L + .05)) >= ((L + .05) / .05) ? '#ffffff' : '#111111'; }
  function warnaJadi(v) { var el = document.createElement('i'); el.style.color = v; document.body.appendChild(el); var c = getComputedStyle(el).color; el.remove(); return c; }
  function hitungKontras() {
    var r = document.documentElement.style, cs = getComputedStyle(document.documentElement);
    r.setProperty('--tema-utama-teks', teksUntuk(warnaJadi(cs.getPropertyValue('--tema-utama').trim())));
    r.setProperty('--tema-nav-teks', teksUntuk(warnaJadi(cs.getPropertyValue('--nav').trim())));
    var meta = $('meta[name="theme-color"]'); if (meta) meta.content = hex(warnaJadi(cs.getPropertyValue('--nav').trim()));
  }
  function tandaiBagian() {
    $$('.kartu,.modal,.pesan').forEach(function (el) { el.setAttribute('data-bagian', 'panel'); });
    $$('.btn:not(.btn-garis):not(.btn-wa):not(.btn-bahaya),.chip[aria-pressed="true"] i,.seg-penanda,.lunas .avatar,.mg[aria-selected="true"]').forEach(function (el) { el.setAttribute('data-bagian', 'utama'); });
    $$('.cincin-wadah,.merek-logo,.bln .titik,.mg .titik').forEach(function (el) { el.setAttribute('data-bagian', 'aksen'); });
    $$('h2,h3,.nama').forEach(function (el) { el.setAttribute('data-bagian', 'teks'); });
  }
  var NAMA_BAGIAN = { nav: 'Navigasi', latar: 'Latar', panel: 'Panel', utama: 'Warna utama', aksen: 'Aksen', teks: 'Teks' };
  var bagianSorot = null;
  function sorot(b) {
    bagianSorot = b || null;
    $$('[data-sorot]').forEach(function (el) { el.removeAttribute('data-sorot'); });
    $$('.label-sorot').forEach(function (el) { el.remove(); });
    if (!b) return;
    $$('[data-bagian="' + b + '"]').forEach(function (el, i) {
      el.setAttribute('data-sorot', '');
      if (i > 5) return;
      var k = el.getBoundingClientRect(); if (!k.width) return;
      var l = document.createElement('div'); l.className = 'label-sorot'; l.textContent = NAMA_BAGIAN[b] || b;
      l.style.left = (k.left + scrollX + 4) + 'px'; l.style.top = (k.top + scrollY + 4) + 'px'; document.body.appendChild(l);
    });
  }
  var modePilih = false, hoverEl = null;
  ['click', 'pointerdown', 'mousedown', 'submit', 'touchstart', 'keydown'].forEach(function (t) {
    document.addEventListener(t, function (ev) {
      if (!modePilih) return;
      ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
      if (t === 'click') { var x = ev.target.closest && ev.target.closest('[data-bagian]'); if (x && window.parent !== window) window.parent.postMessage({ tipe: 'bagian-dipilih', bagian: x.getAttribute('data-bagian') }, '*'); }
    }, { capture: true, passive: false });
  });
  document.addEventListener('mouseover', function (ev) {
    if (!modePilih) return; var x = ev.target.closest('[data-bagian]');
    if (hoverEl && hoverEl !== x) hoverEl.removeAttribute('data-pilih-hover');
    hoverEl = x; if (x) x.setAttribute('data-pilih-hover', '');
  }, true);
  window.addEventListener('message', function (ev) {
    var d = ev.data; if (!d || typeof d !== 'object') return;
    if (d.tipe === 'tema') terapkan(d);
    if (d.tipe === 'sorot') sorot(d.bagian);
    if (d.tipe === 'mode-pilih') { modePilih = !!d.aktif; document.documentElement.classList.toggle('mode-pilih', modePilih); if (!modePilih && hoverEl) { hoverEl.removeAttribute('data-pilih-hover'); hoverEl = null; } }
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    var m; try { m = localStorage.getItem(KUNCI_MODE); } catch (e) {}
    if (!m && (TEMA.mode || 'auto') === 'auto') { terapkan({ mode: 'auto' }); }
  });

  /* ========== 4. Render ========== */
  var saldoTampil = 0;
  var tokenHitung = 0;
  function hitungNaik(el, dari, ke) {
    var token = ++tokenHitung; // animasi baru membatalkan yang lama
    if (!GERAK || dari === ke) { el.textContent = ribu(ke); return; }
    var mulai = performance.now(), lama = 700;
    (function langkah(t) {
      if (token !== tokenHitung) return;
      var p = Math.min(1, Math.max(0, (t - mulai) / lama)), e = 1 - Math.pow(1 - p, 3);
      el.textContent = ribu(dari + (ke - dari) * e);
      if (p < 1) requestAnimationFrame(langkah);
    })(mulai);
  }
  function renderPahlawan() {
    var b = bk(), r = rekap(b), kb = kasBulan(b);
    var akhirBulan = akhirMinggu(b);
    var s = saldo(akhirBulan < hariIni() ? akhirBulan : null);
    var el = $('#angkaSaldo'), dari = angka(el.textContent); hitungNaik(el, dari, s); saldoTampil = s;
    $('#judulSaldo').textContent = akhirBulan < hariIni() ? 'Saldo kas akhir ' + namaPeriode(b) : 'Saldo kas sekarang';
    var bersih = kb.masuk - kb.keluar;
    $('#saldoUbah').innerHTML = (bersih >= 0 ? IK.naik : IK.turun) + '<span>' + (bersih >= 0 ? '+' : '−') + rp(Math.abs(bersih)) + ' bersih minggu ' + (idxMinggu() + 1) + '</span>';
    $('#angkaLunas').textContent = r.lunas.length + '/' + r.total;
    var p = r.total ? r.lunas.length / r.total : 0;
    $('#cincinIsi').style.strokeDashoffset = String(314.16 * (1 - p));
    $('.cincin-wadah').setAttribute('aria-label', r.lunas.length + ' dari ' + r.total + ' anggota lunas');
    $('#stTerkumpul').textContent = rp(r.terkumpul);
    $('#stKurang').textContent = rp(r.kurang);
    $('#stKeluar').textContent = rp(kb.keluar);
  }
  function statusMinggu(k) { var n = D.bayar[k] ? Object.keys(D.bayar[k]).length : 0, a = anggotaPekan(k); return { ada: n > 0, penuh: n > 0 && a.length > 0 && a.every(function (w) { return lunasDi(k, w.id); }) }; }
  function statusBulan(y, m) { var ada = false, penuh = true, t = hariIni(); mingguBulan(y, m).forEach(function (k) { var st = statusMinggu(k); if (st.ada) ada = true; if (k <= t && !st.penuh) penuh = false; }); return { ada: ada, penuh: ada && penuh }; }
  function renderMinggu() {
    var ws = mingguBulan(S.tahun, S.bulan), ai = idxMinggu(), html = '';
    ws.forEach(function (k, i) {
      var st = statusMinggu(k), aktif = i === ai;
      html += '<button class="mg" role="tab" type="button" data-mg="' + i + '" aria-selected="' + aktif + '" tabindex="' + (aktif ? 0 : -1) + '" aria-label="Minggu ' + (i + 1) + ', ' + rentang(k) + (st.ada ? (st.penuh ? ', semua lunas' : ', ada yang belum bayar') : '') + '">' + (st.ada ? '<span class="titik' + (st.penuh ? '' : ' kurang') + '"></span>' : '') + '<b>Minggu ' + (i + 1) + '</b><small>' + rentang(k) + '</small></button>';
    });
    var w = $('#mingguTab'); w.innerHTML = html;
    var a = $('.mg[aria-selected="true"]', w);
    if (a) w.scrollLeft = a.offsetLeft - w.clientWidth / 2 + a.clientWidth / 2;
  }
  function renderBulan() {
    $('#tahun').textContent = S.tahun;
    var html = '';
    for (var m = 0; m < 12; m++) {
      var st = statusBulan(S.tahun, m), ada = st.ada, penuh = st.penuh, aktif = m === S.bulan;
      html += '<button class="bln" role="tab" type="button" data-bln="' + m + '" aria-selected="' + aktif + '" tabindex="' + (aktif ? 0 : -1) + '" aria-label="' + BULAN[m] + ' ' + S.tahun + (ada ? (penuh ? ', semua lunas' : ', ada yang belum bayar') : '') + '">' + (ada ? '<span class="titik' + (penuh ? '' : ' kurang') + '"></span>' : '') + BULAN[m].slice(0, 3) + '</button>';
    }
    var wadah = $('#bulanTab'); wadah.innerHTML = html;
    var a = $('.bln[aria-selected="true"]', wadah);
    if (a) wadah.scrollLeft = a.offsetLeft - wadah.clientWidth / 2 + a.clientWidth / 2;
  }
  function wargaTersaring() {
    var b = bk(), q = S.cari.toLowerCase(), nv = S.saring === 'nonaktif';
    return (nv ? D.warga.filter(function (w) { return w.nonaktif; }) : anggotaPekan(b)).filter(function (w) {
      var l = lunasDi(b, w.id);
      if (!nv && S.saring === 'lunas' && !l) return false;
      if (!nv && S.saring === 'belum' && l) return false;
      return !q || w.nama.toLowerCase().indexOf(q) >= 0;
    }).sort(urutNama);
  }
  function barisHTML(w, i) {
    var b = bk(), l = lunasDi(b, w.id), t = l ? D.bayar[b][w.id] : '', nv = !!w.nonaktif && S.saring === 'nonaktif', bisa = ADMIN && !nv;
    var ket = nv ? 'Nonaktif' : (l ? 'Bayar ' + tglPendek(t) : rp(D.pengaturan.iuran)) + (w.nonaktif ? ' · nonaktif' : '');
    return '<li class="baris muncul' + (l && !nv ? ' lunas' : '') + (nv ? ' nonaktif' : '') + '" style="--i:' + Math.min(i, 14) + '" data-id="' + w.id + '">' +
      '<button class="ketuk" type="button"' + (bisa ? '' : ' disabled') + ' aria-pressed="' + (l && !nv) + '" aria-label="' + esc(w.nama) + ', ' + (nv ? 'nonaktif' : l ? 'lunas' + (bisa ? '. Ketuk untuk batalkan' : '') : 'belum bayar' + (bisa ? '. Ketuk untuk tandai lunas' : '')) + '">' +
      '<span class="avatar" aria-hidden="true">' + esc(inisial(w.nama)) + IK.cek + '</span>' +
      '<span class="info"><span class="nama">' + esc(w.nama) + '</span><span class="ket">' + ket + '</span></span>' +
      '<span class="status">' + (nv ? 'Nonaktif' : l ? 'Lunas' : 'Belum') + '</span></button>' +
      (ADMIN && !l && !w.nonaktif ? '<button class="wa-btn" type="button" data-wa="' + w.id + '" aria-label="Pesan pengingat untuk ' + esc(w.nama) + '">' + IK.wa + '</button>' : '') +
      (ADMIN ? '<button class="wa-btn menu-btn" type="button" data-menu="' + w.id + '" aria-label="Menu untuk ' + esc(w.nama) + '">' + IK.menu + '</button>' : '') + '</li>';
  }
  function buktiBtn(b, w) {
    var f = D.bukti[b] && D.bukti[b][w.id];
    return '<button class="wa-btn bukti-btn" type="button" data-bukti="' + w.id + '" aria-label="' + (f ? 'Lihat' : 'Tambah') + ' foto bukti bayar ' + esc(w.nama) + '">' + (f ? '<img src="' + f + '" alt="">' : IK.foto) + '</button>';
  }
  function renderDaftar() {
    var nn = D.warga.filter(function (w) { return w.nonaktif; }).length;
    if (S.saring === 'nonaktif' && !(ADMIN && nn)) S.saring = 'semua';
    var b = bk(), r = rekap(b), list = wargaTersaring();
    $('#nSemua').textContent = r.total; $('#nBelum').textContent = r.belum.length; $('#nLunas').textContent = r.lunas.length; $('#nNonaktif').textContent = nn;
    $('[data-saring="nonaktif"]').hidden = !(ADMIN && nn);
    $$('.chip[data-saring]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.saring === S.saring)); });
    $('#judulDaftar').textContent = 'Iuran Minggu ' + (idxMinggu() + 1);
    $('#subDaftar').textContent = rentang(b) + ' ' + akhirMinggu(b).split('-')[0] + ' · ' + rp(D.pengaturan.iuran) + '/anggota per minggu' + (batasTeks() ? ' · batas ' + batasTeks() : '') + (ADMIN ? ' · ketuk nama untuk lunas' : '');
    var ul = $('#listWarga');
    if (S.memuat) { ul.innerHTML = '<li class="kosong"><b>Memuat data…</b></li>'; return; }
    if (!D.warga.length) { ul.innerHTML = '<li class="kosong">' + IK.kosong + '<b>Belum ada anggota</b>Klik tombol "+ Anggota" untuk menambah anggota pertama.</li>'; return; }
    if (!list.length) {
      var semua = S.saring === 'belum' && !S.cari;
      ul.innerHTML = '<li class="kosong">' + IK.kosong + '<b>' + (semua ? 'Semua anggota sudah lunas' : 'Tidak ada yang cocok') + '</b>' + (semua ? 'Terima kasih, iuran minggu ' + (idxMinggu() + 1) + ' beres.' : 'Coba kata kunci atau saringan lain.') + '</li>';
      return;
    }
    var html = '', blok = '', i = 0;
    list.forEach(function (w) {
      html += barisHTML(w, i++);
    });
    ul.innerHTML = html;
  }
  function pesanPengingat(w) {
    var p = D.pengaturan, b = bk();
    return 'Assalamualaikum / Salam sejahtera, Bapak/Ibu ' + w.nama + '.\n\n' +
      'Mohon maaf mengganggu. Sekadar mengingatkan iuran anggota ' + (window.TEMA.nama || '') + ' ' + namaPeriode(b) + ' sebesar ' + rp(p.iuran) + (batasTeks() ? ', batas bayar ' + batasTeks() : '') + '.' +
      (p.bayarKe ? '\nPembayaran: ' + p.bayarKe + '.' : '') + '\n\nKalau sudah bayar, abaikan pesan ini ya. Terima kasih banyak.\n— ' + p.bendahara;
  }
  function pesanGrup() {
    var b = bk(), r = rekap(b), p = D.pengaturan;
    var t = '*Rekap Iuran ' + namaPeriode(b) + '*\n' + (window.TEMA.nama || '') + '\n\n' +
      'Sudah lunas: ' + r.lunas.length + ' dari ' + r.total + ' anggota\nTerkumpul: ' + rp(r.terkumpul) + '\n';
    if (r.belum.length) {
      t += '\nBelum bayar (' + r.belum.length + ' anggota):\n' + r.belum.slice().sort(urutNama).map(function (w, i) { return (i + 1) + '. ' + w.nama; }).join('\n') +
        '\n\nIuran ' + rp(p.iuran) + '/anggota per minggu' + (batasTeks() ? ', batas bayar ' + batasTeks() : '') + '.' + (p.bayarKe ? '\nBayar: ' + p.bayarKe + '.' : '');
    } else t += '\nAlhamdulillah, semua anggota sudah lunas. Terima kasih!';
    return t + '\n\nTerima kasih,\n' + p.bendahara;
  }
  function pesanLaporanMinggu() {
    var b = bk(), r = rekap(b), kb = kasBulan(b);
    var awal = saldo(tambahHari(b, -1)), akhir = awal + kb.masuk - kb.keluar;
    var tr = D.kas.filter(function (x) { return x.tgl >= b && x.tgl <= akhirMinggu(b); }).sort(function (x, y) { return x.tgl < y.tgl ? -1 : 1; });
    var lain = tr.filter(function (x) { return x.jenis === 'masuk' && !x.ref; }), kel = tr.filter(function (x) { return x.jenis === 'keluar'; });
    var t = '*LAPORAN KAS ' + namaPeriode(b).toUpperCase() + '*\n' + (window.TEMA.nama || '') + '\n\n' +
      'Saldo awal: ' + rp(awal) + '\n\n*Pemasukan*\n• Iuran anggota (' + r.lunas.length + '/' + r.total + ' anggota): ' + rp(kb.iuran) + '\n' +
      lain.map(function (x) { return '• ' + x.ket + ': ' + rp(x.jumlah); }).join('\n') + (lain.length ? '\n' : '') +
      'Total masuk: ' + rp(kb.masuk) + '\n\n*Pengeluaran*\n' +
      (kel.length ? kel.map(function (x) { return '• ' + tglPendek(x.tgl) + ' ' + x.ket + ': ' + rp(x.jumlah); }).join('\n') : '• (tidak ada)') +
      '\nTotal keluar: ' + rp(kb.keluar) + '\n\n*Saldo akhir: ' + rp(akhir) + '*';
    if (r.belum.length) t += '\n\nBelum bayar: ' + r.belum.slice().sort(urutNama).map(function (w) { return w.nama; }).join(', ');
    return { teks: t + '\n\n' + D.pengaturan.bendahara, awal: awal, akhir: akhir, kb: kb };
  }
  function pesanLaporan() {
    var mode = S.lap || 'minggu', b = bk();
    if (mode === 'minggu') { var L0 = pesanLaporanMinggu(); L0.judul = namaPeriode(b); L0.mode = mode; return L0; }
    var tahun = mode === 'tahun', dari = tahun ? S.tahun + '-01-01' : kunciBulan(S.tahun, S.bulan) + '-01';
    var sampai = tahun ? S.tahun + '-12-31' : isoTgl(new Date(S.tahun, S.bulan + 1, 0));
    var judul = tahun ? 'tahun ' + S.tahun : BULAN[S.bulan].toLowerCase() + ' ' + S.tahun;
    var tr = D.kas.filter(function (x) { return x.tgl >= dari && x.tgl <= sampai; }).sort(function (x, y) { return x.tgl < y.tgl ? -1 : x.tgl > y.tgl ? 1 : 0; });
    var masuk = 0, keluar = 0, iuran = 0, nIuran = 0;
    tr.forEach(function (x) { if (x.jenis === 'masuk') { masuk += x.jumlah; if (x.ref) { iuran += x.jumlah; nIuran++; } } else keluar += x.jumlah; });
    var awal = saldo(tambahHari(dari, -1)), akhir = awal + masuk - keluar;
    var lain = tr.filter(function (x) { return x.jenis === 'masuk' && !x.ref; }), kel = tr.filter(function (x) { return x.jenis === 'keluar'; });
    function baris(x) { return '• ' + tglPendek(x.tgl) + ' ' + x.ket + ': ' + rp(x.jumlah); }
    var t = '*LAPORAN KAS ' + judul.toUpperCase() + '*\n' + (window.TEMA.nama || '') + '\n\nSaldo awal: ' + rp(awal) + '\n\n*Pemasukan*\n• Iuran anggota (' + nIuran + ' pembayaran): ' + rp(iuran) + '\n' +
      lain.map(baris).join('\n') + (lain.length ? '\n' : '') + 'Total masuk: ' + rp(masuk) + '\n';
    if (tahun) {
      var rows = [];
      for (var m = 0; m < 12; m++) {
        var d1 = kunciBulan(S.tahun, m) + '-01', d2 = isoTgl(new Date(S.tahun, m + 1, 0)), mm = 0, kk = 0, ada = false;
        D.kas.forEach(function (x) { if (x.tgl >= d1 && x.tgl <= d2) { ada = true; if (x.jenis === 'masuk') mm += x.jumlah; else kk += x.jumlah; } });
        if (ada) rows.push('• ' + BULAN[m] + ': masuk ' + rp(mm) + ', keluar ' + rp(kk) + ', saldo ' + rp(saldo(d2)));
      }
      t += '\n*Ringkasan per bulan*\n' + (rows.length ? rows.join('\n') : '• (belum ada transaksi)') + '\n';
    } else {
      t += '\n*Iuran per minggu*\n' + mingguBulan(S.tahun, S.bulan).map(function (k, i) { var r = rekap(k); return '• Minggu ' + (i + 1) + ' (' + rentang(k) + '): ' + r.lunas.length + '/' + r.total + ' anggota lunas'; }).join('\n') + '\n';
    }
    t += '\n*Pengeluaran*\n' + (kel.length ? kel.map(baris).join('\n') : '• (tidak ada)') + '\nTotal keluar: ' + rp(keluar) + '\n\n*Saldo akhir: ' + rp(akhir) + '*';
    return { teks: t + '\n\n' + D.pengaturan.bendahara, awal: awal, akhir: akhir, kb: { masuk: masuk, keluar: keluar }, judul: judul, mode: mode };
  }
  function renderSisi() {
    var g = pesanGrup();
    $('#pesanGrup').textContent = g;
    $('#waGrup').href = 'https://wa.me/?text=' + encodeURIComponent(g);
    var b = bk();
    var tr = D.kas.filter(function (x) { return x.tgl >= b && x.tgl <= akhirMinggu(b); }).sort(function (x, y) { return x.tgl < y.tgl ? 1 : -1; });
    $('#listKas').innerHTML = tr.length ? tr.map(function (x, i) {
      return '<li class="' + x.jenis + ' muncul" style="--i:' + Math.min(i, 12) + '"><span class="t-ikon">' + (x.jenis === 'masuk' ? IK.naik : IK.turun) + '</span><span class="t-isi"><b>' + esc(x.ket) + '</b><small>' + tglPendek(x.tgl) + (x.ref ? ' · otomatis dari iuran' : '') + '</small></span><span class="jml">' + (x.jenis === 'masuk' ? '+' : '−') + rp(x.jumlah) + '</span>' +
        (x.ref || !ADMIN ? '' : '<button class="hapus-t" type="button" data-hapus-kas="' + x.id + '" aria-label="Hapus transaksi ' + esc(x.ket) + '">' + IK.hapus + '</button>') + '</li>';
    }).join('') : '<li class="kosong">' + IK.kosong + '<b>Belum ada transaksi</b>' + (ADMIN ? 'Catat pemasukan atau pengeluaran di atas.' : 'Belum ada pemasukan atau pengeluaran di minggu ini.') + '</li>';
    var L = pesanLaporan();
    $('.lap-kop h3').textContent = { minggu: 'Laporan mingguan', bulan: 'Laporan bulanan', tahun: 'Laporan tahunan' }[L.mode];
    $$('[data-lap]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.lap === L.mode)); });
    $('#lapRingkas').innerHTML = '<div><small>Saldo awal</small><b>' + rp(L.awal) + '</b></div><div><small>Masuk</small><b>' + rp(L.kb.masuk) + '</b></div><div><small>Keluar</small><b>' + rp(L.kb.keluar) + '</b></div><div class="sorot-akhir"><small>Saldo akhir</small><b>' + rp(L.akhir) + '</b></div>';
    $('#pesanLap').textContent = L.teks;
    var f = $('#formKas'), z = akhirMinggu(b); if (!f.tgl.value || f.tgl.value < b || f.tgl.value > z) f.tgl.value = (hariIni() >= b && hariIni() <= z) ? hariIni() : b;
  }
  function perbaruiTeks() { renderSisi(); }
  function render() {
    renderPahlawan(); renderBulan(); renderMinggu(); renderDaftar(); renderSisi(); tandaiBagian();
    $('#subBendahara').textContent = D.pengaturan.bendahara;
    if (bagianSorot) sorot(bagianSorot);
  }

  /* ========== 5. Aksi ========== */
  var tToast;
  function toast(teks, aksi) {
    var t = $('#toast'); clearTimeout(tToast);
    t.innerHTML = '<span>' + esc(teks) + '</span>' + (aksi ? '<button type="button">' + esc(aksi.label) + '</button>' : '');
    if (aksi) $('button', t).onclick = function () { aksi.fn(); t.classList.remove('tampil'); };
    requestAnimationFrame(function () { t.classList.add('tampil'); });
    tToast = setTimeout(function () { t.classList.remove('tampil'); }, aksi ? 5000 : 2600);
  }
  function salin(teks, label) {
    function cadangan() { var a = document.createElement('textarea'); a.value = teks; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); }
    (navigator.clipboard && window.isSecureContext ? navigator.clipboard.writeText(teks).catch(cadangan) : Promise.resolve(cadangan())).then(function () { toast(label + ' tersalin, tinggal tempel di WhatsApp'); });
  }
  // Logo RT dari KONFIG; gagal dimuat -> inisial nama RT.
  function pasangLogo() {
    $$('[data-logo]').forEach(function (im) {
      im.onerror = function () { var s = document.createElement('span'); s.className = 'logo-inisial'; s.textContent = inisial(($('[data-tema-nama]') || {}).textContent || 'MPN') || 'MPN'; im.replaceWith(s); };
      im.src = KONFIG.logo;
    });
  }
  // Foto bukti bayar opsional: diperkecil via canvas (<= KONFIG.maksFoto px), disimpan sebagai dataURL.
  function kecilkan(file, cb) {
    var r = new FileReader();
    r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, KONFIG.maksFoto / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', 0.75)); }; im.onerror = function () { toast('Berkas bukan gambar'); }; im.src = r.result; };
    r.readAsDataURL(file);
  }
  function pilihFoto(w, b) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function () { if (!inp.files[0]) return; kecilkan(inp.files[0], function (u) { D.bukti[b] = D.bukti[b] || {}; D.bukti[b][w.id] = u; simpan(); renderDaftar(); toast('Foto bukti ' + w.nama + ' tersimpan'); }); };
    inp.click();
  }
  function kelolaBukti(w) {
    var b = bk(), f = D.bukti[b] && D.bukti[b][w.id];
    if (!f) { pilihFoto(w, b); return; }
    var lp = document.createElement('div'); lp.className = 'bukti-lihat'; lp.setAttribute('role', 'dialog'); lp.setAttribute('aria-label', 'Foto bukti ' + w.nama);
    lp.innerHTML = '<figure><img src="' + f + '" alt="Foto bukti bayar ' + esc(w.nama) + '"><figcaption>' + esc(w.nama) + ' · ' + namaPeriode(b) + '</figcaption><div class="baris-aksi"><button class="btn" type="button" data-a="ganti">Ganti</button><button class="btn btn-garis" type="button" data-a="hapus">Hapus</button><button class="btn btn-garis" type="button" data-a="tutup">Tutup</button></div></figure>';
    lp.onclick = function (e) { var a = e.target.closest('[data-a]'); if (!a && e.target !== lp) return; lp.remove(); if (!a) return; a = a.dataset.a; if (a === 'ganti') pilihFoto(w, b); if (a === 'hapus') { delete D.bukti[b][w.id]; simpan(); renderDaftar(); } };
    document.body.appendChild(lp); lp.querySelector('[data-a="tutup"]').focus();
  }
  pasangLogo();
  // Ketuk baris = lunas / batal, dengan Urungkan.
  $('#listWarga').addEventListener('click', function (e) {
    if (!ADMIN) return;
    var mn = e.target.closest('[data-menu]');
    if (mn) { bukaMenu(cariWarga(mn.getAttribute('data-menu'))); return; }
    var wa = e.target.closest('[data-wa]');
    if (wa) { bukaPengingat(cariWarga(wa.getAttribute('data-wa'))); return; }
    var bt = e.target.closest('[data-bukti]');
    if (bt) { kelolaBukti(cariWarga(bt.getAttribute('data-bukti'))); return; }
    var k = e.target.closest('.ketuk'); if (!k) return;
    var li = k.closest('.baris'), w = cariWarga(li.dataset.id), b = bk(), l = lunasDi(b, w.id), tglLama = l ? D.bayar[b][w.id] : null;
    setLunas(w, b, !l); catat((l ? 'Membatalkan lunas: ' : 'Menandai lunas: ') + w.nama + ' (' + namaPeriode(b) + ')');
    li.classList.toggle('lunas', !l); li.classList.remove('denyut'); void li.offsetWidth; li.classList.add('denyut');
    k.setAttribute('aria-pressed', String(!l));
    setTimeout(function () { renderDaftar(); fokusBaris(w.id); }, S.saring === 'semua' && !S.cari ? 0 : 380);
    renderPahlawan(); renderBulan(); renderMinggu(); renderSisi();
    toast(w.nama + (l ? ' dibatalkan' : ' lunas ' + rp(D.pengaturan.iuran)), { label: 'Urungkan', fn: function () { setLunas(w, b, l, tglLama); catat('Urungkan: ' + w.nama + ' (' + namaPeriode(b) + ')'); render(); fokusBaris(w.id); } });
  });
  function fokusBaris(id) { var el = $('.baris[data-id="' + id + '"] .ketuk'); if (el && document.activeElement && document.activeElement.closest && !document.activeElement.closest('.baris[data-id="' + id + '"]')) { if (document.activeElement === document.body || document.activeElement.closest('.daftar')) el.focus({ preventScroll: true }); } }
  function cariWarga(id) { return D.warga.filter(function (w) { return w.id === id; })[0]; }
  $('#cari').addEventListener('input', function () { S.cari = this.value.trim(); renderDaftar(); });
  $$('.chip[data-saring]').forEach(function (c) { c.addEventListener('click', function () { S.saring = c.dataset.saring; $$('.chip[data-saring]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); renderDaftar(); tandaiBagian(); }); });
  $('#bulanTab').addEventListener('click', function (e) { var t = e.target.closest('.bln'); if (!t) return; S.bulan = +t.dataset.bln; S.minggu = awalIdx(S.tahun, S.bulan); render(); $('.bln[aria-selected="true"]').focus({ preventScroll: true }); });
  $('#bulanTab').addEventListener('keydown', function (e) {
    var d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key]; if (d == null) return; e.preventDefault();
    S.bulan = Math.max(0, Math.min(11, S.bulan + d)); S.minggu = awalIdx(S.tahun, S.bulan); render(); $('.bln[aria-selected="true"]').focus();
  });
  $('#tahunMundur').onclick = function () { S.tahun--; S.minggu = awalIdx(S.tahun, S.bulan); render(); };
  $('#tahunMaju').onclick = function () { S.tahun++; S.minggu = awalIdx(S.tahun, S.bulan); render(); };
  $('#mingguTab').addEventListener('click', function (e) { var t = e.target.closest('.mg'); if (!t) return; S.minggu = +t.dataset.mg; render(); $('.mg[aria-selected="true"]').focus({ preventScroll: true }); });
  $('#mingguTab').addEventListener('keydown', function (e) {
    var d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key]; if (d == null) return; e.preventDefault();
    S.minggu = Math.max(0, Math.min(mingguBulan(S.tahun, S.bulan).length - 1, idxMinggu() + d)); render(); $('.mg[aria-selected="true"]').focus();
  });
  // Tab samping dengan penanda geser.
  function pilihTab(id, fokus) {
    S.tab = id; var tabs = $$('.seg [role="tab"]');
    tabs.forEach(function (t, i) { var on = t.dataset.tab === id; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; $('#' + t.getAttribute('aria-controls')).hidden = !on; if (on) { $('.seg-penanda').style.transform = 'translateX(' + (i * 100) + '%)'; if (fokus) t.focus(); } });
  }
  $('.seg').addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t) pilihTab(t.dataset.tab); });
  $('.seg').addEventListener('keydown', function (e) {
    var ids = ['ingat', 'kas', 'lap'], i = ids.indexOf(S.tab), d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); pilihTab(ids[(i + d + 3) % 3], true);
  });
  $('#salinGrup').onclick = function () { salin(pesanGrup(), 'Rekap grup'); };
  $('#salinLap').onclick = function () { salin(pesanLaporan().teks, 'Laporan'); };
  $('#bagiLap').onclick = function () {
    var t = pesanLaporan().teks;
    if (navigator.share) navigator.share({ title: 'Laporan kas ' + pesanLaporan().judul, text: t }).catch(function () {});
    else window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener');
  };
  $('#cetakLap').onclick = function () { window.print(); };
  $('.lap-mode').addEventListener('click', function (e) { var c = e.target.closest('[data-lap]'); if (!c) return; S.lap = c.dataset.lap; renderSisi(); });
  // Form kas
  function angka(v) { return Number(String(v).replace(/\D/g, '')) || 0; }
  $('#formKas').jumlah.addEventListener('input', function () { var n = angka(this.value); this.value = n ? ribu(n) : ''; });
  $('#formKas').addEventListener('submit', function (e) {
    e.preventDefault(); if (!ADMIN) return; var f = this, g = $('#galatKas'), n = angka(f.jumlah.value), ket = f.ket.value.trim();
    [f.ket, f.jumlah, f.tgl].forEach(function (x) { x.removeAttribute('aria-invalid'); });
    var salah = !ket ? f.ket : !n ? f.jumlah : !f.tgl.value ? f.tgl : null;
    if (salah) { salah.setAttribute('aria-invalid', 'true'); g.textContent = !ket ? 'Isi keterangan transaksi.' : !n ? 'Jumlah harus lebih dari 0.' : 'Pilih tanggal.'; salah.focus(); return; }
    g.textContent = '';
    var x = { id: idBaru('k'), tgl: f.tgl.value, jenis: f.jenis.value, ket: ket, jumlah: n };
    D.kas.push(x); simpan(); catat('Mencatat ' + (x.jenis === 'masuk' ? 'pemasukan ' : 'pengeluaran ') + rp(n) + ': ' + ket + ' (' + tglPendek(x.tgl) + ')');
    f.ket.value = ''; f.jumlah.value = '';
    if (x.tgl < bk() || x.tgl > akhirMinggu(bk())) { var sn = seninDari(x.tgl), p = sn.split('-'); S.tahun = +p[0]; S.bulan = +p[1] - 1; S.minggu = Math.max(0, mingguBulan(S.tahun, S.bulan).indexOf(sn)); }
    render(); toast((x.jenis === 'masuk' ? 'Pemasukan ' : 'Pengeluaran ') + rp(n) + ' dicatat');
  });
  $('#listKas').addEventListener('click', function (e) {
    var h = e.target.closest('[data-hapus-kas]'); if (!h || !ADMIN) return;
    var id = h.getAttribute('data-hapus-kas'), idx = -1, x;
    D.kas.forEach(function (k, i) { if (k.id === id) { idx = i; x = k; } });
    if (!x) return; D.kas.splice(idx, 1); simpan(); catat('Menghapus transaksi: ' + x.ket + ' ' + rp(x.jumlah) + ' (' + tglPendek(x.tgl) + ')'); render();
    toast('Transaksi dihapus', { label: 'Urungkan', fn: function () { D.kas.splice(idx, 0, x); simpan(); catat('Urungkan hapus transaksi: ' + x.ket); render(); } });
  });
  // Mode terang/gelap
  $('#btnMode').onclick = function () {
    var m = document.documentElement.getAttribute('data-mode') === 'gelap' ? 'terang' : 'gelap';
    try { localStorage.setItem(KUNCI_MODE, m); } catch (e) {}
    terapkan({ mode: m });
  };

  /* Modal */
  var pemicu = null;
  function bukaModal(judul, html, siap) {
    pemicu = document.activeElement;
    $('#modalJudul').textContent = judul; $('#modalIsi').innerHTML = html;
    var m = $('#modal'); m.hidden = false; m.classList.remove('keluar');
    tandaiBagian();
    var f = $('input,textarea,button:not([data-tutup])', m); if (f) f.focus();
    if (siap) siap($('#modalIsi'));
  }
  function tutupModal() {
    var m = $('#modal'); if (m.hidden) return;
    m.classList.add('keluar');
    setTimeout(function () { m.hidden = true; m.classList.remove('keluar'); if (pemicu && pemicu.focus) pemicu.focus(); }, GERAK ? 200 : 0);
  }
  $('#modal').addEventListener('click', function (e) { if (e.target === this || e.target.closest('[data-tutup]')) tutupModal(); });
  document.addEventListener('keydown', function (e) {
    var m = $('#modal'); if (m.hidden) return;
    if (e.key === 'Escape') tutupModal();
    if (e.key === 'Tab') { var f = $$('button,a[href],input,textarea,select', m).filter(function (x) { return !x.disabled && x.offsetParent; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  function bukaMenu(w) {
    var b = bk(), l = lunasDi(b, w.id);
    bukaModal(w.nama,
      '<div class="menu-aksi">' +
      (w.nonaktif ? '' : '<button class="btn btn-garis lebar" type="button" id="mMulti">' + IK.kalender + '<span>Bayar beberapa minggu</span></button>') +
      (l || w.nonaktif ? '' : '<button class="btn btn-garis lebar" type="button" id="mWa">' + IK.wa + '<span>Kirim pengingat WhatsApp</span></button>') +
      '<button class="btn btn-garis lebar" type="button" id="mUbah">' + IK.ubah + '<span>Ubah data</span></button>' +
      '<button class="btn btn-garis lebar" type="button" id="mAktif"><span>' + (w.nonaktif ? 'Aktifkan kembali' : 'Nonaktifkan anggota') + '</span></button></div>' +
      '<p class="sub">' + (w.nonaktif ? 'Anggota nonaktif tidak muncul di daftar minggu yang belum ada pembayarannya. Riwayat pembayarannya tetap tersimpan.' : 'Nonaktifkan anggota yang sudah keluar. Riwayat pembayarannya tetap tersimpan dan ia tidak lagi dihitung belum bayar.') + '</p>',
      function (r) {
        var m = $('#mMulti', r); if (m) m.onclick = function () { bukaMulti(w); };
        var wa = $('#mWa', r); if (wa) wa.onclick = function () { bukaPengingat(w); };
        $('#mUbah', r).onclick = function () { formWarga(w); };
        $('#mAktif', r).onclick = function () {
          var nonaktif = !w.nonaktif;
          if (nonaktif && !confirm('Nonaktifkan ' + w.nama + '? Ia tidak lagi dihitung belum bayar. Riwayatnya tetap tersimpan dan bisa diaktifkan kembali.')) return;
          var x = cariWarga(w.id) || w; if (nonaktif) x.nonaktif = true; else delete x.nonaktif;
          simpan(); catat((nonaktif ? 'Menonaktifkan anggota: ' : 'Mengaktifkan kembali anggota: ') + x.nama); tutupModal(); render();
          toast(x.nama + (nonaktif ? ' dinonaktifkan' : ' diaktifkan kembali'), { label: 'Urungkan', fn: function () { if (nonaktif) delete x.nonaktif; else x.nonaktif = true; simpan(); catat('Urungkan: ' + x.nama); render(); } });
        };
      });
  }
  function bukaMulti(w) {
    var b0 = bk(), iuran = Number(D.pengaturan.iuran) || 0;
    function tahunDari(k) { return akhirMinggu(k).slice(0, 4); }
    bukaModal('Bayar beberapa minggu',
      '<p class="sub"><b>' + esc(w.nama) + '</b> · mulai ' + namaPeriode(b0) + '. Minggu yang sudah lunas dilewati.</p>' +
      '<form id="fMulti" novalidate class="form-kas">' +
      '<label class="field"><span>Jumlah minggu (1–26)</span><input name="jml" inputmode="numeric" maxlength="2" autocomplete="off" value="4"></label>' +
      '<ul class="ringkas-minggu" id="mDaftar" aria-live="polite"></ul>' +
      '<p class="galat" id="gMulti" role="alert"></p>' +
      '<button class="btn lebar" type="submit">Tandai lunas</button></form>',
      function (r) {
        var f = $('#fMulti', r);
        function minggu() { var n = Math.min(26, angka(f.jml.value)), a = []; for (var i = 0; i < n; i++) a.push(tambahHari(b0, 7 * i)); return a; }
        function tampil() {
          var a = minggu(), baru = a.filter(function (k) { return !lunasDi(k, w.id); });
          $('#mDaftar', r).innerHTML = a.map(function (k) { var sdh = lunasDi(k, w.id); return '<li' + (sdh ? ' class="lewat"' : '') + '><span>' + rentang(k) + ' ' + tahunDari(k) + '</span><b>' + (sdh ? 'sudah lunas' : rp(iuran)) + '</b></li>'; }).join('') + (a.length ? '<li class="total"><span>Total (' + baru.length + ' minggu)</span><b>' + rp(baru.length * iuran) + '</b></li>' : '');
        }
        f.jml.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 2); tampil(); });
        tampil();
        f.addEventListener('submit', function (e) {
          e.preventDefault(); var n = angka(f.jml.value);
          if (n < 1 || n > 26) { $('#gMulti', r).textContent = 'Isi jumlah minggu 1 sampai 26.'; f.jml.setAttribute('aria-invalid', 'true'); return; }
          var x = cariWarga(w.id) || w, baru = minggu().filter(function (k) { return !lunasDi(k, x.id); });
          if (!baru.length) { $('#gMulti', r).textContent = 'Semua minggu itu sudah lunas.'; return; }
          baru.forEach(function (k) { setLunas(x, k, true, undefined, true); });
          simpan(); catat('Bayar beberapa minggu: ' + x.nama + ' · ' + baru.length + ' minggu (' + rentang(baru[0]) + ' s/d ' + rentang(baru[baru.length - 1]) + '), ' + rp(baru.length * iuran));
          tutupModal(); render();
          toast(x.nama + ' lunas ' + baru.length + ' minggu · ' + rp(baru.length * iuran), { label: 'Urungkan', fn: function () { baru.forEach(function (k) { setLunas(x, k, false, undefined, true); }); simpan(); catat('Urungkan bayar beberapa minggu: ' + x.nama); render(); } });
        });
      });
  }
  function waktuLokal(iso) { if (!iso) return 'baru saja'; var d = new Date(iso); return d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear() + ', ' + pad(d.getHours()) + '.' + pad(d.getMinutes()); }
  function bukaRiwayat() {
    bukaModal('Riwayat perubahan',
      '<p class="sub">Dicatat otomatis setiap pengurus mengubah data. Catatan tidak bisa diubah atau dihapus. Menampilkan 100 terakhir.</p><ul class="riwayat" id="lRiwayat"><li>Memuat…</li></ul>',
      function (r) {
        BACKEND.riwayat(100).then(function (a) {
          $('#lRiwayat', r).innerHTML = a.length ? a.map(function (x) { return '<li><small>' + esc(waktuLokal(x.waktu)) + ' · ' + esc(String(x.oleh).split('@')[0]) + '</small><span>' + esc(x.aksi) + '</span></li>'; }).join('') : '<li>Belum ada catatan.</li>';
        }).catch(function (e) { $('#lRiwayat', r).innerHTML = '<li>Gagal memuat riwayat: ' + esc(pesanGalat(e)) + '</li>'; });
      });
  }
  $('#btnRiwayat').onclick = function () { if (ADMIN && window.BACKEND && BACKEND.riwayat) bukaRiwayat(); };
  function bukaPengingat(w) {
    var t = pesanPengingat(w), n = noWA(w.hp);
    bukaModal('Pengingat untuk ' + w.nama,
      '<p class="sub">' + (w.hp ? esc(w.hp) : 'Nomor WA belum diisi') + '</p>' +
      '<label class="field"><span>Pesan (boleh diubah)</span><textarea id="tPesan" rows="9">' + esc(t) + '</textarea></label>' +
      '<div class="baris-aksi"><a class="btn btn-wa" id="bWa" target="_blank" rel="noopener">' + IK.wa + '<span>Buka di WhatsApp</span></a><button class="btn btn-garis" type="button" id="bSalin">Salin pesan</button>' +
      '<button class="btn btn-garis" type="button" id="bUbahW">' + IK.ubah + '<span>Ubah data</span></button></div>',
      function (r) {
        function link() { $('#bWa', r).href = 'https://wa.me/' + n + '?text=' + encodeURIComponent($('#tPesan', r).value); }
        link(); $('#tPesan', r).addEventListener('input', link);
        $('#bSalin', r).onclick = function () { salin($('#tPesan', r).value, 'Pesan'); };
        $('#bUbahW', r).onclick = function () { formWarga(w); };
      });
  }
  function formWarga(w) {
    var baru = !w; w = w || { nama: '', hp: '' };
    bukaModal(baru ? 'Tambah anggota' : 'Ubah data anggota',
      '<form id="fW" novalidate class="form-kas">' +
      '<label class="field"><span>Nama Anggota</span><input name="nama" required maxlength="60" value="' + esc(w.nama) + '" autocomplete="off"></label>' +
      '<label class="field"><span>Nomor WhatsApp (opsional)</span><input name="hp" type="tel" inputmode="tel" maxlength="16" placeholder="08xxxxxxxxxx" value="' + esc(w.hp) + '"></label>' +
      '<p class="galat" id="gW" role="alert"></p>' +
      '<div class="baris-aksi"><button class="btn" type="submit">Simpan</button>' + (baru ? '' : '<button class="btn btn-bahaya" type="button" id="hapusW">' + IK.hapus + '<span>Hapus anggota</span></button>') + '</div></form>',
      function (r) {
        $('#fW', r).addEventListener('submit', function (e) {
          e.preventDefault(); var f = this, nama = f.nama.value.trim();
          f.nama.removeAttribute('aria-invalid');
          var salah = !nama ? f.nama : null;
          if (salah) { salah.setAttribute('aria-invalid', 'true'); $('#gW', r).textContent = 'Nama anggota wajib diisi.'; salah.focus(); return; }
          if (baru) { w = { id: idBaru('w') }; D.warga.push(w); } else { w = cariWarga(w.id) || w; }
          w.nama = nama; w.hp = f.hp.value.trim();
          simpan(); catat(baru ? 'Menambah anggota: ' + nama : 'Mengubah data anggota: ' + nama); tutupModal(); render(); toast(baru ? nama + ' ditambahkan' : 'Data ' + nama + ' disimpan');
        });
        var h = $('#hapusW', r);
        if (h) h.onclick = function () {
          if (!confirm('Hapus ' + w.nama + ' dari daftar? Riwayat iuran yang sudah masuk kas tetap tercatat.')) return;
          D.warga = D.warga.filter(function (x) { return x.id !== w.id; }); simpan(); catat('Menghapus anggota: ' + w.nama); tutupModal(); render(); toast(w.nama + ' dihapus');
        };
      });
  }
  $('#btnTambahWarga').onclick = function () { if (ADMIN) formWarga(); };
  $('#btnAtur').onclick = function () {
    if (!ADMIN) return;
    var p = D.pengaturan;
    bukaModal('Pengaturan & data',
      '<form id="fA" novalidate class="form-kas">' +
      '<div class="dua"><label class="field"><span>Iuran per anggota / minggu (Rp)</span><input name="iuran" inputmode="numeric" value="' + ribu(p.iuran) + '"></label><label class="field"><span>Batas bayar</span><input name="batas" type="text" maxlength="40" autocomplete="off" value="' + esc(p.batas) + '"></label></div>' +
      '<label class="field"><span>Nama bendahara (penutup pesan)</span><input name="bendahara" maxlength="60" value="' + esc(p.bendahara) + '"></label>' +
      '<label class="field"><span>Cara bayar (muncul di pesan)</span><textarea name="bayarKe" rows="2" maxlength="160">' + esc(p.bayarKe) + '</textarea></label>' +
      '<p class="galat" id="gA" role="alert"></p><button class="btn lebar" type="submit">Simpan pengaturan</button></form>' +
      '<p class="sub">Nama organisasi & warna diatur di <b>tema.js</b> / <b>tema.css</b>. Ubah nominal iuran tidak mengubah pembayaran yang sudah tercatat.</p>' +
      '<div class="baris-aksi"><button class="btn btn-garis" type="button" id="isiContoh">Isi data contoh</button><button class="btn btn-bahaya" type="button" id="kosongkan">' + IK.hapus + '<span>Kosongkan semua</span></button></div>',
      function (r) {
        var f = $('#fA', r);
        f.iuran.addEventListener('input', function () { var n = angka(this.value); this.value = n ? ribu(n) : ''; });
        f.addEventListener('submit', function (e) {
          e.preventDefault(); var n = angka(f.iuran.value), bt = f.batas.value.trim();
          if (!n) { $('#gA', r).textContent = 'Iuran harus lebih dari 0.'; f.iuran.setAttribute('aria-invalid', 'true'); return; }
          var lama = Object.assign({}, D.pengaturan);
          Object.assign(D.pengaturan, { iuran: n, batas: bt, bendahara: f.bendahara.value.trim() || 'Bendahara', bayarKe: f.bayarKe.value.trim() });
          var ub = []; if (Number(lama.iuran) !== n) ub.push('iuran ' + rp(lama.iuran) + ' → ' + rp(n)); if ((lama.batas || '') !== bt) ub.push('batas bayar'); if (lama.bendahara !== D.pengaturan.bendahara) ub.push('nama bendahara'); if ((lama.bayarKe || '') !== D.pengaturan.bayarKe) ub.push('cara bayar');
          simpan(); if (ub.length) catat('Mengubah pengaturan: ' + ub.join(', ')); tutupModal(); render(); toast('Pengaturan disimpan');
        });
        $('#isiContoh', r).onclick = function () { if (!confirm('Ganti semua data dengan data contoh? Buat Backup JSON dulu bila perlu.')) return; D = window.DATA_CONTOH(); migrasi(D); simpan(); catat('Mengganti semua data dengan data contoh'); tutupModal(); render(); toast('Data contoh dimuat'); };
        $('#kosongkan', r).onclick = function () {
          if (!confirm('Hapus SEMUA anggota, iuran, dan kas di perangkat ini? Tidak bisa dibatalkan kecuali kamu punya Backup JSON.')) return;
          D = { versi: 1, pengaturan: D.pengaturan, warga: [], bayar: {}, kas: [] }; simpan(); catat('Mengosongkan semua data'); tutupModal(); render(); toast('Semua data dikosongkan');
        };
      });
  };

  /* ========== 6. Ekspor & cadangan ========== */
  function unduh(nama, isi, tipe) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([isi], { type: tipe })); a.download = nama;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function sel(v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  $('#eksCsv').onclick = function () {
    var b = bk(), baris = [['Bagian', 'Tanggal', 'Nama / Keterangan', 'Status / Jenis', 'Jumlah']];
    D.warga.slice().sort(urutNama).forEach(function (w) {
      var l = lunasDi(b, w.id); baris.push(['Iuran ' + namaPeriode(b), l ? D.bayar[b][w.id] : '', w.nama, l ? 'Lunas' : 'Belum', l ? D.pengaturan.iuran : 0]);
    });
    D.kas.slice().sort(function (x, y) { return x.tgl < y.tgl ? -1 : 1; }).forEach(function (x) { baris.push(['Kas', x.tgl, x.ket, x.jenis, (x.jenis === 'masuk' ? 1 : -1) * x.jumlah]); });
    unduh('iuran-kas-' + b + '.csv', '﻿' + baris.map(function (r) { return r.map(sel).join(','); }).join('\r\n'), 'text/csv;charset=utf-8');
    toast('CSV diunduh: iuran ' + namaPeriode(b) + ' + semua kas');
  };
  $('#eksJson').onclick = function () { unduh('backup-iuran-kas-' + hariIni() + '.json', JSON.stringify(D, null, 2), 'application/json'); toast('Backup JSON diunduh'); };
  $('#impJson').onclick = function () { if (ADMIN) $('#berkasJson').click(); };
  $('#berkasJson').onchange = function () {
    var f = this.files[0]; if (!f) return; var self = this;
    f.text().then(function (t) {
      var d = JSON.parse(t);
      if (!d || !Array.isArray(d.warga) || !Array.isArray(d.kas)) throw new Error('format');
      if (!confirm('Pulihkan dari ' + f.name + '? Data sekarang akan diganti (' + d.warga.length + ' anggota, ' + d.kas.length + ' transaksi).')) return;
      migrasi(d); D = d; simpan(); catat('Memulihkan data dari backup (' + d.warga.length + ' anggota, ' + d.kas.length + ' transaksi)'); render(); toast('Data dipulihkan dari backup');
    }).catch(function () { toast('Berkas bukan backup Iuran & Kas MPN yang valid'); }).then(function () { self.value = ''; });
  };

  /* Masuk / keluar pengurus */
  function labelMasuk() { var b = $('#btnMasuk'); if (b) b.textContent = emailMasuk ? 'Keluar (' + emailMasuk + ')' : 'Masuk pengurus'; }
  function bukaLogin() {
    bukaModal('Masuk pengurus',
      '<form id="fM" novalidate class="form-kas">' +
      '<label class="field"><span>Email</span><input name="email" type="email" inputmode="email" autocomplete="username" required></label>' +
      '<label class="field"><span>Kata sandi</span><input name="sandi" type="password" autocomplete="current-password" required></label>' +
      '<p class="galat" id="gM" role="alert"></p><button class="btn lebar" type="submit">Masuk</button></form>' +
      '<p class="sub">Hanya untuk pengurus. Anggota cukup melihat tanpa masuk.</p>',
      function (r) {
        $('#fM', r).addEventListener('submit', function (e) {
          e.preventDefault(); var f = this, em = f.email.value.trim(), pw = f.sandi.value, g = $('#gM', r);
          if (!em || !pw) { g.textContent = 'Isi email dan kata sandi.'; return; }
          g.textContent = 'Memeriksa…';
          BACKEND.masuk(em, pw).then(function () { tutupModal(); toast('Berhasil masuk'); }).catch(function (err) { g.textContent = pesanGalat(err); });
        });
      });
  }
  $('#btnMasuk').onclick = function () {
    if (emailMasuk) { BACKEND.keluar().then(function () { toast('Anda sudah keluar'); }); } else bukaLogin();
  };
  function pasangBackend() {
    if (!window.BACKEND) { S.memuat = false; render(); toast('Layanan online tidak tersedia.'); return; }
    BACKEND.pasang({
      saatData: function (d) { D = d; migrasi(D); S.memuat = false; render(); },
      saatPeran: function (peran, email) {
        var adminBaru = peran === 'admin', beda = adminBaru !== ADMIN;
        ADMIN = adminBaru; emailMasuk = email || '';
        document.documentElement.setAttribute('data-peran', ADMIN ? 'admin' : 'anggota');
        labelMasuk();
        if (beda) pilihTab(ADMIN ? 'ingat' : 'kas');
        render();
        if (email && !ADMIN && !S.peringatanAkun) { S.peringatanAkun = 1; setTimeout(function () { if (!ADMIN && emailMasuk) toast('Akun ini bukan pengurus, jadi hanya bisa melihat.'); }, 1500); }
      },
      saatGalat: function (m) { S.memuat = false; render(); toast(m); }
    });
  }

  /* Mulai */
  muat();
  if (window.TEMA && TEMA.nama) $$('[data-tema-nama]').forEach(function (el) { el.textContent = TEMA.nama; });
  hitungKontras();
  document.documentElement.setAttribute('data-peran', 'anggota');
  render();
  pilihTab('kas');
  pasangBackend();
})();
