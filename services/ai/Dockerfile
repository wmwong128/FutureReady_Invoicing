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
    && rm -rf /var/lib/apt/lists/*

RUN npm install
RUN npm run pyinstall

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Pull Ollama model
RUN ollama serve & \
    sleep 10 && \
    ollama pull llama3.2:1b

EXPOSE ${CONTAINER_PORT}
ENTRYPOINT ["npm", "run", "pystart"]