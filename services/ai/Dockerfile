FROM python:3.11-slim

ARG CONTAINER_PORT=9090

WORKDIR /app
COPY . .

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    nodejs \
    npm \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

RUN npm install
RUN npm run pyinstall

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Copy and make start.sh executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Persist Ollama models
VOLUME /root/.ollama

EXPOSE ${CONTAINER_PORT}
ENTRYPOINT ["/app/start.sh"]