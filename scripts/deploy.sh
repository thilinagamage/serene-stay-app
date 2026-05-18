#!/bin/bash
set -euo pipefail

ENVIRONMENT="${ENVIRONMENT:-production}"
APP_DIR="${APP_DIR:-/home/ubuntu/serene-stay-app}"
SSM_PATH="${SSM_PATH:-/hotel-booking/$ENVIRONMENT}"

echo "Deploying Next.js app [$ENVIRONMENT]..."

# Load environment from SSM Parameter Store
echo "Fetching secrets from SSM ($SSM_PATH)..."
aws ssm get-parameters-by-path \
  --path "$SSM_PATH" \
  --with-decryption \
  --query "Parameters[*].{Name:Name,Value:Value}" \
  --output text | while IFS=$'\t' read -r name value; do
    key=$(echo "$name" | awk -F/ '{print $NF}')
    echo "$key=$value" >> "$APP_DIR/.env"
done

cd "$APP_DIR"

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --omit=dev

# Generate Prisma client & apply migrations
echo "Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy

# Build application
echo "Building application..."
npm run build

# Restart application
echo "Restarting application..."
pm2 reload ecosystem.config.js 2>/dev/null || pm2 start npm --name nextjs-app -- start

echo "Deployment complete!"

