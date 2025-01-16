# Day Chats API

Day Chats API adalah aplikasi backend yang dirancang untuk manajemen komunikasi chat, dengan berbagai fitur untuk pengguna dan admin. Aplikasi ini mendukung berbagai peran, termasuk pengguna untuk berinteraksi dan admin untuk mengelola data.

## Fitur

- **Pengguna**: Dapat melakukan verifikasi nomor telepon, mengirim pesan, dan memperbarui status online.
- **Admin**: Dapat mengelola komunitas, status, dan pengguna.

## Teknologi yang Digunakan

- **Node.js**: Untuk pengembangan backend.
- **Express**: Framework untuk membangun API RESTful.
- **Firebase**: Untuk autentikasi dan penyimpanan data.

## Dependensi yang Digunakan

- **@ngrok/ngrok**: Untuk membuat tunnel ke server lokal.
- **compression**: Middleware untuk mengompresi respons HTTP.
- **cors**: Middleware untuk mengatur Cross-Origin Resource Sharing.
- **dotenv**: Memungkinkan penggunaan variabel lingkungan dari file `.env`.
- **express**: Framework web untuk Node.js.
- **firebase-admin**: SDK untuk mengakses Firebase dari server.
- **helmet**: Middleware untuk mengamankan aplikasi Express.
- **libphonenumber-js**: Library untuk memvalidasi dan memformat nomor telepon.
- **morgan**: Middleware untuk logging permintaan HTTP.
- **multer**: Middleware untuk menangani multipart/form-data.
- **uuid**: Library untuk menghasilkan ID unik.

## Instalasi

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/username/day-chats-api.git
   ```
2. **Navigasi ke direktori proyek**:
   ```bash
   cd day-chats-api
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Menjalankan Aplikasi

1. **Jalankan aplikasi**:
   ```bash
   npm start
   ```

## Struktur Proyek
day-chats-api/
├── src/
│   ├── config/             # Konfigurasi aplikasi (e.g., koneksi database, Firebase)
│   ├── controllers/        # Logika bisnis untuk setiap endpoint
│   ├── models/             # Definisi model untuk data
│   ├── routes/             # Definisi rute API
│   ├── services/           # Layanan untuk mengelola interaksi data
├── server.js                 # Pengujian unit dan integrasi
├── .env                    # File konfigurasi variabel lingkungan
├── .gitignore              # File yang diabaikan oleh Git
├── package.json            # File konfigurasi npm
├── package-lock.json       # File penguncian dependensi npm
└── README.md               # Dokumentasi proyek