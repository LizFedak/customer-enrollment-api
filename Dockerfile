FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY --chown=node:node openapi.yaml README.md PARTNER_API_GUIDE.md ./
COPY --chown=node:node src ./src
COPY --chown=node:node postman ./postman

USER node

EXPOSE 3000

CMD ["npm", "start"]
