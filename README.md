# Akaritma — situs web

Situs statis untuk Akaritma, boutique academic & tech accelerator untuk siswa SD, SMP, dan SMA.

Dua halaman:

- `index.html` — untuk orang tua. Program, pendekatan, kurikulum, cara mulai, FAQ.
- `kemitraan.html` — untuk sekolah dan yayasan. Proposal kemitraan dalam bentuk halaman.

Tanpa framework, tanpa build step. Cukup buka `index.html`, atau sajikan foldernya sebagai situs statis.

---

## Menjalankan secara lokal

Server statis diperlukan karena halaman memuat file JS terpisah.

```powershell
cd akaritma
python -m http.server 8000
```

Lalu buka <http://localhost:8000/>.

Membuka `index.html` langsung lewat `file://` juga bisa, tapi lebih aman memakai server agar perilaku `localStorage` dan path relatif sama seperti di produksi.

---

## Struktur

```
akaritma/
  index.html              Halaman untuk orang tua
  kemitraan.html          Halaman untuk sekolah
  404.html                Halaman galat (dipakai GitHub Pages otomatis)
  robots.txt
  sitemap.xml
  .nojekyll               Agar GitHub Pages tidak memproses lewat Jekyll
  .gitignore              Mengecualikan dokumen internal dari repo
  assets/
    css/style.css         Seluruh gaya. Token warna di blok :root
    js/main.js            Navigasi, scrollspy, reveal, pembangun tautan WhatsApp
    js/i18n.js            Kamus Bahasa Inggris
    img/logo.png          Wordmark dari _source/akaritma.png (dipotong)
    img/favicon.svg
    img/og-image.png      Kartu pratinjau tautan 1200×630
    portfolio/
      program-deck.pdf
      proposal-kemitraan.pdf
  _source/                Arsip berkas mentah. Tidak ditautkan dari halaman mana pun.
```

`_source/` berisi PDF dan PNG asli dari deck. Jangan dihapus — dipakai sebagai rujukan bila materi berubah. Karena situs memakai `.nojekyll`, GitHub Pages ikut menyajikan folder ini bila seluruh folder didorong sebagai root repo. Keluarkan `_source/` dari repo bila arsip tidak boleh publik.

`PLAN.md` menyimpan catatan internal (termasuk harga) dan sengaja masuk `.gitignore`, sehingga tidak ikut ter-push.

---

## Mengubah teks

Teks Indonesia ditulis **langsung di HTML**. Teks Inggris ada di `assets/js/i18n.js`.

Untuk mengubah satu kalimat:

1. Sunting teks Indonesia di HTML (di dalam elemen yang punya `data-i18n="kunci"`).
2. Sunting nilai `"kunci"` yang sama di `assets/js/i18n.js`.

Kalau sebuah kunci belum ada terjemahannya, saat mode EN aktif, `main.js` akan mengembalikan teks Indonesia dan menulis peringatan ke Console. Jadi halaman tidak akan pernah kosong.

Jenis atribut:

| Atribut | Dipakai untuk | Isi |
| --- | --- | --- |
| `data-i18n` | Teks biasa | Tulis `&` apa adanya |
| `data-i18n-html` | Teks berisi tag (`<strong>`, `<a>`) | Tulis `&amp;`, boleh berisi tag |
| `data-i18n-attr` | Atribut seperti `aria-label` | Format `"attr:kunci"` |

Kunci terjemahan dipakai lintas halaman. Contoh: `nav.faq` dan `nav.schools` muncul di kedua halaman, jadi cukup satu terjemahan.

Judul tab dan meta description versi Inggris dipilih lewat `<html data-page="kemitraan">`. Halaman kemitraan memakai `kp.meta.title` dan `kp.meta.description`; halaman utama memakai `meta.title` dan `meta.description`.

Pilihan bahasa disimpan di `localStorage` dengan kunci `akaritma-lang`, sehingga tetap berlaku saat berpindah halaman. `?lang=en` di URL memaksa bahasa Inggris.

---

## Nomor WhatsApp

Ada dua nomor, keduanya diatur di `assets/js/main.js` pada objek `CONFIG`:

```js
whatsapp: '6285882227053',            // calon orang tua
whatsappPartnership: '6281284810608', // sekolah & yayasan
```

Tombol memakai atribut `data-wa="jenis"`, dan `main.js` menyusun `wa.me/...?text=` sesuai konteks. Pesan yang terisi otomatis berbeda per jenis — `diagnostic`, `program`, `math-explorer`, `fast-track`, `junior-innovator`, `teen-visionary`, `deck`, `partnership`, `audience`, `general`.

Teks pesan berbahasa Indonesia ada di `WA_ID` (dalam `main.js`). Versi Inggris memakai kunci `wa.<jenis>` di `i18n.js`.

Jenjang `partnership` dan `audience` otomatis memakai nomor kemitraan.

---

## Warna & tipografi

Semua token di bagian atas `assets/css/style.css`:

```css
--brand:  #5263FB;  /* indigo, dari logo */
--accent: #FFD93B;  /* kuning CTA */
```

Mengganti dua baris itu akan mengubah seluruh situs, termasuk tombol, garis aksen, dan grafik di hero. Grafik hero di-*inline* di `index.html`, jadi warnanya perlu disunting manual di dalam SVG (`#FFD93B`, `#6FE3E1`, `#FF5C7A`).

Font: Plus Jakarta Sans untuk teks, JetBrains Mono untuk label dan penanda section. Keduanya dimuat dari Google Fonts.

---

## Yang perlu dilengkapi

- **Foto founder.** Saat ini memakai kartu monogram inisial (`H` dan `CA`) di `.founder__avatar`. Kalau foto tersedia, letakkan di `assets/img/founder-hanifa.jpg` dan ganti isi `div.founder__avatar` menjadi `<img src="..." alt="...">`. CSS sudah menangani `object-fit: cover`.
- **Logo.** Header dan footer memakai `assets/img/logo.png`, hasil potong dari `_source/akaritma.png` (latar indigo dipertahankan agar kurung kurawal tetap terlihat). `assets/img/favicon.svg` masih berupa mark gambar ulang karena wordmark tidak terbaca di ukuran favicon. Kalau ada versi vektor resmi, timpa kedua berkas tersebut.
- **Domain.** Semua URL saat ini memakai `https://akaritma.com/`. Kalau berbeda, ganti di `index.html` (canonical, `og:url`, `og:image`, `twitter:image`), `kemitraan.html` (idem), `robots.txt`, dan `sitemap.xml`.
- **Testimoni.** Belum ada. Section bukti saat ini memakai unduhan PDF sebagai gantinya. Kalau sudah ada izin publikasi dari klien, tambahkan section baru sebelum `#cara-mulai`.

---

## Deploy ke GitHub Pages

Repo ini siap dipakai apa adanya karena situs berada di root folder.

1. Buat repositori, lalu dorong isi folder `akaritma/` sebagai root repo.
2. Di GitHub: **Settings → Pages → Source: Deploy from a branch**, pilih `main` dan `/ (root)`.
3. Berkas `.nojekyll` sudah ada, sehingga folder `assets/` tidak akan diabaikan.

Kalau memakai domain kustom, tambahkan berkas `CNAME` berisi `akaritma.com` dan arahkan DNS ke GitHub Pages.

---

## Catatan teknis

- Semua tautan WhatsApp memakai `target="_blank" rel="noopener"`.
- Navigasi mobile menutup otomatis saat tautan diklik, tombol Escape ditekan, atau layar diperlebar.
- FAQ memakai `<details>`/`<summary>` sehingga tetap berfungsi tanpa JavaScript.
- Animasi muncul saat digulir menghormati `prefers-reduced-motion`. Ada jaring pengaman 2,5 detik yang menampilkan semua konten bila `IntersectionObserver` gagal.
- Sticky CTA hanya muncul di layar di bawah 900 px dan disembunyikan saat section kontak terlihat.
