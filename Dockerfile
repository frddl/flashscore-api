FROM node:18-alpine AS builder
WORKDIR /
COPY . .
RUN npm install

FROM node:18-alpine AS final
RUN apk add --no-cache chromium ca-certificates
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

WORKDIR /
COPY package.json .
COPY package-lock.json .
RUN npm install
EXPOSE 3000
CMD ["node", "start.js"]