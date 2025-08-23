FROM alpine:latest

ARG CONTAINER_PORT=15000

WORKDIR /app
COPY . .

RUN apk update
RUN apk add --no-cache python3 py3-pip nodejs npm
RUN npm install
RUN npm run pyinstall

EXPOSE ${CONTAINER_PORT}
ENTRYPOINT npm run pystart

