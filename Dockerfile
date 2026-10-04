# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
# PUBLIC_* values are inlined into client bundles at build time, so anything
# the browser needs must be present here — not only at runtime.
ARG PUBLIC_STRAPI_URL
ARG PUBLIC_SITE_URL
ENV PUBLIC_STRAPI_URL=${PUBLIC_STRAPI_URL}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
RUN pnpm build

# The node adapter in standalone mode still needs production dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
RUN chown -R node:node /app
USER node
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
CMD wget -q --spider http://127.0.0.1:3000/ || exit 1
CMD ["node", "./dist/server/entry.mjs"]
