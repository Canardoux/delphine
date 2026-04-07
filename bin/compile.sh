#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== clean ==="
rm -rf out

echo "=== build: vscode extension ==="
npx tsc -p src/extension/tsconfig.extension.json

echo "=== build: webview boots ==="
npx tsc --project src/tsconfig.web.json

echo "=== build: webview editor ==="
esbuild src/webview/bootEditor.ts \
  --bundle \
  --format=esm \
  --outfile=media/webview/bootEditor.bundle.js

echo "=== build: example test (vite) ==="
pushd examples/test >/dev/null

# Installe si nécessaire (utile si vous nettoyez node_modules parfois)
if [ ! -d node_modules ]; then
  npm install
fi

npm run build
#cp -f dist/zazaVue.compiled.js ../../media/zazaVue.compiled.js

#
# Récupérer l'entry JS depuis dist/manifest.json

node - <<'NODE'
const fs = require('fs');
const path = require('path');
NODE


popd >/dev/null

echo "=== done ==="
