#!/bin/bash

# Phoenix Platform Direct Deployment Script
# This script handles the deployment of the Phoenix platform using direct execution (no Docker)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
NODE_ENV=${ENVIRONMENT}

echo -e "${BLUE}🚀 Starting Phoenix Platform Direct Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_error "nginx is not installed. Please install nginx first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "Backend/.env" ]; then
    print_warning "Backend/.env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example Backend/.env
        print_warning "Please edit Backend/.env file with your actual configuration before continuing."
        print_warning "Press Enter to continue after editing Backend/.env file..."
        read
    else
        print_error "env.example file not found. Please create Backend/.env file manually."
        exit 1
    fi
fi

# Create necessary directories
print_status "Creating necessary directories..."
sudo mkdir -p /var/www/html
sudo mkdir -p /etc/nginx/ssl
sudo mkdir -p /var/log/nginx

# Generate SSL certificates for development (self-signed)
if [ "$ENVIRONMENT" = "development" ] && [ ! -f "/etc/nginx/ssl/phoenix.crt" ]; then
    print_status "Generating self-signed SSL certificates for development..."
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/phoenix.key \
        -out /etc/nginx/ssl/phoenix.crt \
        -subj "/C=KR/ST=Seoul/L=Seoul/O=Phoenix/OU=IT/CN=localhost"
    print_warning "Self-signed certificates generated. For production, use proper SSL certificates."
fi

# Install Backend dependencies
print_status "Installing Backend dependencies..."
cd Backend
npm install --production

# Build Backend
print_status "Building Backend..."
npm run build

# Install Frontend dependencies
print_status "Installing Frontend dependencies..."
cd ../Frontend
npm install

# Build Frontend
print_status "Building Frontend..."
npm run build

# Deploy Frontend to nginx directory
print_status "Deploying Frontend to nginx directory..."
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

# Update nginx configuration
print_status "Updating nginx configuration..."
sudo cp ../nginx/nginx.conf /etc/nginx/nginx.conf

# Test nginx configuration
print_status "Testing nginx configuration..."
sudo nginx -t

# Restart nginx
print_status "Restarting nginx..."
sudo systemctl restart nginx

# Start Backend with PM2
print_status "Starting Backend with PM2..."
cd ../Backend

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Stop existing PM2 processes
pm2 stop phoenix-backend || true
pm2 delete phoenix-backend || true

# Start Backend with PM2
pm2 start dist/main.js --name phoenix-backend --env production
pm2 save
pm2 startup

print_status "Deployment completed successfully!"
echo -e "${GREEN}🎉 Phoenix Platform is now running!${NC}"
echo -e "${BLUE}Frontend: https://www.phoenix-4.com${NC}"
echo -e "${BLUE}Backend API: https://api.phoenix-4.com${NC}"

# Show PM2 processes
echo -e "${BLUE}Running PM2 processes:${NC}"
pm2 list

# Show nginx status
echo -e "${BLUE}Nginx status:${NC}"
sudo systemctl status nginx --no-pager
