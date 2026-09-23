# ---- Build Stage ----
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build Vite app
COPY . .
RUN npm run build

# ---- Production Stage — serve with nginx ----
FROM nginx:alpine AS runner

# Copy built assets to nginx html directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Custom nginx config: proxy /uploads and /api to server, redirect all SPA routes to index.html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location /uploads/ {\n    proxy_pass http://lost2found-server:5000/uploads/;\n  }\n  location /api/ {\n    proxy_pass http://lost2found-server:5000/api/;\n  }\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
