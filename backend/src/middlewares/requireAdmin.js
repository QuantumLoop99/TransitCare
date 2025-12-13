export function requireAdmin(req, res, next) {
  try {
    const adminSecret = req.header('x-admin-secret');
    if (adminSecret && process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET) {
      return next();
    }

    return res.status(403).json({ success: false, error: 'Unauthorized: missing or invalid admin secret' });
  } catch (error) {
    console.error('requireAdmin error', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
