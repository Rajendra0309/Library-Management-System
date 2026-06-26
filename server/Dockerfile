FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

# Run migrations and then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
