FROM node:current-alpine

ARG CONTAINER_PORT=80

WORKDIR /app
COPY ./dist ./dist
COPY ./package.json ./package.json
RUN npm install

EXPOSE ${CONTAINER_PORT}

ENTRYPOINT [ "npm", "start" ]