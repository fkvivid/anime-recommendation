# Stage 1: Build the Angular application
FROM node:25-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy remaining source code and build for production
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
# Angular 17+ outputs to dist/<project-name>/browser
COPY --from=builder /app/dist/client/browser /usr/share/nginx/html

# Copy custom Nginx configuration to support Angular HTML5 routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
