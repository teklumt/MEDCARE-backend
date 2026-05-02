FROM node:22-alpine AS base
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.18.0 --activate
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 5000
CMD ["pnpm", "start"]
