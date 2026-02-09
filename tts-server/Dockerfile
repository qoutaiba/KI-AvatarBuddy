FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip \
    espeak-ng \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Virtuelle Umgebung anlegen und piper-tts + pathvalidate installieren
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
  && /opt/venv/bin/pip install --no-cache-dir piper-tts pathvalidate

# venv in PATH einhängen
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Standard-Umgebungsvariablen im Container
ENV PORT=5179 \
    PIPER_DIR=/app/piper \
    PIPER_VOICE=de_DE-kerstin-low \
    OUT_DIR=/app/tts-out

EXPOSE 5179

CMD ["node", "dist/tts-server.js"]
