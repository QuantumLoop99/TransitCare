import { Router } from 'express';
import fetch from 'node-fetch';
import User from '../models/User.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = Router();

router.post('/create-user', requireAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, role } = req.body;
    if (!email || !role) return res.status(400).json({ success: false, error: 'Missing fields' });

    if (!process.env.CLERK_API_KEY) {
      return res.status(500).json({ success: false, error: 'Server not configured with CLERK_API_KEY' });
    }

    const clerkResp = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_addresses: [{ email_address: email }],
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!clerkResp.ok) {
      const text = await clerkResp.text();
      console.error('Clerk API error', clerkResp.status, text);
      return res.status(500).json({ success: false, error: 'Clerk API error' });
    }

    const clerkUser = await clerkResp.json();
    const clerkId = clerkUser.id || clerkUser?.user?.id;

    if (!clerkId) {
      console.error('Unexpected Clerk response', clerkUser);
      return res.status(500).json({ success: false, error: 'Invalid Clerk response' });
    }

    const localUser = new User({
      email,
      firstName,
      lastName,
      role,
      clerkId,
    });

    await localUser.save();

    return res.json({ success: true, data: { localUser, clerkUser } });
  } catch (error) {
    console.error('create-user error', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
