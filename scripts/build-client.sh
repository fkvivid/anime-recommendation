#!/usr/bin/env bash
set -euo pipefail

# Build+push multi-arch image for Intel k8s + Apple Silicon.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

docker buildx create --use --name multiarch >/dev/null 2>&1 || docker buildx use multiarch >/dev/null

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t fkvivid/anime-recommendation-client:latest \
  -f "${ROOT_DIR}/client/Dockerfile" \
  --push \
  "${ROOT_DIR}/client"

