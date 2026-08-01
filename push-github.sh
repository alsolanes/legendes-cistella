#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Llegeix el token del credential store i el guarda en un fitxer temporal
echo | git credential fill > /tmp/gh-cred.txt 2>/dev/null <<'EOF'
protocol=https
host=github.com

EOF
TOKEN=$(grep '^password=' /tmp/gh-cred.txt | cut -d= -f2)
rm -f /tmp/gh-cred.txt

if [ -z "$TOKEN" ]; then
  echo "ERROR: no token" >&2
  exit 1
fi

# Crea el repo
curl -s -X POST -H "Authorization: token ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"legendes-cistella","description":"Joc de gestio de club de basquet catala - Llegendes de la Cistella","private":false}' \
  -o /tmp/gh-repo-resp.json

if grep -q '"full_name"' /tmp/gh-repo-resp.json; then
  echo "Repo OK: $(grep -o '"full_name": "[^"]*"' /tmp/gh-repo-resp.json | head -1)"
else
  echo "Resposta: $(head -c 300 /tmp/gh-repo-resp.json)"
fi
rm -f /tmp/gh-repo-resp.json

# Puja
git remote remove origin 2>/dev/null || true
git remote add origin "https://alsolanes:${TOKEN}@github.com/alsolanes/legendes-cistella.git"
git branch -M main
git push -u origin main 2>&1 | tail -3
