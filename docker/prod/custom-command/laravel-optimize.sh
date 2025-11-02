#!/bin/bash
set -euo pipefail

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to run Laravel optimization for a service
optimize_service() {
  local service=$1
  log "Optimizing Laravel caches for $service..."

  # Wait for service to be ready
  sleep 10

  # Check if container is running
  if ! docker-compose ps | grep -q "$service.*Up"; then
    log "Service $service is not running, skipping..."
    return 1
  fi

  # Clear existing caches first (ignore errors)
  docker-compose exec -T $service php artisan cache:clear 2>/dev/null || true
  docker-compose exec -T $service php artisan config:clear 2>/dev/null || true
  docker-compose exec -T $service php artisan route:clear 2>/dev/null || true
  docker-compose exec -T $service php artisan view:clear 2>/dev/null || true

  # Run optimization commands with error handling
  if docker-compose exec -T $service php artisan config:cache 2>&1; then
    log "✓ Config cache successful for $service"
  else
    log "✗ Config cache failed for $service"
  fi

  if docker-compose exec -T $service php artisan route:cache 2>&1; then
    log "✓ Route cache successful for $service"
  else
    log "✗ Route cache failed for $service"
  fi

  if docker-compose exec -T $service php artisan view:cache 2>&1; then
    log "✓ View cache successful for $service"
  else
    log "✗ View cache failed for $service (normal for API-only services)"
  fi

  # Only cache events if they exist
  if docker-compose exec -T $service php artisan event:list 2>/dev/null | grep -q .; then
    if docker-compose exec -T $service php artisan event:cache 2>&1; then
      log "✓ Event cache successful for $service"
    else
      log "✗ Event cache failed for $service"
    fi
  fi

  log "Optimization completed for $service"
}

# Function to setup storage links (only for specific services)
setup_storage_links() {
  local service=$1
  log "Setting up storage links for $service..."

  # Remove existing link if it exists
  docker-compose exec -T $service rm -f public/storage 2>/dev/null || true

  # Create storage link
  if docker-compose exec -T $service php artisan storage:link 2>&1; then
    log "✓ Storage link created for $service"
  else
    log "✗ Storage link failed for $service (may not be needed)"
  fi
}

# Services that need Laravel optimization
LARAVEL_SERVICES=("backend-api-public" "backend-api-user" "backend-api-student" "backend-api-instructor" "backend-api-forum")

# Services that need storage links (typically user-facing services)
STORAGE_SERVICES=("backend-api-user" "backend-api-instructor")

log "Starting Laravel optimization for all services..."

# Wait for all services to be fully ready
log "Waiting for all services to be ready..."
sleep 30

for service in "${LARAVEL_SERVICES[@]}"; do
  if docker-compose ps --services | grep -q "^$service$"; then
    optimize_service $service

    # Setup storage links for specific services
    if [[ " ${STORAGE_SERVICES[@]} " =~ " ${service} " ]]; then
      setup_storage_links $service
    fi

    sleep 5  # Brief pause between services
  else
    log "Service $service not found, skipping..."
  fi
done

log "All Laravel optimizations completed! ✓"