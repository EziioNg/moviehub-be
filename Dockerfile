# ========= Stage 1: Build =========
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack để dùng đúng yarn version
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Build babel -> build/src
RUN yarn build

# ========= Stage 2: Production =========
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV BUILD_MODE=production
ENV PORT=5000

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy build output từ stage 1
COPY --from=builder /app/build ./build

COPY --from=builder /app/emails ./emails

EXPOSE 5000

CMD ["node", "build/src/server.js"]