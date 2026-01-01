// Run a SQL migration file using Supabase client
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('Usage: node scripts/run-migration.js <migration-file>');
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFile, 'utf8');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log(`Running migration: ${migrationFile}`);

  // Note: This uses the anon key, so it won't work for DDL changes
  // For DDL changes, you need to use the service role key or run via supabase CLI
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('Migration completed successfully!');
  console.log(data);
}

runMigration();
