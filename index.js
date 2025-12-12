// Memuat variabel lingkungan dari file .env ke dalam process.env
// Contoh isinya: PORT dan AMQP_URL
require('dotenv').config()

// Mengimpor Express untuk membuat web server HTTP
const express = require("express");
// Membuat instance aplikasi Express
const app = express();

// Mengimpor body-parser untuk membantu membaca body request (JSON)
const bp = require("body-parser");
// Mendaftarkan middleware body-parser agar semua request dengan Content-Type: application/json
// otomatis di-parse dan hasilnya disimpan di req.body
app.use(bp.json());

// Mengimpor library amqplib (versi Promise) untuk berkomunikasi dengan RabbitMQ
const amqp = require("amqplib");
// Menyimpan URL server RabbitMQ yang diambil dari environment variable AMQP_URL
// Contoh nilai: amqp://guest:guest@rabbitmq:5672
const amqpServer = process.env.AMQP_URL;

// Deklarasi variabel global untuk menyimpan objek connection dan channel RabbitMQ
// supaya bisa digunakan di fungsi lain (createOrder, dsb)
var channel, connection;

// Memanggil fungsi untuk membuka koneksi ke RabbitMQ dan menyiapkan queue
connectToQueue();

/**
 * Fungsi async untuk membuka koneksi ke RabbitMQ dan membuat channel + queue.
 * Fungsi ini dipanggil sekali di awal ketika aplikasi dijalankan.
 */
async function connectToQueue() {
    // Membuka koneksi ke server RabbitMQ berdasarkan URL di amqpServer
    connection = await amqp.connect(amqpServer);

    // Membuat channel komunikasi di atas koneksi RabbitMQ
    channel = await connection.createChannel();

    try {
        // Menentukan nama queue yang akan digunakan untuk menyimpan pesan order
        const queue = "order";

        // Memastikan queue dengan nama "order" tersedia.
        // Jika belum ada, RabbitMQ akan membuat queue baru.
        await channel.assertQueue(queue);

        // Memberi informasi di console bahwa koneksi ke queue berhasil
        console.log("Connected to the queue!")
    } catch (ex) {
        // Menampilkan error di console jika terjadi kegagalan saat assertQueue
        console.error(ex);
    }
}

/**
 * Endpoint HTTP POST /order
 * Endpoint ini digunakan untuk menerima data order dari client dalam bentuk JSON
 * lalu meneruskannya ke RabbitMQ.
 */
app.post("/order", (req, res) => {
    // Mengambil properti "order" dari body request
    // Body request diharapkan memiliki struktur: { "order": { ... } }
    const { order } = req.body;

    // Memanggil fungsi createOrder untuk mengirim data order ke queue RabbitMQ
    createOrder(order);

    // Mengirim kembali data order ke client sebagai respons
    res.send(order);
});

/**
 * Fungsi async untuk mengirim objek order ke queue RabbitMQ.
 * @param {Object} order - Objek order yang akan dikirim ke queue.
 */
const createOrder = async order => {
    // Nama queue yang digunakan untuk menampung pesan order
    const queue = "order";

    // Mengirim pesan ke queue "order".
    // Objek order diubah menjadi string JSON, lalu dibungkus Buffer sebelum dikirim.
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(order)));

    // Menuliskan log ke console bahwa order berhasil dibuat dan dikirim ke queue
    console.log("Order succesfully created!")

    // Mendaftarkan handler sekali saja (once) untuk sinyal SIGINT (Ctrl + C di terminal).
    // Ketika proses aplikasi dihentikan dengan Ctrl + C, kita akan menutup channel dan koneksi
    // ke RabbitMQ dengan rapi sebelum keluar dari proses Node.js.
    process.once('SIGINT', async () => { 
        console.log('got sigint, closing connection');

        // Menutup channel RabbitMQ
        await channel.close();

        // Menutup koneksi ke server RabbitMQ
        await connection.close(); 

        // Mengakhiri proses Node.js dengan kode keluar 0 (berhasil)
        process.exit(0);
    });
};

// Menjalankan server Express dan mendengarkan di port yang diambil dari environment variable PORT
app.listen(process.env.PORT, () => {
    // Menampilkan pesan di console bahwa server sudah aktif dan berjalan di port tertentu
    console.log(`Server running at ${process.env.PORT}`);
});
