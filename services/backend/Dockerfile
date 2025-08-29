FROM node:current-alpine

ARG CONTAINER_PORT=80
ENV WORKING_DIRECTORY=/app
ENV START_SCRIPT_PATH=${WORKING_DIRECTORY}/docker/scripts/start.sh

WORKDIR ${WORKING_DIRECTORY}
COPY . .
COPY ./docker/scripts/daily.cron.sh /etc/periodic/daily

EXPOSE ${CONTAINER_PORT}

RUN apk upgrade --available \
    && apk add --no-cache openrc busybox-openrc \
    && npm install \
    && chmod a+x /etc/periodic/daily/daily.cron.sh \
    && chmod a+x ${START_SCRIPT_PATH} \
    && rc-update add crond default \
    && echo "::once:${START_SCRIPT_PATH}" >> /etc/inittab

CMD [ "/sbin/init" ]