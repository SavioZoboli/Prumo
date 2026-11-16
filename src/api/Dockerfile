# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

# ---------- 1) Build (TypeScript -> dist) ----------
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- 2) Dependências de produção ----------
FROM node:${NODE_VERSION}-bookworm-slim AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- 3) Imagem final ----------
FROM node:${NODE_VERSION}-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# TypeORM CLI roda a partir do dist (data-source e migrations compilados para JS)
COPY package*.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
