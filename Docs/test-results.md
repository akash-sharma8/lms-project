# Test results

## Automated (Jest + Supertest)

Command: `npm test`  Date: <date>

<paste the terminal summary here: Test Suites, Tests, Time>

| Suite | Tests | Covers |
|---|---|---|
| auth | 6 | register, admin blocked, duplicate email, login, token check |
| courses | 6 | role guard, ownership, draft hiding, publish rule, invalid id |
| quiz | 8 | answer hiding, grading, skipped, bad input, role |
| payments | 7 | 402 bypass, bad signature, valid signature, idempotent, ownership, earnings |

## Manual tests

| Feature | Test | Result |
|---|---|---|
| Video upload | mp4 to HLS, plays in browser | |
| Protected stream | not enrolled gives 403, no token gives 401 | |
| Live class | instructor and student, video, chat | |
| Certificate | PDF, QR, verify page, fake ID | |
| Razorpay | card success, cancel, failure UPI | |

## Performance

<paste your FFmpeg table and autocannon table here>

## Known limitations

- Videos are stored on local disk (S3 and CloudFront planned)
- Certificate PDF supports Latin names only (default font)
- Live class chat is not saved after the class ends
- No Razorpay webhook yet
- No automated frontend tests