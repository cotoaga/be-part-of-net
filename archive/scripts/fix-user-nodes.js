/**
 * Fix user nodes to have controlled_by set properly
 * Run this to ensure "+ Add Connection" button appears
 *
 * Usage: node scripts/fix-user-nodes.js
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixUserNodes() {
  console.log('🔍 Checking user nodes...\n')

  // Get all auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('❌ Error fetching auth users:', authError)
    return
  }

  console.log(`Found ${authUsers.users.length} auth users\n`)

  // Get all person nodes (non-demo)
  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('id, name, email, controlled_by')
    .eq('type', 'person')
    .eq('is_demo', false)

  if (nodesError) {
    console.error('❌ Error fetching nodes:', nodesError)
    return
  }

  console.log(`Found ${nodes.length} person nodes\n`)

  // Fix each node
  let fixed = 0
  let skipped = 0

  for (const node of nodes) {
    const authUser = authUsers.users.find(u => u.email === node.email)

    if (!authUser) {
      console.log(`⚠️  No auth user found for node: ${node.name} (${node.email})`)
      skipped++
      continue
    }

    // Check if controlled_by needs updating
    const hasUserId = node.controlled_by?.includes(authUser.id)

    if (hasUserId) {
      console.log(`✅ ${node.name} - already has controlled_by set`)
      skipped++
      continue
    }

    // Update the node
    const { error: updateError } = await supabase
      .from('nodes')
      .update({ controlled_by: [authUser.id] })
      .eq('id', node.id)

    if (updateError) {
      console.error(`❌ Failed to update ${node.name}:`, updateError)
    } else {
      console.log(`🔧 FIXED: ${node.name} - added user ${authUser.id} to controlled_by`)
      fixed++
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   Fixed: ${fixed}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${nodes.length}`)

  if (fixed > 0) {
    console.log('\n✨ Success! The "+ Add Connection" button should now appear.')
  }
}

fixUserNodes().catch(console.error)
