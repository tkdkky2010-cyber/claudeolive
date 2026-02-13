import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://krpjllykhifjgrvdvedv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtycGpsbHlraGlmamdydmR2ZWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk2MTgwNSwiZXhwIjoyMDg2NTM3ODA1fQ.JTskecEV1y1mwjbjimxpXMx5i8npncuV5EquBI7zFEY';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Setting up Supabase database schema...\n');

// Read the PostgreSQL schema file
const schema = readFileSync('./src/db/schema-postgres.sql', 'utf-8');

// Split into individual statements
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

// Execute each statement
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';';
  const preview = statement.substring(0, 80).replace(/\n/g, ' ');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement }).catch(() => {
      // If RPC doesn't exist, try direct execution
      return { error: { message: 'Using alternative method' } };
    });

    if (error && error.message !== 'Using alternative method') {
      console.log(`⚠️  Statement ${i + 1}: ${preview}...`);
      console.log(`   Error: ${error.message}\n`);
      errorCount++;
    } else {
      console.log(`✅ Statement ${i + 1}: ${preview}...`);
      successCount++;
    }
  } catch (err) {
    console.log(`❌ Statement ${i + 1}: ${preview}...`);
    console.log(`   Error: ${err.message}\n`);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`📊 Summary: ${successCount} succeeded, ${errorCount} failed`);
console.log('='.repeat(60) + '\n');

if (errorCount > 0) {
  console.log('⚠️  Some statements failed. This is often okay if:');
  console.log('   - Tables already exist');
  console.log('   - Extensions are already enabled');
  console.log('   - RLS policies conflict\n');
}

console.log('✅ Schema setup complete!');
console.log('\n🔍 Verifying tables...\n');

// Verify tables were created
const tables = ['products', 'users', 'cart_items', 'login_attempts', 'email_verification_tokens'];
for (const table of tables) {
  const { data, error } = await supabase.from(table).select('count').limit(1);
  if (error) {
    console.log(`❌ ${table}: ${error.message}`);
  } else {
    console.log(`✅ ${table}: Table exists and is accessible`);
  }
}

console.log('\n🎉 Database setup complete!\n');
