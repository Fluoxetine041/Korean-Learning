#!/bin/bash

# Start PostgreSQL and Adminer in the background
echo "Starting PostgreSQL and Adminer..."
docker-compose down
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create database tables if they don't exist
echo "Creating database schema..."
npx prisma db push --accept-data-loss

# Seed the database if needed
echo "Checking database status..."
# Force seeding if no articles table or if --seed flag is passed
if ! npx prisma db execute --stdin <<< "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles');" 2>/dev/null | grep -q "true" || [ "$1" == "--seed" ]; then
  echo "Seeding the database..."
  npm run prisma:seed
else
  echo "Database already contains tables, skipping seed"
fi

# Start Nuxt.js dev server with proper ignore patterns
echo "Starting Nuxt.js dev server..."
export CHOKIDAR_USEPOLLING=0
export CHOKIDAR_INTERVAL=1000
npm run dev -- --host 0.0.0.0 --port 64550 