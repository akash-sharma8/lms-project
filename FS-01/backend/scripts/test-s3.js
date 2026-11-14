import uploadToS3 from '../src/utils/uploadToS3.js';

const url = await uploadToS3(
  { originalname: 'hello.txt', buffer: Buffer.from('hello'), mimetype: 'text/plain' },
  'test'
);
console.log('Uploaded to:', url);