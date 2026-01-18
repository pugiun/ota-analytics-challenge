/**
 * Seed script to create test users via Supabase Admin API
 * Run with: npx tsx supabase/seed-users.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wvauuksvdavszzcaelkg.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('You can find this in your Supabase Dashboard > Project Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    email: 'analyticsusera@gmail.com',
    password: 'Password123',
    display_name: 'User A',
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    email: 'analyticsuserb@gmail.com',
    password: 'Password123',
    display_name: 'User B',
  },
];

async function seedUsers() {
  console.log('Creating test users via Admin API...\n');

  for (const user of users) {
    // First try to delete existing user if any
    try {
      await supabase.auth.admin.deleteUser(user.id);
    } catch {
      // Ignore if user doesn't exist
    }

    // Create user via Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        display_name: user.display_name,
      },
    });

    if (error) {
      console.error(`Failed to create user ${user.email}:`, error.message);
    } else {
      console.log(`Created user: ${user.email}`);
    }
  }

  console.log('\nDone! Users created:');
  console.log('  Email: analyticsusera@gmail.com | Password: Password123');
  console.log('  Email: analyticsuserb@gmail.com | Password: Password123');
}

seedUsers().catch(console.error);
