#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== clean ==="
rm -rf out

echo "=== build: vscode extension ==="
npx tsc -p src/extension/tsconfig.extension.json

echo "=== build: webview boots ==="
npx tsc --project src/tsconfig.web.json




echo "=== done ==="
