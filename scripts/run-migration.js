#!/usr/bin/env node

/**
 * Migration runner for be-part-of-net
 * Since Supabase JS client doesn't support raw SQL execution,
 * this script prepares the SQL for manual execution in Supabase SQL Editor
 */

const fs = require('fs')
const path = require('path')

const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ Error: No migration file specified')
  console.error('Usage: node scripts/run-migration.js <migration-file-path>')
  process.exit(1)
}

const migrationPath = path.resolve(migrationFile)

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Error: Migration file not found: ${migrationPath}`)
  process.exit(1)
}

console.log('📋 Migration Ready:', path.basename(migrationPath))
console.log('📂 Path:', migrationPath)
console.log()

const sql = fs.readFileSync(migrationPath, 'utf8')

console.log('🚀 To run this migration:')
console.log()
console.log('1. Open Supabase SQL Editor:')
console.log('   👉 https://supabase.com/dashboard')
console.log('   👉 Select your project → SQL Editor')
console.log()
console.log('2. Copy the SQL below and paste it into a new query:')
console.log()
console.log('═'.repeat(80))
console.log(sql)
console.log('═'.repeat(80))
console.log()
console.log('3. Click "Run" to execute the migration')
console.log()
console.log('✅ The migration will:')
console.log('   • Add is_global_service field to nodes table')
console.log('   • Create Hondius MCP node')
console.log('   • Connect Hondius to Kurt\'s node')
console.log()
