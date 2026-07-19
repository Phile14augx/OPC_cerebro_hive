#!/usr/bin/env bash
set -e

# Install Node.js 20 if not present
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 if not present
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
  pm2 startup systemd -u root --hp /root | tail -1 | bash
fi

# Install Nginx if not present
if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx
  systemctl enable nginx
fi

# Open firewall ports
if command -v ufw &>/dev/null; then
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw allow 'Nginx Full' || true
fi
iptables -I INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true

# Create app directory
mkdir -p /var/www/cerebro-hive
