# Database configuration
$DB_NAME = "pipelineforge"
$DB_USER = "pipelineforge_user"
$DB_PASSWORD = "pipelineforge_password"

# Create database and user
Write-Host "Creating database and user..."
$env:PGPASSWORD = "your_postgres_password"  # Replace with your actual postgres password

# Create user
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Create database
psql -U postgres -c "CREATE DATABASE $DB_NAME;"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Connect and create extension
psql -U postgres -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";"

# Create .env file with DATABASE_URL
$DATABASE_URL = "postgres://$DB_USER`:$DB_PASSWORD@localhost:5432/$DB_NAME"
Set-Content -Path ".env" -Value "DATABASE_URL=$DATABASE_URL"

Write-Host "✅ Local database setup complete!"
Write-Host "The DATABASE_URL has been saved to .env file" 