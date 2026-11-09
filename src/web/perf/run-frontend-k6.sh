#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detecta automaticamente o executável do navegador (Brave, Chromium, Edge ou Chrome)
if [ -z "$K6_BROWSER_EXECUTABLE_PATH" ]; then
  for candidato in \
    "$(command -v brave-browser 2>/dev/null)" \
    "$(command -v brave-browser-stable 2>/dev/null)" \
    "$(command -v brave 2>/dev/null)" \
    "/usr/bin/brave-browser" \
    "/opt/brave.com/brave/brave" \
    "/var/lib/flatpak/exports/bin/com.brave.Browser" \
    "$HOME/.local/share/flatpak/exports/bin/com.brave.Browser" \
    "/snap/bin/brave" \
    "$(command -v chromium 2>/dev/null)" \
    "$(command -v chromium-browser 2>/dev/null)" \
    "$(command -v microsoft-edge 2>/dev/null)" \
    "$(command -v google-chrome 2>/dev/null)"
  do
    if [ -n "$candidato" ] && [ -x "$candidato" ]; then
      export K6_BROWSER_EXECUTABLE_PATH="$candidato"
      echo "Navegador detectado: $K6_BROWSER_EXECUTABLE_PATH"
      break
    fi
  done
fi

if [ -z "$K6_BROWSER_EXECUTABLE_PATH" ]; then
  echo "Aviso: Nenhum binário Chromium/Brave encontrado localmente. Executando apenas o teste HTTP da SPA (SKIP_BROWSER=true)..."
  k6 run -e SKIP_BROWSER=true "$SCRIPT_DIR/frontend.k6.js" "$@"
else
  k6 run "$SCRIPT_DIR/frontend.k6.js" "$@"
fi

