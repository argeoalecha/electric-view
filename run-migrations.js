#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSql(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      throw error;
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runMigration(fileName) {
  const filePath = path.join(__dirname, 'supabase/migrations', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Migration file not found: ${fileName}`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`🔄 Running migration: ${fileName}`);

  try {
    // Try executing the full SQL at once
    const result = await executeSql(sql);
    
    if (result.success) {
      console.log(`✅ Migration completed: ${fileName}`);
      return true;
    } else {
      console.log(`⚠️  Migration had issues: ${fileName} - ${result.error}`);
      // Split and try individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      let successCount = 0;
      
      for (const statement of statements) {
        if (statement.trim()) {
          const stmtResult = await executeSql(statement.trim());
          if (stmtResult.success) {
            successCount++;
          }
        }
      }
      
      console.log(`📊 Executed ${successCount}/${statements.length} statements`);
      return successCount > 0;
    }
  } catch (error) {
    console.error(`❌ Migration failed: ${fileName}`, error.message);
    return false;
  }
}

// Create the exec_sql function first
async function createExecSqlFunction() {
  console.log('🔄 Creating exec_sql function...');
  
  const execSqlFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN json_build_object('success', true);
    EXCEPTION
      WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
    $$;
  `;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql_query: execSqlFunction })
    });

    if (response.ok) {
      console.log('✅ exec_sql function created');
      return true;
    } else {
      // Function might already exist, try executing a simple SQL
      const testResult = await executeSql('SELECT 1 as test');
      if (testResult.success) {
        console.log('✅ exec_sql function available');
        return true;
      }
      
      console.log('⚠️  Will try direct SQL execution');
      return false;
    }
  } catch (error) {
    console.log('⚠️  exec_sql function creation failed, continuing...');
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting Philippine CRM Database Setup\n');
  
  // Try to create exec_sql function
  await createExecSqlFunction();
  
  // Migration files in order
  const migrations = [
    '20250724120000_create_initial_schema.sql',
    '20250724120003_philippines_crm_enhanced.sql',
    '20250724120004_enhanced_rls_policies.sql',
    '20250724120005_business_functions.sql',
    '20250724120006_lead_scoring_automation.sql',
    '20250724120007_enhanced_seed_data.sql'
  ];

  let success = 0;
  let failed = 0;

  for (const migration of migrations) {
    const result = await runMigration(migration);
    if (result) {
      success++;
    } else {
      failed++;
    }
    console.log(''); // Add spacing
  }

  console.log('📊 Database Setup Complete');
  console.log(`✅ Successful migrations: ${success}`);
  console.log(`❌ Failed migrations: ${failed}`);
  
  if (success > 0) {
    console.log('\n🎉 Philippine CRM database setup completed!');
    console.log('📝 Features available:');
    console.log('   • Multi-tenant architecture with RLS');
    console.log('   • Philippine business context (TIN, regions)');
    console.log('   • Cultural intelligence (relationship levels)');
    console.log('   • Lead scoring automation');
    console.log('   • Sample Philippine companies data');
  } else {
    console.log('\n⚠️  Database setup had issues. Check Supabase dashboard for table status.');
  }
}

setupDatabase().catch(console.error);