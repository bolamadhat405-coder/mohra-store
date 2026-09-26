import { Router } from 'express';
import { q } from '../db.js';
import { requireAdmin, audit } from '../auth.js';
import { HttpError } from '../lib/errors.js';
import * as v from '../lib/validate.js';
import { sniffImage } from '../lib/image.js';

const MAX_BYTES = 3 * 1024 * 1024;

// GET /media/:id  (public, immutable, cached for a year)
export async function serveMedia(req, res) {
  const id = v.id(req.params.id);
  const m = (await q('SELECT mime, data FROM media WHERE id = $1', [id])).rows[0];
  if (!m) throw new HttpError(404, 'NOT_FOUND');
  res.setHeader('Content-Type', m.mime);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'inline');
  res.end(m.data);
}

// POST /api/admin/media  { data: "data:image/jpeg;base64,...." }  (the admin page shrinks photos in the browser first)
export const adminMedia = Router();
adminMedia.use(requireAdmin);
adminMedia.post('/', async (req, res) => {
  const m = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(req.body?.data || ''));
  if (!m) throw new HttpError(400, 'INVALID_IMAGE');
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > MAX_BYTES) throw new HttpError(413, 'IMAGE_TOO_LARGE');
  const mime = sniffImage(buf);
  if (!mime) throw new HttpError(400, 'INVALID_IMAGE');
  const row = (await q('INSERT INTO media(mime,data,size,created_by) VALUES($1,$2,$3,$4) RETURNING id', [mime, buf, buf.length, req.user.id])).rows[0];
  audit(req.user, 'UPLOAD', 'media', row.id, { size: buf.length });
  res.status(201).json({ id: row.id, url: `/media/${row.id}` });
});
