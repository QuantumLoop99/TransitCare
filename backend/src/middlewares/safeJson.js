import express from 'express';

export function safeJson(req, res, next) {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return next();
  }
  return express.json({ limit: '10mb', strict: false })(req, res, next);
}
