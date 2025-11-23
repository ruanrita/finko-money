#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');

  envLines.forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    // Parse KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();

      // Only set if not already set (environment takes precedence)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Check if SUPABASE_DB_URL is set
if (!process.env.SUPABASE_DB_URL) {
  console.error('Error: SUPABASE_DB_URL is not set');
  console.error('Please set it in .env.local or as an environment variable');
  process.exit(1);
}

// Run the migration
try {
  console.log('Running Supabase migrations...');
  execSync(`supabase migration up --db-url "${process.env.SUPABASE_DB_URL}"`, {
    stdio: 'inherit',
    env: process.env
  });
  console.log('Migrations completed successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
