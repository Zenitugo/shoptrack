# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# The built files in /app/dist will be uploaded to S3
# or served via Nginx on EC2