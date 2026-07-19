#!/usr/bin/env bash
set -e

# Copy nginx config from app directory
cp /var/www/cerebro-hive/nginx/cerebro-hive.conf /etc/nginx/sites-available/cerebro-hive
ln -sf /etc/nginx/sites-available/cerebro-hive /etc/nginx/sites-enabled/cerebro-hive
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Ensure port 443 is open
iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
command -v ufw &>/dev/null && ufw allow 443/tcp || true

# Install certbot if needed
if ! command -v certbot &>/dev/null; then
  apt-get install -y certbot python3-certbot-nginx
fi

# Provision SSL certificate
certbot --nginx \
  -d cerebropchive.org \
  -d www.cerebropchive.org \
  --non-interactive \
  --agree-tos \
  -m admin@cerebropchive.org \
  --redirect \
  || echo "certbot-skipped (may need manual run or already configured)"
