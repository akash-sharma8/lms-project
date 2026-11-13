# LMS with Live Classes

Full-stack learning platform: courses, HLS video lessons, quizzes with auto-grading,
live classes with chat, PDF certificates, and instructor earnings.

## Stack
MongoDB, Express, React, Node, Redux Toolkit, BullMQ + Redis, FFmpeg (HLS),
LiveKit (WebRTC), Razorpay (test mode), PDFKit.

## Features
- Roles: student, instructor, admin
- Course builder, lesson video upload with live conversion status
- Adaptive HLS streaming (360p, 720p), access restricted to enrolled students
- Quizzes graded on the server, attempt history
- Live classes with video and chat; only the host can publish
- Certificates with QR code and public verify page
- Razorpay checkout with signature verification, 80/20 revenue split, earnings dashboard

## Requirements
Node 20+, Docker, FFmpeg (on PATH), a LiveKit Cloud project, a Razorpay test account.

## Setup
1. `docker compose up -d`
2. `cd server && cp .env.example .env` and fill in values
3. `npm install`, then `npm run seed`
4. Terminal A: `npm run dev`. Terminal B: `npm run worker`
5. `cd client && cp .env.example .env && npm install && npm run dev`
6. Open http://localhost:5173

## Demo accounts (after seed)
| Role | Email | Password |
|---|---|---|
| Admin | admin@lms.com | admin123 |
| Instructor | rohit@lms.com | teacher123 |
| Student | aman@lms.com | student123 |

Razorpay test card: 4111 1111 1111 1111, any future date, any CVV.

## Tests
`cd server && npm test` (uses the separate `lms_test` database)

## Docs
- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Test results](docs/test-results.md)

## Project structure
<paste the folder tree here>

## Known limitations and next steps
See docs/test-results.md. Next: S3 + CloudFront delivery, Razorpay webhook,
Unicode certificate fonts, persisted chat, frontend tests.