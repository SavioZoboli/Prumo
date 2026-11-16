# syntax=docker/dockerfile:1
ARG NODE_VERSION=22

# ---------- 1) Build do Angular ----------
# O environment.ts já deve existir no contexto (gerado pelo workflow antes do build)
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- 2) Servir estáticos com nginx ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular 17+: dist/<projeto>/browser
COPY --from=build /app/dist/*/browser /usr/share/nginx/html
EXPOSE 80
