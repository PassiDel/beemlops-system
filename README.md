# BeeMLOps System

> Monorepo
>
> WS2023/24

## Setup

Please use Jetbrains WebStorm.

### NVM

To use the same node version, the [Node Version Manager](https://github.com/nvm-sh/nvm). Please install it and install
the specified node version using `nvm install` in the root directory.

Webstorm can use the correct version, if `.nvmrc` is selected:

![Webstorm NVM](assets/nvm-webstorm.png)

### Prettier

This Repo uses Prettier for consistent code styling. WebStorm can automatically format your code on save. In the
Settingsdialog (File > Settings...) search for `prettier` and enable `Automatic Prettier configuration` for the these
files: `{**/*,*}.{js,ts,jsx,tsx,html,css,json,md,vue,astro}`. After that enable `Run on save`.

![Prettier WebStorm config](assets/prettier-webstorm-config.png)

## Components

- [DB](./db)
  - ORM based on [Prisma.js](https://www.prisma.io/)
  - Represents the "Meta"-DB, without the time-series data
- [Webapp](./web)
  - Nuxt Webapp (based on Vue.js)
  - SSR
  - i18n
  - Server API
  - ...
