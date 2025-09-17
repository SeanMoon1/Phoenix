# Multi-stage build for production optimization
FROM node:20-alpine AS builder

# Install build tools and libraries for native packages
RUN apk add --no-cache autoconf automake libtool make g++ python3 zlib-dev libpng-dev nasm file

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install Node.js and build tools for native packages
RUN apk add --no-cache nodejs autoconf automake libtool make g++ python3 zlib-dev libpng-dev nasm file

# Create app user for security (nginx group already exists in nginx:alpine)
RUN adduser -S phoenix -u 1001 -G nginx

# Copy built application from builder stage
COPY --from=builder --chown=phoenix:nginx /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R phoenix:nginx /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html

# Switch to non-root user
USER phoenix

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
