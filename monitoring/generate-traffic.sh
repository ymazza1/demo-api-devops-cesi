#!/usr/bin/env bash
# Génère du trafic sur demo-api pour faire vivre les courbes de Grafana.
# Tape un mélange de routes : normales, lentes, et en erreur (404 / 500),
# afin de rendre visibles le débit, la latence et le taux d'erreur.
#
# Usage :
#   ./generate-traffic.sh            # tourne en continu (Ctrl+C pour arrêter)
#   ./generate-traffic.sh 200        # effectue 200 tours puis s'arrête

BASE_URL="${BASE_URL:-http://localhost:3000}"
MAX_ITER="${1:-0}" # 0 = infini

echo "Génération de trafic vers ${BASE_URL} (Ctrl+C pour arrêter)"

i=0
while true; do
  # Routes nominales (majoritaires).
  curl -s -o /dev/null "${BASE_URL}/"
  curl -s -o /dev/null "${BASE_URL}/products"
  curl -s -o /dev/null "${BASE_URL}/products/1"
  curl -s -o /dev/null "${BASE_URL}/products/2"

  # Une requête lente de temps en temps (pic de latence).
  if (( i % 3 == 0 )); then
    curl -s -o /dev/null "${BASE_URL}/slow"
  fi

  # Erreur client 404 (id inconnu).
  if (( i % 4 == 0 )); then
    curl -s -o /dev/null "${BASE_URL}/products/9999"
  fi

  # Erreur serveur 500.
  if (( i % 6 == 0 )); then
    curl -s -o /dev/null "${BASE_URL}/error"
  fi

  i=$(( i + 1 ))
  if (( MAX_ITER > 0 && i >= MAX_ITER )); then
    echo "Terminé après ${i} tours."
    break
  fi
  sleep 0.5
done
