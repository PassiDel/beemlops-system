# syntax = docker/dockerfile:1

ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-slim as base

ENV NODE_ENV=production

WORKDIR /src

# Build
FROM base as build

COPY --link package.json package-lock.json ./

COPY --link queue ./queue

RUN npm run install-all --include=dev
RUN npm run build-all

RUN npm prune

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /src/queue/dist /src/
COPY --from=build /src/queue/package.json /src/
COPY --from=build /src/node_modules /src/node_modules

CMD [ "node", "consumer.js" ]