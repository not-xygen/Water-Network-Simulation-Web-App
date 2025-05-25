# Water Network Simulation Web App

## Deskripsi

Water Network Simulation Web App adalah aplikasi berbasis web yang dirancang
untuk mensimulasikan perilaku hidraulik dan kualitas air dalam sistem distribusi
air bertekanan. Proyek ini dikembangkan sebagai tugas akhir untuk
memvisualisasikan dan menganalisis aliran air, tekanan, dan parameter lainnya
dalam jaringan pipa menggunakan antarmuka yang interaktif dan ramah pengguna.
Aplikasi ini memungkinkan pengguna untuk memodelkan jaringan air, menjalankan
simulasi, dan melihat hasilnya dalam bentuk grafik atau peta.

## Fitur Utama

- **Pemodelan Jaringan Air**: Buat dan edit jaringan pipa dengan komponen
  seperti pipa, simpul, pompa, katup, dan tangki.
- **Simulasi Hidraulik**: Jalankan simulasi untuk menghitung aliran air,
  tekanan, dan tinggi air dalam tangki.
- **Visualisasi Interaktif**: Tampilkan hasil simulasi dalam bentuk grafik,
  tabel, atau peta jaringan.
- **Antarmuka Berbasis Web**: Akses aplikasi melalui browser tanpa perlu
  instalasi perangkat lunak tambahan.
- **Ekspor Hasil**: Simpan hasil simulasi dalam format seperti CSV atau JSON
  untuk analisis lebih lanjut.

## Teknologi yang Digunakan

- **Teknologi**: React + Vite + TypeScript
- **Simulasi**: Menggunakan Engine buatan sendiri
- **Penyimpanan Data**: Local storage atau database sederhana

## Prasyarat

Untuk menjalankan proyek ini secara lokal, pastikan Anda memiliki:

- Node.js (versi 16 atau lebih baru)
- Browser modern (Chrome, Firefox, atau Edge)
- Git (untuk mengkloning repositori)

## Instalasi

1. **Kloning Repositori**

   ```bash
   git clone https://github.com/not-xygen/Water-Network-Simulation-Web-App.git
   cd Water-Network-Simulation-Web-App
   ```

2. **Instal Dependensi**:

   ```bash
   pnpm install
   ```

3. **Jalankan Aplikasi (mode development)**:

   ```bash
   pnpm run dev
   ```

4. Buka browser dan akses `http://localhost:5173` (atau port yang sesuai).

## Cara Penggunaan

1. **Buat Jaringan**: Gunakan editor jaringan untuk menambahkan pipa, simpul,
   dan komponen lainnya.
2. **Konfigurasi Parameter**: Atur parameter seperti panjang pipa, diameter,
   atau tekanan awal.
3. **Jalankan Simulasi**: Klik tombol "Run Simulation" untuk memulai
   perhitungan.
4. **Lihat Hasil**: Analisis hasil simulasi melalui grafik, tabel, atau peta
   yang tersedia.
5. **Ekspor Data**: Unduh hasil simulasi untuk keperluan laporan atau analisis
   lebih lanjut.

## Struktur Proyek

```
Water-Network-Simulation-Web-App/
├── public/              # File statis
├── src/                 # Kode sumber
├── README.md            # File ini
└── package.json         # Konfigurasi Node.js
```

## Kontribusi

Proyek ini adalah tugas akhir, tetapi kontribusi tetap diterima! Jika ingin
berkontribusi:

1. Fork repositori ini.
2. Buat branch baru (`git checkout -b feature-...`).
3. Commit perubahan Anda (`git commit -m "feat:..."`).
4. Push ke branch Anda (`git push origin feature-...`).
5. Buat Pull Request.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## Kontak

Untuk pertanyaan atau dukungan, hubungi:

- Pemilik Repositori: [not-xygen](https://github.com/not-xygen)
- Email: [dhaffaagus09@gmail.com]

## Ucapan Terima Kasih

Terima kasih kepada dosen pembimbing, teman-teman, dan komunitas open-source
yang telah mendukung pengembangan proyek ini!
