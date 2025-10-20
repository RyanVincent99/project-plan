# === Stage 1: Install Dependencies ===
FROM node:18-slim AS deps
WORKDIR /app
# ADD THIS LINE TO INSTALL OPENSSL
RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json* ./
COPY prisma/schema.prisma ./prisma/
RUN npm ci

# === Stage 2: Build Application ===
FROM node:18-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- ADD THESE TWO LINES ---
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# ---

RUN npx prisma generate
RUN npm run build

# === Stage 3: Production Image ===
FROM node:18-slim AS runner
WORKDIR /app
# ADD THIS LINE TO INSTALL OPENSSL
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]