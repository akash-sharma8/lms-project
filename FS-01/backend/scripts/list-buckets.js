import { ListBucketsCommand } from '@aws-sdk/client-s3';
import s3 from '../src/config/s3.js';

const res = await s3.send(new ListBucketsCommand({}));
console.log('Buckets:', (res.Buckets || []).map((b) => b.Name));