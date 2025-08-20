#!/bin/sh

LOG_PATH="/var/log/app.daily.log"
APP_DIRECTORY="${WORKING_DIRECTORY:-/app}"

echo "=== $(date)" >> "${LOG_PATH}"
cd "${APP_DIRECTORY}"
npm run daily >> "${LOG_PATH}"
