#!/bin/bash
set -euo pipefail

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  sudo systemctl enable docker
  sudo systemctl start docker
  rm get-docker.sh

  sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose

  log "Docker installed successfully"
fi

# Setup socket directory dengan permission yang benar
mkdir -p ./sockets
chmod 777 ./sockets

# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock

# Login to Docker Hub
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Clean up old resources
log "Cleaning up old resources..."

if [ -f "docker-compose.yml" ]; then
  docker-compose down --remove-orphans 2>/dev/null || true
fi

docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -af --volumes
docker volume prune -f

# Pull new images
log "Pulling latest images..."
docker-compose pull

# Start services sequentially
log "Starting services..."

# 1. Start Redis
log "Starting Redis..."
docker-compose up -d database-redis

for i in {1..15}; do
  if docker-compose exec -T database-redis redis-cli ping 2>/dev/null | grep -q PONG; then
    log "Redis is ready"
    break
  fi
  if [ $i -eq 15 ]; then
    log "Redis failed to start"
    exit 1
  fi
  sleep 2
done

# 2. Start backend services
BACKEND_SERVICES=("backend-api-public" "backend-api-user" "backend-api-student" "backend-api-instructor" "backend-api-forum")
for service in "${BACKEND_SERVICES[@]}"; do
  log "Starting $service..."
  docker-compose up -d $service

  # Wait untuk socket file dibuat
  for i in {1..30}; do
    SOCKET_NAME=$(echo $service | sed 's/-/_/g')
    if [ -S "./sockets/${SOCKET_NAME}.sock" ]; then
      log "Socket created for $service"
      break
    fi
    if [ $i -eq 30 ]; then
      log "Warning: Socket not created for $service after 30s"
    fi
    sleep 1
  done

  sleep 10
done

# 3. Start Reverb services
REVERB_SERVICES=("backend-api-user-reverb" "backend-api-forum-reverb")
for service in "${REVERB_SERVICES[@]}"; do
  log "Starting $service..."
  docker-compose up -d $service
  sleep 10
done

# 4. Start Nginx last
log "Starting Nginx..."
docker-compose up -d nginx

# Final health check
log "Performing final health check..."
sleep 30

ALL_SERVICES=(database-redis backend-api-public backend-api-user backend-api-student backend-api-instructor backend-api-forum backend-api-user-reverb backend-api-forum-reverb nginx)

for service in "${ALL_SERVICES[@]}"; do
  if docker-compose ps | grep -q "$service.*Up"; then
    log "✓ $service is running"
  else
    log "✗ $service failed to start"
  fi
done

# Check socket files
log "Checking socket files..."
ls -lah ./sockets/ || true

log "Deployment completed!"