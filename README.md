# Anime Recommendation (RAG + Vector Search)

Full‑stack anime discovery app that combines a typed Node.js API, an Angular (v21) client, and an AI-powered recommendation pipeline using OpenAI embeddings + MongoDB Atlas Vector Search.

## Live demo

**Production:** [https://anime.vividtemka.com](https://anime.vividtemka.com)

## Why this project
- **Problem**: keyword search often fails for “vibe-based” queries (mood, themes, pacing, tone).
- **Solution**: store anime metadata embeddings in MongoDB, expand the user query with an LLM, then run **vector similarity search** to return relevant titles.

## Key features
- **AI recommendations (RAG-style retrieval)**: expands a natural language prompt → embeds → MongoDB `$vectorSearch` → returns top matches.
- **JWT authentication**: access + refresh tokens, password hashing, refresh token persistence.
- **User anime list CRUD**: create/update/delete items protected by auth middleware.
- **Production deployment**: Docker images + Kubernetes manifests (Ingress routes `/api/*` to the server and `/` to the client).

## Tech stack
- **Frontend**: Angular 21, Angular Material, TailwindCSS
- **Backend**: Node.js (ESM), Express, TypeScript, Zod, Mongoose
- **AI**: OpenAI (query expansion + embeddings)
- **Database**: MongoDB (Atlas Vector Search index)
- **Infra**: Docker (multi-arch builds), Kubernetes (Deployment/Service/Ingress/Job)

## Architecture (high level)
- **Client** calls the API at `/api/*` (via Ingress rewrite).
- **Server** authenticates users, stores user data in MongoDB, and handles recommendations:
  - query expansion (LLM) → embedding (OpenAI) → `$vectorSearch` on `AnimeModel.embedding`.

## API overview
Base URL (Kubernetes ingress): `/api`

- **Auth**
  - `POST /auth/signup`
  - `POST /auth/signin`
  - `POST /auth/refresh`
  - `POST /auth/logout` (protected)
- **Recommendations**
  - `POST /recommendations` (body: `{ "query": "..." }`)
  - `GET /recommendations/random`
  - `GET /recommendations/:mal_id`
  - `GET /recommendations?limit=12&page=1`
- **User anime list (protected)**
  - `GET /anime`
  - `POST /anime`
  - `PUT /anime/:id`
  - `DELETE /anime/:id`

## Configuration
The server reads configuration from environment variables:

- `MONGODB_URI`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `PORT` (optional, defaults to `3000`)

For local dev, you can copy the template from `server/env-copy.txt` into `server/.env`.

## Run locally (dev)
Prereqs: Node.js + npm, MongoDB (local or Atlas), and an OpenAI API key.

Backend:
```bash
cd server
npm ci
npm run dev
```

Frontend:
```bash
cd client
npm ci
npm start
```

Seed anime embeddings (local):
```bash
cd server
npm run seed:local
```

## Docker (build & push multi-arch)
These scripts publish images for both **Intel (`linux/amd64`)** and **Apple Silicon (`linux/arm64`)**:

```bash
chmod +x scripts/build-server.sh scripts/build-client.sh
./scripts/build-server.sh
./scripts/build-client.sh
```

## Kubernetes (deploy)
1) Create namespace + secrets (edit `k8s/secret.yaml` values first):
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
```

2) Deploy server + client + ingress:
```bash
kubectl apply -f k8s/server-deployment.yaml -f k8s/server-service.yaml
kubectl apply -f k8s/client-deployment.yaml -f k8s/client-service.yaml
kubectl apply -f k8s/ingress.yaml
```

3) One-time seed job (runs the embedding pipeline and exits):
```bash
kubectl apply -f k8s/server-seed-job.yaml
kubectl logs -n anime job/anime-server-seed -f
```

> Note: `k8s/client-deployment.yaml` contains a placeholder image name — replace it with your published client image.

---

## Footer

Made with Angular, Node.js, MongoDB Atlas Vector Search, and OpenAI.

- Repository: [fkvivid/anime-recommendation](https://github.com/fkvivid/anime-recommendation)
- Live demo: [anime.vividtemka.com](https://anime.vividtemka.com)
