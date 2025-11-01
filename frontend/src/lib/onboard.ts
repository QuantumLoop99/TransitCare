export async function fetchOnboardUser(payload: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const res = await fetch('/api/users/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Onboard failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function createAdminUser(payload: {
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'officer';
}, adminSecret: string) {
  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create admin user failed: ${res.status} ${text}`);
  }

  return res.json();
}
