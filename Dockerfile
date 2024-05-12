# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY ./app/package.json ./app/package-lock.json ./
RUN npm install
COPY ./app .

# Final stage
FROM node:18-alpine AS final

# Install Chromium and certificates for Puppeteer
RUN apk add --no-cache chromium ca-certificates
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

WORKDIR /app

# Copy files from builder
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "run", "start"]
