FROM node:current-alpine

ARG CONTAINER_PORT=80
ENV WORKING_DIRECTORY=/app
ENV START_SCRIPT_PATH=${WORKING_DIRECTORY}/docker/scripts/start.sh

RUN apk upgrade --available
RUN apk add --no-cache openrc busybox-openrc tini

WORKDIR ${WORKING_DIRECTORY}
COPY . .
RUN npm install

COPY ./docker/scripts/daily.cron.sh /etc/periodic/daily
RUN chmod a+x /etc/periodic/daily/daily.cron.sh

EXPOSE ${CONTAINER_PORT}

RUN chmod a+x ${START_SCRIPT_PATH}
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD ${START_SCRIPT_PATH}