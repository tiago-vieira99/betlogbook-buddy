FROM node:18-alpine

WORKDIR /app

EXPOSE 5173

# Install dependencies (will use volume)
CMD npm install && npm run dev -- --host