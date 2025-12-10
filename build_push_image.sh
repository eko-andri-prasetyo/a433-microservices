#!/bin/bash
# Script untuk build dan push Docker image item-app ke GitHub Container Registry (GHCR)

set -euo pipefail

# Nama image lokal dan tag
IMAGE_NAME="item-app"
IMAGE_TAG="v1"
LOCAL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

# Username GitHub Anda (harus sama dengan owner repo di GitHub)
GITHUB_USERNAME="eko-andri-prasetyo"

# Nama image di GHCR: ghcr.io/<username>/<image>:tag
REMOTE_IMAGE="ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "=== 1. Build image dari Dockerfile (${LOCAL_IMAGE}) ==="
docker build -t "${LOCAL_IMAGE}" .

echo "=== 2. Tampilkan daftar image lokal yang berhubungan dengan ${IMAGE_NAME} ==="
docker images | grep "${IMAGE_NAME}" || echo "Image dengan nama ${IMAGE_NAME} belum muncul di daftar."

echo "=== 3. Tag image agar sesuai format GHCR (${REMOTE_IMAGE}) ==="
docker tag "${LOCAL_IMAGE}" "${REMOTE_IMAGE}"

echo "=== 4. Login ke GitHub Container Registry (GHCR) menggunakan environment variable GITHUB_PAT ==="
# Sebelumnya jalankan di terminal:
# export GITHUB_PAT=<token_GHCR_Anda>
echo "${GITHUB_PAT}" | docker login ghcr.io -u "${GITHUB_USERNAME}" --password-stdin

echo "=== 5. Push image ke GitHub Container Registry (GHCR) ==="
docker push "${REMOTE_IMAGE}"

echo "Selesai: image sudah dipush ke GHCR sebagai ${REMOTE_IMAGE}"
