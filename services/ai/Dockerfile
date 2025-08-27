FROM python:3.11-slim

ARG CONTAINER_PORT=9090

WORKDIR /app
COPY . .

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*
RUN npm install
RUN npm run pyinstall

EXPOSE ${CONTAINER_PORT}
ENTRYPOINT ["npm", "run", "pystart"]