#!/bin/sh

. /etc/profile

LOG_PATH="/var/log/app.log"
APP_DIRECTORY="${WORKING_DIRECTORY:-/app}"

echo "=== $(date)" >> "${LOG_PATH}"
cd "${APP_DIRECTORY}"
npm run start >> "${LOG_PATH}"