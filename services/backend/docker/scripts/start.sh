mkdir -p /run/openrc
touch /run/openrc/softlevel
rc-service crond start
npm run start