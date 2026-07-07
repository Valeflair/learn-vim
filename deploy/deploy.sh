#!/usr/bin/env bash
# Builds the app and ships dist/ to the server. Run this locally after
# setup-server.sh has been run once. Requires: bun, ssh, tar.
#
# Server address/user are read from deploy/.env (git-ignored, not committed —
# copy deploy/.env.example to deploy/.env and fill in your real values).
set -euo pipefail

# add bun to PATH
export PATH="$HOME/.bun/bin:$PATH"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

[ -f deploy/.env ] && source deploy/.env

DEPLOY_HOST="${DEPLOY_HOST:?set DEPLOY_HOST in deploy/.env or the environment}"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
REMOTE_DIR="${DEPLOY_DIR:-/var/www/learn-vim}"

echo "==> Building"
bun run build

echo "==> Uploading dist/ to ${DEPLOY_USER}@[${DEPLOY_HOST}]:${REMOTE_DIR}"
tar -C dist -czf - . | ssh "${DEPLOY_USER}@[${DEPLOY_HOST}]" \
	"rm -rf '${REMOTE_DIR:?}'/* && tar -C '${REMOTE_DIR}' -xzmf -"

echo "==> Deployed. Visit http://[${DEPLOY_HOST}]/"
