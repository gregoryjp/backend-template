# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit

COPY tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src

# Generate the Prisma client (needs the schema) and compile to dist/.
RUN npx prisma generate && npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-fund --no-audit && npm cache clean --force

COPY --from=build /app/dist ./dist
# The generated client lives outside @prisma/client and must be copied explicitly.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Run as a non-root user (created by the base image).
USER node
EXPOSE 3000

# Migrations are applied by the deploy pipeline (CI / `npm run db:deploy`), not
# by this container — see docs/RUNBOOK.md.
CMD ["node", "dist/server.js"]
