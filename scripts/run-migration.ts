#!/usr/bin/env tsx
/**
 * Migration Runner for be-part-of.net
 *
 * Usage: npm run migrate [migration-file]
 * Example: npm run migrate 001_fresh_start_schema.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Needs service role key for admin operations

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  console.error('');
  console.error('Add SUPABASE_SERVICE_KEY to your .env.local:');
  console.error('SUPABASE_SERVICE_KEY=your-service-role-key');
  console.error('');
  console.error('Find it in: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

// TypeScript now knows these are defined after the exit check
const supabaseUrl: string = SUPABASE_URL;
const supabaseServiceKey: string = SUPABASE_SERVICE_KEY;

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Error: No migration file specified');
  console.error('Usage: npm run migrate [migration-file]');
  console.error('Example: npm run migrate 001_fresh_start_schema.sql');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 be-part-of.net Migration Runner');
  console.log('==================================');
  console.log('');

  // Read migration file
  const migrationPath = join(process.cwd(), 'migrations', migrationFile);
  console.log(`📄 Reading migration: ${migrationFile}`);

  let sql: string;
  try {
    sql = readFileSync(migrationPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading file: ${migrationPath}`);
    console.error(error);
    process.exit(1);
  }

  console.log(`✅ Loaded ${sql.split('\n').length} lines of SQL`);
  console.log('');

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Confirm before destructive operations
  if (sql.includes('DROP TABLE')) {
    console.log('⚠️  WARNING: This migration contains DROP TABLE statements');
    console.log('⚠️  This will DELETE existing data');
    console.log('');
    console.log('Tables to be dropped:');
    const dropMatches = sql.match(/DROP TABLE IF EXISTS (\w+)/g);
    dropMatches?.forEach(line => console.log(`   - ${line.replace('DROP TABLE IF EXISTS ', '')}`));
    console.log('');
    console.log('To proceed, set CONFIRM_MIGRATION=yes');

    if (process.env.CONFIRM_MIGRATION !== 'yes') {
      console.log('');
      console.log('❌ Migration aborted (safety check)');
      console.log('Run with: CONFIRM_MIGRATION=yes npm run migrate ' + migrationFile);
      process.exit(1);
    }
  }

  // Execute migration
  console.log('🔨 Executing migration...');
  console.log('');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }

  console.log('✅ Migration completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Verify schema in Supabase Dashboard > Table Editor');
  console.log('2. Run: npm run migrate:seed (to populate demo data)');
  console.log('3. Test the app: npm run dev');
}

runMigration().catch(error => {
  console.error('❌ Unexpected error:');
  console.error(error);
  process.exit(1);
});
