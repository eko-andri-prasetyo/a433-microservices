# Menggunakan base image Node.js versi 14
FROM node:14

# Menentukan working directory di dalam container
WORKDIR /app

# Menyalin seluruh source code ke dalam working directory container
COPY . .

# Menentukan environment agar aplikasi berjalan dalam production mode
# dan menggunakan container bernama item-db sebagai database host
ENV NODE_ENV=production \
    DB_HOST=item-db

# Menginstal dependencies untuk production dan melakukan build aplikasi
RUN npm install --production --unsafe-perm && npm run build

# Mengekspos port 8080 yang digunakan oleh aplikasi di dalam container
EXPOSE 8080

# Menjalankan server saat container diluncurkan
CMD ["npm", "start"]
