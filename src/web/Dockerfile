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

# ---------- 2) Servir estáticos com nginx (HTTP + HTTPS) ----------
FROM nginx:1.27-alpine

# Instalar openssl e gerar certificado SSL auto-assinado para HTTPS
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt \
    -subj "/C=BR/ST=SC/L=Blumenau/O=Prumo/CN=prumo-ind.duckdns.org"

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular 17+: dist/<projeto>/browser
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
