#!/bin/bash
# Script untuk build dan push Docker image item-app ke Docker Hub

set -euo pipefail

# Nama image lokal dan tag
IMAGE_NAME="item-app"
IMAGE_TAG="v1"
LOCAL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

# Ganti dengan username Docker Hub milik Anda
DOCKER_USERNAME="ekoandriprasetyo"
REMOTE_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "=== 1. Build image dari Dockerfile (${LOCAL_IMAGE}) ==="
docker build -t "${LOCAL_IMAGE}" .

echo "=== 2. Tampilkan daftar image lokal yang berhubungan dengan item-app ==="
docker images | grep "${IMAGE_NAME}" || echo "Image dengan nama ${IMAGE_NAME} belum muncul di daftar."

echo "=== 3. Tag image agar sesuai format Docker Hub (${REMOTE_IMAGE}) ==="
docker tag "${LOCAL_IMAGE}" "${REMOTE_IMAGE}"

echo "=== 4. Login ke Docker Hub menggunakan environment variable PASSWORD_DOCKER_HUB ==="
# Sebelumnya jalankan di terminal:
# export PASSWORD_DOCKER_HUB=<password_Anda>
echo "${PASSWORD_DOCKER_HUB}" | docker login -u "${DOCKER_USERNAME}" --password-stdin

echo "=== 5. Push image ke Docker Hub ==="
docker push "${REMOTE_IMAGE}"

echo "Selesai: image sudah dipush ke Docker Hub sebagai ${REMOTE_IMAGE}"
