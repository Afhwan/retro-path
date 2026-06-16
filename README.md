# Retro Path

> Puzzle Strategy Game — Build a path from START to END using limited blocks. Retro pixel-art style.

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20linux%20%7C%20windows-lightgrey)
[![Play Online](https://img.shields.io/badge/play-online-brightgreen)](https://retro-path.vercel.app)
[![GitHub](https://img.shields.io/badge/github-source-blue)](https://github.com/Afhwan/retro-path)

---

## 🎮 Tentang Game

**Retro Path** adalah game puzzle strategi berbasis grid. Pemain ditempatkan di titik START dan harus menyusun blok-blok jalan untuk mencapai titik END. Setiap level memiliki jumlah dan jenis blok terbatas — pemain harus cermat memilih posisi yang tepat.

### Fitur
- **15 level** dengan tingkat kesulitan progresif (5×5 → 11×11)
- **3 jenis rintangan**: Tembok, Lava (dengan animasi pulsing)
- **Sistem Lives** — 3 nyawa per level, game over kalau habis
- **Sistem ekonomi** — koin & diamond, beli hint & kostum di toko
- **6 kostum karakter** (Pixel Petualang, Ninja, Robot, Penyihir, Naga, Hantu)
- **Leaderboard** — skor pemain teratas
- **Data per pemain** — masing-masing punya progress sendiri
- **Sound 8-bit** — semua suara di-generate via Web Audio API
- **CRT scanline overlay** — efek retro monitor tabung

### Teknologi
| Stack | Detail |
|-------|--------|
| **Frontend** | HTML5 Canvas, CSS3, Vanilla JavaScript |
| **Desktop** | Electron 42 |
| **Packaging** | electron-builder (AppImage / NSIS) |
| **Storage** | localStorage (per player) |
| **Sound** | Web Audio API (procedural 8-bit) |

---

## 🚀 Cara Menjalankan

### Web (browser)
```bash
cd retro-path
python3 -m http.server 8080
# Buka http://localhost:8080
```
Atau buka langsung `index.html` di browser.

### Desktop (Linux)
```bash
npm install
npm start
```

### Build
```bash
# AppImage (Linux)
npm run dist:linux

# Installer (Windows)
npm run dist:win
```

---

## 📸 Screenshot

*(tunggu update berikutnya)*

---

## 🎯 Cara Main

1. **Masukkan nama** — data tersimpan otomatis per pemain
2. **Klik grid** — blok jalan otomatis terpasang (urutan dari inventory)
3. **Susun blok** — sambungkan START (hijau) ke END (merah)
4. **Tekan MULAI** — karakter berjalan mengikuti jalur
5. ❤️ **Salah jalur?** — kehilangan 1 nyawa, 3x gagal = game over
6. ✅ **Sampai END** — dapat koin, lanjut level berikutnya

### Blok Jalan
| Blok | Fungsi |
|------|--------|
| ─ │ | Lurus (horizontal / vertikal) |
| ┌ ┐ └ ┘ | Belok |
| ┴ ┬ ├ ┤ | T-junction |
| ┼ | Persimpangan |
| ■ | Tembok (tidak bisa dilewati) |
| 🔥 | Lava (tidak bisa dilewati, efek menyala) |

---

## 📦 Download

| Platform | Format | Link |
|----------|--------|------|
| Linux | AppImage | [Download](https://github.com/Afhwan/retro-path/releases/download/v1.0.0/Retro-Path-1.0.0.AppImage) |
| Windows | Installer (.exe) | _(belum tersedia — build di Windows)_ |

---

## 🗂️ Struktur Proyek

```
retro-path/
├── index.html          # Main UI
├── game.js             # Game engine (grid, BFS, animasi, render)
├── shop.js             # Shop system + player identity + leaderboard
├── sound.js            # 8-bit sound generator (Web Audio API)
├── main.js             # Electron entry point
├── styles.css          # All styling (pixel-art retro theme)
├── package.json        # Dependencies & build config
├── README.md           # ← ini
└── LICENSE             # MIT License
```

---

## 📜 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Kontribusi

Pull request terbuka! Untuk perubahan besar, buka issue dulu ya.
