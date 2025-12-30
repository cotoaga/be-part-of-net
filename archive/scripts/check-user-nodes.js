/**
 * Check if user nodes have controlled_by set
 * This diagnostic helps identify why "+ Add Connection" button doesn't appear
 *
 * Usage: node scripts/check-user-nodes.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim()
      process.env[key] = value
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUserNodes() {
  console.log('🔍 Checking user nodes...\n')

  // Get all person nodes (non-demo)
  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('id, name, email, controlled_by, type')
    .eq('type', 'person')
    .eq('is_demo', false)

  if (nodesError) {
    console.error('❌ Error fetching nodes:', nodesError)
    return
  }

  console.log(`Found ${nodes.length} person nodes:\n`)

  let needsFix = 0
  let isOk = 0

  for (const node of nodes) {
    const hasControlledBy = node.controlled_by && node.controlled_by.length > 0

    if (hasControlledBy) {
      console.log(`✅ ${node.name || 'Unnamed'} (${node.email || 'no email'})`)
      console.log(`   controlled_by: [${node.controlled_by.join(', ')}]`)
      isOk++
    } else {
      console.log(`❌ ${node.name || 'Unnamed'} (${node.email || 'no email'})`)
      console.log(`   controlled_by: ${JSON.stringify(node.controlled_by)} (EMPTY/NULL)`)
      console.log(`   👉 This node will NOT show "+ Add Connection" button`)
      needsFix++
    }
    console.log()
  }

  console.log('📊 Summary:')
  console.log(`   ✅ OK: ${isOk}`)
  console.log(`   ❌ Needs Fix: ${needsFix}`)

  if (needsFix > 0) {
    console.log('\n🔧 To fix: Run this SQL in Supabase SQL Editor:')
    console.log('---')
    console.log(`
UPDATE nodes n
SET controlled_by = ARRAY[u.id]
FROM auth.users u
WHERE n.email = u.email
  AND n.type = 'person'
  AND n.is_demo = false
  AND (n.controlled_by IS NULL OR n.controlled_by = '{}');
    `.trim())
    console.log('---')
  } else {
    console.log('\n✨ All nodes look good!')
  }
}

checkUserNodes().catch(console.error)
