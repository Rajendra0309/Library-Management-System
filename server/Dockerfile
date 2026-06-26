FROM node:20-alpine

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

# Run migrations and then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
