# Architecture

## System overview

```mermaid
flowchart LR
    Browser["React + Redux Toolkit"]
    API["Express API"]
    DB[("MongoDB")]
    Redis[("Redis")]
    Worker["BullMQ Worker + FFmpeg"]
    Store["Video storage (local, S3 in cloud)"]
    CDN["CloudFront (planned)"]
    LK["LiveKit (WebRTC SFU)"]
    RZP["Razorpay (test mode)"]

    Browser -->|REST + JWT| API
    API --> DB
    API -->|enqueue job| Redis
    Redis --> Worker
    Worker -->|HLS output| Store
    Worker -->|status update| DB
    Browser -->|HLS segments| API
    Store -.-> CDN
    CDN -.-> Browser
    API -->|issues token| Browser
    Browser <-->|video, audio, chat| LK
    Browser -->|checkout| RZP
    RZP -->|signature| Browser
    Browser -->|verify| API
```

## Video pipeline

```mermaid
sequenceDiagram
    participant I as Instructor
    participant A as API
    participant Q as Redis queue
    participant W as Worker
    participant S as Student
    I->>A: POST /lessons/:id/video (mp4)
    A->>A: check ownership, save raw file
    A->>Q: add job
    A-->>I: 202 Accepted
    W->>Q: take job
    W->>W: ffprobe, then ffmpeg 360p + 720p HLS
    W->>A: lesson status = ready (via MongoDB)
    S->>A: GET /lessons/:id/stream/master.m3u8 (JWT)
    A->>A: enrolled? owner? admin?
    A-->>S: playlist and segments
```

## Payment flow

```mermaid
sequenceDiagram
    participant S as Student browser
    participant A as API
    participant R as Razorpay
    S->>A: POST /payments/order/:courseId
    A->>R: create order (amount from DB)
    A-->>S: orderId
    S->>R: pay in checkout popup
    R-->>S: payment_id + signature
    S->>A: POST /payments/verify
    A->>A: HMAC-SHA256 check
    A->>A: mark paid, create enrollment
```

## Key design decisions

| Decision | Reason |
|---|---|
| FFmpeg in a BullMQ worker, not in the request | Conversion takes seconds to minutes, the API must stay responsive. Failed jobs retry automatically |
| HLS with 360p and 720p | Player picks quality by network speed |
| Stream route checks enrollment on every segment | Direct file URLs are not public |
| `correctIndex` never sent to students | Answers would be visible in the Network tab |
| Quiz grading on the server | Client cannot fake a score |
| Payment amount read from DB | Client cannot change the price |
| Enrollment only after signature verification | Client "success" is never trusted |
| LiveKit token carries `canPublish` | Only the instructor can broadcast |
| Certificate has public verify URL | Fake certificates can be checked |