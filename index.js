// Memuat variabel lingkungan dari file .env ke dalam process.env
// Biasanya berisi konfigurasi seperti PORT dan AMQP_URL
require('dotenv').config()

// Mengimpor Express untuk membuat web server HTTP sederhana
const express = require("express");
// Membuat instance aplikasi Express
const app = express();

// Mengimpor body-parser (meskipun di file ini belum dipakai,
// tetap bisa dibiarkan untuk konsistensi dengan order-service)
const bp = require("body-parser");

// Mengimpor library amqplib (versi Promise) untuk koneksi ke RabbitMQ
const amqp = require("amqplib");
// Membaca URL server RabbitMQ dari environment variable AMQP_URL
// Contoh: amqp://guest:guest@rabbitmq:5672
const amqpServer = process.env.AMQP_URL;

// Deklarasi variabel global channel dan connection untuk menyimpan
// objek koneksi dan channel RabbitMQ supaya bisa diakses dari fungsi lain
var channel, connection;

// Memanggil fungsi untuk membuka koneksi ke RabbitMQ dan mulai listen pesan
connectToQueue();

/**
 * Fungsi async untuk:
 * 1. Konek ke RabbitMQ (sesuai AMQP_URL),
 * 2. Membuat channel,
 * 3. Memastikan queue "order" ada,
 * 4. Mengonsumsi pesan dari queue "order".
 */
async function connectToQueue() {
    try {
        // Membuka koneksi ke server RabbitMQ menggunakan URL yang sudah didefinisikan
        connection = await amqp.connect(amqpServer);

        // Membuat channel komunikasi di atas koneksi RabbitMQ
        channel = await connection.createChannel();

        // Memastikan queue bernama "order" tersedia di RabbitMQ.
        // Jika belum ada, queue baru akan dibuat secara otomatis.
        await channel.assertQueue("order");

        // Mendaftarkan consumer untuk queue "order".
        // Setiap kali ada pesan baru di queue, callback ini akan dipanggil.
        channel.consume("order", data => {
            // Mengambil isi pesan (Buffer) dan mengubahnya menjadi string
            const message = Buffer.from(data.content).toString();

            // Menampilkan isi order yang diterima dari queue
            console.log(`Order received: ${message}`);

            // Menampilkan pesan tambahan sesuai contoh di materi Dicoding
            console.log("** Will be shipped soon! **\n")

            // Memberi tahu RabbitMQ bahwa pesan sudah berhasil diproses
            // sehingga pesan ini bisa dihapus dari queue
            channel.ack(data);
        });
    } catch (ex) {
        // Menangkap dan menampilkan error jika terjadi masalah saat
        // koneksi, pembuatan channel, assert queue, atau consume
        console.error(ex);
    }
}

// Menjalankan server Express dan mendengarkan di port yang diambil dari environment variable PORT
// Walaupun tidak ada route HTTP yang didefinisikan, server ini tetap berguna sebagai penanda
// bahwa shipping-service sudah berjalan (misalnya untuk keperluan health check).
app.listen(process.env.PORT, () => {
    // Menampilkan pesan di console bahwa server sudah aktif di port tertentu
    console.log(`Server running at ${process.env.PORT}`);
});
