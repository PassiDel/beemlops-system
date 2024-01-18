# syntax = docker/dockerfile:1

ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-slim as base

ENV NODE_ENV=production

WORKDIR /src

# Build
FROM base as build

COPY --link db/package.json db/package-lock.json ./

COPY --link db/prisma/ ./prisma

RUN npm install --include=dev --ignore-scripts

RUN npm prune

ARG DATABASE_URL

CMD [ "npm", "run", "migrate" ]