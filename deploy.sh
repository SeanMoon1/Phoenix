#!/bin/bash

# Phoenix Platform Docker Deployment Script
# This script handles the deployment of the Phoenix platform using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo -e "${BLUE}🚀 Starting Phoenix Platform Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Compose file: ${COMPOSE_FILE}${NC}"

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Please edit .env file with your actual configuration before continuing."
        print_warning "Press Enter to continue after editing .env file..."
        read
    else
        print_error "env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p logs/nginx
mkdir -p logs/backend
mkdir -p logs/frontend

# Generate SSL certificates for development (self-signed)
if [ "$ENVIRONMENT" = "development" ] && [ ! -f "nginx/ssl/phoenix.crt" ]; then
    print_status "Generating self-signed SSL certificates for development..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/phoenix.key \
        -out nginx/ssl/phoenix.crt \
        -subj "/C=KR/ST=Seoul/L=Seoul/O=Phoenix/OU=IT/CN=localhost"
    print_warning "Self-signed certificates generated. For production, use proper SSL certificates."
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans || true

# Remove unused images and volumes (optional)
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Cleaning up unused Docker resources..."
    docker system prune -f || true
fi

# Build and start services
print_status "Building and starting services..."
docker-compose -f $COMPOSE_FILE up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check MySQL
if docker-compose -f $COMPOSE_FILE exec -T mysql mysqladmin ping -h localhost --silent; then
    print_status "MySQL is healthy"
else
    print_error "MySQL is not healthy"
    docker-compose -f $COMPOSE_FILE logs mysql
    exit 1
fi

# Check Backend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "Backend is healthy"
else
    print_error "Backend is not healthy"
    docker-compose -f $COMPOSE_FILE logs backend
    exit 1
fi

# Check Frontend
if curl -f http://localhost:80/health > /dev/null 2>&1; then
    print_status "Frontend is healthy"
else
    print_error "Frontend is not healthy"
    docker-compose -f $COMPOSE_FILE logs frontend
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
docker-compose -f $COMPOSE_FILE exec backend npm run migration:run || print_warning "Migration failed or already up to date"

# Run database seeding
print_status "Seeding database..."
docker-compose -f $COMPOSE_FILE exec backend npm run seed || print_warning "Seeding failed or already completed"

print_status "Deployment completed successfully!"
echo -e "${GREEN}🎉 Phoenix Platform is now running!${NC}"
echo -e "${BLUE}Frontend: http://localhost:80${NC}"
echo -e "${BLUE}Backend API: http://localhost:3000${NC}"
echo -e "${BLUE}Database: localhost:3306${NC}"

# Show running containers
echo -e "${BLUE}Running containers:${NC}"
docker-compose -f $COMPOSE_FILE ps
