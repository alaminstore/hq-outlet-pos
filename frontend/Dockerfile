FROM node:lts-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts index.html ./
COPY public ./public
COPY src ./src

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
