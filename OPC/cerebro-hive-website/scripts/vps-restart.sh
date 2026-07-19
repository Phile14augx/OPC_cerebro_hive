#!/usr/bin/env bash
set -e

cd /var/www/cerebro-hive
if pm2 describe cerebro-hive > /dev/null 2>&1; then
  pm2 restart cerebro-hive
else
  pm2 start server.js --name cerebro-hive --env production
  pm2 save
fi
