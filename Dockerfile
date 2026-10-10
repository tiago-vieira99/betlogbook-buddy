FROM node:20-alpine

WORKDIR /app

EXPOSE 5173

# Production mode: build once, then serve the built site (no auto-reload on reconnect).
# Code is mounted as a volume; restart the container to pick up code changes.
CMD npm install && npm run build && npm run preview -- --host --port 5173
