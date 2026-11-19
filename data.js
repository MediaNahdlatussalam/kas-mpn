/* kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id. Lisensi Nonkomersial Maliki Studio: wajib kredit, dilarang dijual (lihat LICENSE). */
/* Data contoh (fiktif). Dipakai saat aplikasi pertama kali dibuka atau setelah "Isi data contoh".
   Iuran dicatat per minggu (Senin–Minggu); kunci pekan = tanggal Senin. Pekan dihitung relatif ke hari ini. */
window.DATA_CONTOH = function () {
  var kini = new Date();
  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function geser(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  var hari = iso(kini);
  var senin0 = geser(kini, -((kini.getDay() + 6) % 7));
  function batasi(t) { return t > hari ? hari : t; }
  var nama = [
    ['Budi Santoso', '081234567801'], ['Siti Rahmawati', '081234567802'], ['Agus Wibowo', '081234567803'],
    ['Dewi Lestari', '081234567804'], ['Hendra Gunawan', '081234567805'], ['Rina Marlina', '081234567806'],
    ['Yusuf Hidayat', '081234567807'], ['Fitri Handayani', '081234567808'], ['Joko Prasetyo', ''],
    ['Nur Aisyah', '081234567810'], ['Teguh Saputra', '081234567811'], ['Wulan Sari', '081234567812'],
    ['Bambang Irawan', '081234567813'], ['Maya Puspita', '081234567814'], ['Dodi Kurniawan', '081234567815'],
    ['Lilis Suryani', '081234567816'], ['Rudi Hartono', '081234567817'], ['Ani Wijayanti', '081234567818']
  ];
  var warga = nama.map(function (n, i) { return { id: 'w' + (i + 1), nama: n[0], hp: n[1] }; });
  var iuran = 5000;
  var bayar = {}, kas = [], n = 0;
  for (var p = -5; p <= 0; p++) {
    var mon = geser(senin0, p * 7), key = iso(mon);
    bayar[key] = {};
    warga.forEach(function (w, i) {
      var bayarIni = p < 0 ? ((i + p + 12) % 6 !== 0) : (i % 2 === 0);
      if (!bayarIni) return;
      var t = batasi(iso(geser(mon, i % 4)));
      bayar[key][w.id] = t;
      kas.push({ id: 'k' + (++n), tgl: t, jenis: 'masuk', ket: 'Iuran ' + w.nama, jumlah: iuran, ref: key + ':' + w.id });
    });
  }
  kas.unshift({ id: 'k0', tgl: iso(geser(senin0, -35)), jenis: 'masuk', ket: 'Saldo awal dari pengurus lama', jumlah: 250000 });
  kas.push(
    { id: 'kx1', tgl: iso(geser(senin0, -26)), jenis: 'keluar', ket: 'Beli perlengkapan', jumlah: 60000 },
    { id: 'kx2', tgl: iso(geser(senin0, -17)), jenis: 'masuk', ket: 'Sumbangan kegiatan (sisa)', jumlah: 30000 },
    { id: 'kx3', tgl: iso(geser(senin0, -11)), jenis: 'keluar', ket: 'Konsumsi kegiatan', jumlah: 45000 },
    { id: 'kx4', tgl: batasi(iso(geser(senin0, 1))), jenis: 'keluar', ket: 'Beli alat tulis', jumlah: 25000 }
  );
  return {
    versi: 1,
    pengaturan: { iuran: iuran, batas: 'setiap minggu', bendahara: 'Bu Wulan (Bendahara)', bayarKe: 'tunai ke bendahara atau transfer, lalu kirim bukti ke WA ini' },
    warga: warga, bayar: bayar, kas: kas
  };
};
