/**
 * Run seed SQL via Supabase Management API
 *
 * Requires environment variables:
 * - SUPABASE_PROJECT_REF: Your Supabase project reference ID
 * - SUPABASE_ACCESS_TOKEN: Your Supabase Personal Access Token
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF || !ACCESS_TOKEN) {
  console.error('Error: Required environment variables are missing');
  console.error('Please set SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

async function runSeed() {
  const seedPath = path.join(__dirname, 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');

  console.log('Running seed SQL via Management API...');

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: seedSql }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to run seed:', error);
    process.exit(1);
  }

  const result = await response.json();
  console.log('Seed completed successfully!');
  console.log('Result:', JSON.stringify(result, null, 2));
}

runSeed().catch(console.error);
