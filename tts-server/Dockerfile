FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip \
    espeak-ng \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Create a venv and install piper-tts inside it (avoids PEP 668)
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
  && /opt/venv/bin/pip install --no-cache-dir piper-tts

# Make the venv the default python/pip in PATH
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

ENV PORT=5179 \
    PIPER_DIR=/app/piper \
    PIPER_VOICE=de_DE-kerstin-low

EXPOSE 5179
CMD ["node", "dist/tts-server.js"]