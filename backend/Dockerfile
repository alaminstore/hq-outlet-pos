FROM node:lts-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build

FROM node:lts-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/server.js"]
