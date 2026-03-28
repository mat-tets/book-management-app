# ---------- deps ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ---------- dev ----------
FROM node:22-slim AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ---------- prod ----------
FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN npm prune --omit=dev
EXPOSE 3001
USER node
CMD ["node", "app.js"]