FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm run build

RUN npm prune --omit=dev

RUN ls -l dist/ && [ -f dist/main.js ] || (echo "main.js not found!" && exit 1)

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY .env.staging ./

RUN ls -l dist/ && [ -f dist/main.js ] || (echo "main.js not found in final image!" && exit 1)

ENV NODE_ENV=staging

CMD ["node", "dist/main.js"]