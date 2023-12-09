# syntax = docker/dockerfile:1

ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000

ENV NODE_ENV=production

WORKDIR /src

# Build
FROM base as build

COPY --link package.json package-lock.json ./

COPY --link db ./db
COPY --link web ./web

RUN ls -lah

RUN npm run install-all --include=dev
RUN npm run build-all

RUN ls -lah

RUN npm prune

# Run
FROM base

RUN apt-get update
RUN apt-get -y install curl

ENV PORT=$PORT

COPY --from=build /src/web/.output /src/.output
# Optional, only needed if you rely on unbundled dependencies
# COPY --from=build /src/node_modules /src/node_modules

HEALTHCHECK CMD curl --fail http://localhost:3000/api/health || exit 1

CMD [ "node", ".output/server/index.mjs" ]