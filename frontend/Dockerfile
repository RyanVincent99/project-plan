# ========================
# 1️⃣ Development Image
# ========================
FROM node:20-alpine AS dev

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy everything except node_modules
COPY . .

# Expose Next.js port
EXPOSE 3000

# Enable hot reload in Docker (Next.js dev mode)
CMD ["npm", "run", "dev"]

# ========================
# 2️⃣ Production Build (Optional)
# ========================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]
