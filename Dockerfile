# Stage 1: Build the React app
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build-time env vars (passed via --build-arg or pipeline .env injection)
ARG REACT_APP_URL_API
ARG REACT_APP_WEB_SOCKET_URL
ENV REACT_APP_URL_API=$REACT_APP_URL_API
ENV REACT_APP_WEB_SOCKET_URL=$REACT_APP_WEB_SOCKET_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/prod.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
