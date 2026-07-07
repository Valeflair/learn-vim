#!/usr/bin/env bash
# One-time server bootstrap: installs Caddy, sets up the web root, and lets
# the deploying user push new builds without sudo. Run this ON the server,
# e.g. (replace <host> with your server's address, from deploy/.env):
#   scp -r deploy ubuntu@[<host>]:~/deploy
#   ssh ubuntu@[<host>] 'bash ~/deploy/setup-server.sh'
set -euo pipefail

REMOTE_DIR="/var/www/learn-vim"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Installing Caddy"
sudo apt-get update
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
	| sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
	| sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update
sudo apt-get install -y caddy

echo "==> Setting up web root at ${REMOTE_DIR}"
sudo mkdir -p "${REMOTE_DIR}"
sudo chown caddy:caddy "${REMOTE_DIR}"
sudo chmod 2775 "${REMOTE_DIR}"

echo "==> Adding $(whoami) to the caddy group (so deploys don't need sudo)"
sudo usermod -aG caddy "$(whoami)"

echo "==> Installing Caddyfile"
sudo cp "${SCRIPT_DIR}/Caddyfile" /etc/caddy/Caddyfile
sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy
sudo systemctl enable caddy

echo "==> Opening firewall (ufw), if active"
if command -v ufw >/dev/null && sudo ufw status | grep -q "Status: active"; then
	sudo ufw allow 80/tcp
	sudo ufw allow 443/tcp
fi

cat <<'EOF'

==> Done.

Note:
- group membership changes require a new SSH session
- allow inbound TCP 80/443
EOF
sudo systemctl status caddy --no-pager -l | head -20
