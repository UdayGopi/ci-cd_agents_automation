#!/bin/bash

# Database configuration
DB_NAME="pipelineforge"
DB_USER="pipelineforge_user"
DB_PASSWORD="pipelineforge_password"

# Create database and user
echo "Creating database and user..."
psql -U postgres <<EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

# Export DATABASE_URL
export DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo "DATABASE_URL=$DATABASE_URL" > .env

echo "✅ Local database setup complete!"
echo "The DATABASE_URL has been saved to .env file" 