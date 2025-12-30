#!/usr/bin/env tsx
/**
 * Run migrations using Supabase REST API
 * This bypasses psql connection issues
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// TypeScript now knows these are defined after the exit check
const supabaseUrl: string = SUPABASE_URL;
const supabaseAnonKey: string = SUPABASE_ANON_KEY;

async function runMigrations() {
  console.log('🚀 Running migrations via Supabase API...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Read migration files
  const migration1 = readFileSync(join(process.cwd(), 'migrations/001_fresh_start_schema.sql'), 'utf-8');
  const migration2 = readFileSync(join(process.cwd(), 'migrations/002_seed_zaphodszoo.sql'), 'utf-8');

  console.log('📄 Migration 1: Fresh start schema');
  console.log('   File size:', migration1.length, 'bytes\n');

  // Note: Supabase client can't execute raw SQL directly
  // We need to use the SQL Editor or direct database connection

  console.log('⚠️  Supabase client cannot execute DDL statements.');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('');
  console.log('1. Open: https://supabase.com/dashboard/project/rdxfxrnakweaydhloaev/sql/new');
  console.log('');
  console.log('2. Copy and paste this into SQL Editor:');
  console.log('');
  console.log('--- START MIGRATION #1 ---');
  console.log(migration1);
  console.log('--- END MIGRATION #1 ---');
  console.log('');
  console.log('3. Click "Run" and wait for success');
  console.log('');
  console.log('4. Then copy and paste this:');
  console.log('');
  console.log('--- START MIGRATION #2 ---');
  console.log(migration2);
  console.log('--- END MIGRATION #2 ---');
  console.log('');
  console.log('5. Click "Run" again');
  console.log('');
  console.log('✅ Done! Your migrations will be complete.');
}

runMigrations();
