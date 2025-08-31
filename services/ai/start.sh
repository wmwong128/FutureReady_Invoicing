#!/bin/sh

# Start Ollama server in background
ollama serve &

# Wait for Ollama to start (up to 30 seconds)
i=1
while [ $i -le 30 ]; do
  if curl -f http://localhost:11434/api/version; then
    break
  fi
  sleep 1
  i=$((i + 1))
done

# Check if Ollama started, exit if not
if ! curl -f http://localhost:11434/api/version; then
  echo "Ollama failed to start within 30 seconds"
  exit 1
fi

# Pull model if not present
ollama pull llama3.2:1b

# Run the Flask server
npm run pystart