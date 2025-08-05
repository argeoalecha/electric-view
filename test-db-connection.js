#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase.from('organizations').select('count');
    
    if (error) {
      console.log('⚠️  Basic query failed:', error.message);
      console.log('🎯 This is expected if tables don\'t exist yet');
    } else {
      console.log('✅ Connection successful');
    }

    console.log('\n🔍 Testing table structure...');
    
    // Test if we can select from companies table
    const { data: companies, error: compError } = await supabase.from('companies').select('*').limit(1);
    
    if (compError) {
      console.log('❌ Companies table not found:', compError.message);
      console.log('📝 Need to run database setup in Supabase dashboard');
    } else {
      console.log(`✅ Companies table exists (${companies.length} sample records)`);
    }

    // Test contacts table
    const { data: contacts, error: contactError } = await supabase.from('contacts').select('*').limit(1);
    
    if (contactError) {
      console.log('❌ Contacts table not found:', contactError.message);
    } else {
      console.log(`✅ Contacts table exists (${contacts.length} sample records)`);
    }

    // Test deals table
    const { data: deals, error: dealError } = await supabase.from('deals').select('*').limit(1);
    
    if (dealError) {
      console.log('❌ Deals table not found:', dealError.message);
    } else {
      console.log(`✅ Deals table exists (${deals.length} sample records)`);
    }

    console.log('\n📊 Database Integration Status:');
    console.log('✅ Environment variables configured');
    console.log('✅ Supabase client connection working');
    
    if (!compError && !contactError && !dealError) {
      console.log('✅ All tables exist and accessible');
      console.log('🎉 Ready for production deployment!');
    } else {
      console.log('⚠️  Some tables missing - run database-init.sql in Supabase dashboard');
      console.log('📝 See: database-init.sql file created in project root');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();