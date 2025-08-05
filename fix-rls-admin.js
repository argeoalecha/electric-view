#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Fixing RLS Policies with Admin Access...\n');

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRlsPolicies() {
  const policies = [
    // Disable RLS temporarily
    'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;', 
    'ALTER TABLE companies DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE deals DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE activities DISABLE ROW LEVEL SECURITY;',
    
    // Drop problematic policies
    'DROP POLICY IF EXISTS "Users can view their organization" ON organizations;',
    'DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;',
    'DROP POLICY IF EXISTS "Users can manage companies in their organization" ON companies;',
    'DROP POLICY IF EXISTS "Users can manage contacts in their organization" ON contacts;',
    'DROP POLICY IF EXISTS "Users can manage deals in their organization" ON deals;',
    'DROP POLICY IF EXISTS "Users can manage activities in their organization" ON activities;',
    
    // Create simple policies for demo mode
    'CREATE POLICY "Allow read access to organizations" ON organizations FOR SELECT USING (true);',
    'CREATE POLICY "Allow read access to profiles" ON profiles FOR SELECT USING (true);',
    'CREATE POLICY "Allow all access to companies" ON companies FOR ALL USING (true);',
    'CREATE POLICY "Allow all access to contacts" ON contacts FOR ALL USING (true);',
    'CREATE POLICY "Allow all access to deals" ON deals FOR ALL USING (true);',
    'CREATE POLICY "Allow all access to activities" ON activities FOR ALL USING (true);',
    
    // Re-enable RLS
    'ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE companies ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE deals ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE activities ENABLE ROW LEVEL SECURITY;'
  ];

  console.log('🔄 Executing RLS policy fixes...');
  
  for (let i = 0; i < policies.length; i++) {
    const sql = policies[i];
    console.log(`${i + 1}/${policies.length} ${sql.split(' ').slice(0, 4).join(' ')}...`);
    
    try {
      // Use direct SQL execution
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        const error = await response.text();
        console.log(`   ⚠️  ${response.status}: ${error.substring(0, 100)}`);
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (error) {
      console.log(`   ⚠️  ${error.message}`);
    }
  }

  console.log('\n🧪 Testing fixed policies...');
  
  // Test with anon key
  const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    const { data, error } = await anonSupabase
      .from('companies')
      .select('id, name, industry, status')
      .limit(3);

    if (error) {
      console.log(`❌ Test failed: ${error.message}`);
    } else {
      console.log(`✅ Test passed: Retrieved ${data.length} companies`);
      if (data.length > 0) {
        console.log(`   📋 Sample: ${data[0].name} (${data[0].industry})`);
      }
    }
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
  }

  console.log('\n🎉 RLS Policy Fix Complete!');
}

fixRlsPolicies().catch(console.error);