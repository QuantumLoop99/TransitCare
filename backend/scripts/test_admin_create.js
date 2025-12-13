/*
  Simple test script to call the admin/create-user endpoint.
  Usage:
    Set env vars: ADMIN_SECRET, BACKEND_URL (e.g., http://localhost:3001)
    node backend/scripts/test_admin_create.js
*/

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

async function main() {
  if (!ADMIN_SECRET) return console.error('Set ADMIN_SECRET in env');

  const payload = {
    email: 'new.admin@example.com',
    firstName: 'New',
    lastName: 'Admin',
    role: 'admin'
  };

  const res = await fetch(`${BACKEND}/api/admin/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log('Status', res.status);
  console.log('Response', text);
}

main().catch(err => console.error(err));
