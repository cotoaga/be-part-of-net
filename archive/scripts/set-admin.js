#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setAdminStatus() {
  console.log('Checking admin status for kurt@cotoaga.net...')

  // Find the auth user
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Error fetching auth users:', authError)
    process.exit(1)
  }

  const kurtAuthUser = authUsers.users.find(u => u.email === 'kurt@cotoaga.net')
  if (!kurtAuthUser) {
    console.error('Auth user not found for kurt@cotoaga.net')
    process.exit(1)
  }

  console.log('Found auth user:', kurtAuthUser.id)

  // Check if users table entry exists
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', kurtAuthUser.id)
    .maybeSingle()

  if (userError) {
    console.error('Error checking users table:', userError)
    process.exit(1)
  }

  if (!userRecord) {
    console.log('No users table entry found. Creating one...')
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        auth_user_id: kurtAuthUser.id,
        email: kurtAuthUser.email,
        is_admin: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating users entry:', insertError)
      process.exit(1)
    }

    console.log('✅ Created users entry with admin status:', newUser)
  } else {
    console.log('Current users record:', userRecord)

    if (userRecord.is_admin) {
      console.log('✅ Already admin!')
    } else {
      console.log('Setting is_admin to true...')
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('auth_user_id', kurtAuthUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating admin status:', updateError)
        process.exit(1)
      }

      console.log('✅ Admin status updated:', updated)
    }
  }
}

setAdminStatus().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
