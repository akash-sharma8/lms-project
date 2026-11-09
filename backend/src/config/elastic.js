import { Client } from '@elastic/elasticsearch';

const es = new Client({
  node: process.env.ELASTIC_URL || 'http://localhost:9200',
  auth: process.env.ELASTIC_API_KEY ? { apiKey: process.env.ELASTIC_API_KEY } : undefined,
  requestTimeout: 3000,
  maxRetries: 0,
});

export const INDEX = 'products';
export default es;