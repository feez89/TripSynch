# TripSync Backend - Deployment Guide

Instructions for deploying TripSync backend to production.

## Prerequisites

- Node.js 18+ runtime
- PostgreSQL 14+ database
- Redis instance (optional but recommended)
- External services configured (OpenAI, Duffel, Expedia, etc.)

## Environment Setup

### 1. Create Production Environment File

```bash
# On your production server
nano /opt/tripsync/backend/.env
```

Populate with production values:

```env
# Database
DATABASE_URL="postgresql://user:password@prod-db.example.com:5432/tripsync_prod"

# Redis
REDIS_URL="redis://user:password@prod-redis.example.com:6379"

# JWT Secrets (MUST be strong random strings in production!)
JWT_SECRET="<generate-strong-random-32-char-string>"
JWT_REFRESH_SECRET="<generate-strong-random-32-char-string>"

# Tokens
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3001
NODE_ENV="production"

# AI Provider
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."

# Flight Provider
FLIGHT_PROVIDER="duffel"
DUFFEL_ACCESS_TOKEN="..."

# Stay Provider
STAY_PROVIDER="expedia"
EXPEDIA_API_KEY="..."
EXPEDIA_API_SECRET="..."

# CORS
CORS_ORIGIN="https://tripsync.example.com"
```

### 2. Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres -h prod-db.example.com

# Create database
CREATE DATABASE tripsync_prod;

# Create user
CREATE USER tripsync_user WITH PASSWORD 'strong_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tripsync_prod TO tripsync_user;
```

### 2. Enable SSL for PostgreSQL Connection

Update `DATABASE_URL`:

```
postgresql://user:password@prod-db.example.com:5432/tripsync_prod?sslmode=require
```

### 3. Run Migrations

```bash
npm run db:migrate -- --skip-generate
```

### 4. Run Seed (Optional)

```bash
npm run db:seed
```

## Redis Setup

### Option 1: Self-Hosted Redis

```bash
# Install Redis
sudo apt-get install redis-server

# Secure Redis
sudo redis-cli
> CONFIG SET requirepass "strong_redis_password"
> CONFIG REWRITE
> exit
```

Update `.env`:
```
REDIS_URL="redis://:strong_redis_password@localhost:6379"
```

### Option 2: Managed Redis Service

Use managed Redis from:
- AWS ElastiCache
- Google Cloud Memorystore
- Azure Cache for Redis
- DigitalOcean Managed Database

Update `.env` with provided connection URL.

## Build & Deployment

### 1. Build TypeScript

```bash
npm run build
```

Creates optimized JavaScript in `dist/` directory.

### 2. Install Production Dependencies

```bash
npm ci --only=production
```

This installs only required dependencies (excludes dev packages).

### 3. Start Production Server

```bash
# Using Node directly
npm start

# Or using PM2 (recommended)
npm install -g pm2
pm2 start dist/server.js --name "tripsync-api" --instances 4
pm2 save
pm2 startup
```

### PM2 Ecosystem Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'tripsync-api',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'dist']
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build app
COPY . .
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start app
CMD ["npm", "start"]
```

### 2. Build & Push Image

```bash
# Build image
docker build -t tripsync-api:1.0.0 .

# Tag for registry
docker tag tripsync-api:1.0.0 registry.example.com/tripsync-api:1.0.0

# Push to registry
docker push registry.example.com/tripsync-api:1.0.0
```

### 3. Run Container

```bash
docker run -d \
  --name tripsync-api \
  --restart always \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/tripsync_prod" \
  -e REDIS_URL="redis://redis:6379" \
  -e JWT_SECRET="..." \
  -e NODE_ENV="production" \
  registry.example.com/tripsync-api:1.0.0
```

## Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: tripsync_user
      POSTGRES_PASSWORD: strong_password
      POSTGRES_DB: tripsync_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tripsync_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass strong_redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: "postgresql://tripsync_user:strong_password@postgres:5432/tripsync_prod"
      REDIS_URL: "redis://:strong_redis_password@redis:6379"
      JWT_SECRET: "your-secret-key-here"
      CORS_ORIGIN: "https://tripsync.example.com"
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

Start:
```bash
docker-compose up -d
```

## Kubernetes Deployment

### 1. Create Deployment Manifest

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tripsync-api
  labels:
    app: tripsync-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tripsync-api
  template:
    metadata:
      labels:
        app: tripsync-api
    spec:
      containers:
      - name: api
        image: registry.example.com/tripsync-api:1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: tripsync-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: tripsync-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: tripsync-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 2. Create Service

Create `k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: tripsync-api-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3001
  selector:
    app: tripsync-api
```

### 3. Create Secrets

```bash
kubectl create secret generic tripsync-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=redis-url='redis://...' \
  --from-literal=jwt-secret='your-secret-key'
```

### 4. Deploy

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

## Reverse Proxy Setup (Nginx)

Create `/etc/nginx/sites-available/tripsync-api`:

```nginx
upstream tripsync_backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}

server {
    listen 443 ssl http2;
    server_name api.tripsync.example.com;

    ssl_certificate /etc/letsencrypt/live/api.tripsync.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tripsync.example.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types application/json text/plain application/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://tripsync_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# HTTP redirect
server {
    listen 80;
    server_name api.tripsync.example.com;
    return 301 https://$server_name$request_uri;
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/tripsync-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Monitoring & Logging

### 1. Application Logs

```bash
# PM2 logs
pm2 logs tripsync-api

# Docker logs
docker logs tripsync-api

# Kubernetes logs
kubectl logs deployment/tripsync-api -f
```

### 2. Health Check

```bash
curl https://api.tripsync.example.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-04-06T10:30:45.123Z"
}
```

### 3. Monitoring Tools

Integrate with:
- **Sentry**: Error tracking
- **DataDog**: Infrastructure monitoring
- **New Relic**: Performance monitoring
- **Prometheus**: Metrics collection
- **ELK Stack**: Centralized logging

## Backup Strategy

### 1. Database Backups

```bash
# Daily backup
0 2 * * * pg_dump -h prod-db.example.com -U tripsync_user tripsync_prod > /backups/tripsync-$(date +\%Y\%m\%d).sql

# Store in S3
aws s3 cp /backups/tripsync-$(date +%Y%m%d).sql s3://tripsync-backups/
```

### 2. Automated Backups

Use managed database services:
- AWS RDS automated backups
- Google Cloud SQL backups
- Azure Database for PostgreSQL backups

## Security Checklist

- [ ] Change all default secrets
- [ ] Enable HTTPS/TLS everywhere
- [ ] Configure CORS properly
- [ ] Enable database SSL
- [ ] Setup rate limiting
- [ ] Configure firewall rules
- [ ] Enable database encryption
- [ ] Setup intrusion detection
- [ ] Configure HTTPS redirect
- [ ] Setup security headers (HSTS, CSP, etc.)
- [ ] Enable database audit logging
- [ ] Setup automated backups
- [ ] Configure log retention
- [ ] Setup API key rotation
- [ ] Test disaster recovery

## Performance Optimization

### 1. Database Optimization

```sql
-- Index frequently queried columns
CREATE INDEX idx_trip_members_user ON trip_members(user_id);
CREATE INDEX idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_votes_user_target ON votes(user_id, target_type, target_id);
```

### 2. Redis Configuration

```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 3. Node.js Optimization

```bash
# Run with clustering
NODE_CLUSTER_WORKERS=4 npm start
```

## Scaling

### Horizontal Scaling

1. Run multiple API instances behind load balancer
2. Use managed Redis (not single instance)
3. Use managed PostgreSQL (not single instance)
4. Distribute across multiple servers/regions

### Vertical Scaling

Increase server resources:
- Memory: More concurrent connections
- CPU: More request processing
- Storage: More data capacity

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous version
git checkout previous-tag
npm run build
pm2 restart tripsync-api

# Or with Docker
docker pull registry.example.com/tripsync-api:previous-tag
docker stop tripsync-api
docker run -d --name tripsync-api registry.example.com/tripsync-api:previous-tag
```

## Testing Production Deployment

```bash
# Health check
curl https://api.tripsync.example.com/health

# Auth test
curl -X POST https://api.tripsync.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Load test
ab -n 1000 -c 10 https://api.tripsync.example.com/health
```

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Check Redis connectivity
5. Review firewall rules
6. Verify SSL certificates
