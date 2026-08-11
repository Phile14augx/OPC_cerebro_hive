#!/usr/bin/env bash
set -e

APP_DIR=/var/www/cerebro-hive/apps/studio
cd "$APP_DIR"

# Always fully recreate the pm2 process pointing at this exact path.
# `pm2 restart` reuses whatever script path the process was originally
# registered with, which silently keeps serving stale code if that
# path ever drifted (e.g. an older deploy that used a different
# directory) instead of picking up what was just rsynced here.
pm2 delete cerebro-hive > /dev/null 2>&1 || true
PORT=3000 HOSTNAME=0.0.0.0 pm2 start server.js --name cerebro-hive --cwd "$APP_DIR" --env production
pm2 save
