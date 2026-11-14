import { z } from 'zod';
import redis from '../../config/redis.js';
import * as searchService from './search.service.js';

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  categoryId: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const CACHE_SECONDS = 30;
const cacheEnabled = () =>
  process.env.SEARCH_CACHE !== 'off' && process.env.NODE_ENV !== 'test';

export async function run(req, res) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid search parameters' });
  }

  const key = `search:${JSON.stringify(parsed.data)}`;

  if (cacheEnabled()) {
    try {
      const hit = await redis.get(key);
      if (hit) {
        res.set('X-Cache', 'HIT');
        return res.type('json').send(hit);
      }
    } catch (err) {
      console.error('search cache read failed:', err.message);
    }
  }

  let result;
  let usedFallback = false;
  try {
    result = await searchService.search(parsed.data);
  } catch (err) {
    // Elasticsearch is down or unreachable: answer from PostgreSQL instead
    console.error('Elasticsearch failed, using Postgres fallback:', err.message);
    result = await searchService.searchFallback(parsed.data);
    usedFallback = true;
  }

  if (cacheEnabled() && !usedFallback) {
    redis.set(key, JSON.stringify(result), 'EX', CACHE_SECONDS).catch(() => {});
  }
  res.set('X-Cache', 'MISS');
  if (usedFallback) res.set('X-Search', 'postgres-fallback');
  res.json(result);
}