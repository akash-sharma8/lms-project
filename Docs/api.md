# API reference

Base URL: `http://localhost:5000/api`
Auth: `Authorization: Bearer <token>` where marked.

| Method | Path | Auth | Role | Purpose |
|---|---|---|---|---|
| POST | /auth/register | no | any | Create account (student or instructor) |
| POST | /auth/login | no | any | Get token |
| GET | /auth/me | yes | any | Current user |
| GET | /courses | no | any | List published courses (`search`, `category`, `page`, `limit`) |
| GET | /courses/mine | yes | instructor, admin | My courses |
| POST | /courses | yes | instructor, admin | Create course (draft) |
| GET | /courses/:id | optional | any | Course and lessons |
| PUT | /courses/:id | yes | owner, admin | Edit course |
| PATCH | /courses/:id/publish | yes | owner, admin | Toggle draft/published |
| DELETE | /courses/:id | yes | owner, admin | Delete (blocked if students enrolled) |
| POST | /courses/:id/lessons | yes | owner, admin | Add lesson |
| POST | /courses/:id/enroll | yes | any | Enroll in a free course |
| GET | /enrollments/mine | yes | any | My enrollments and progress |
| PUT | /lessons/:id | yes | owner, admin | Edit lesson |
| DELETE | /lessons/:id | yes | owner, admin | Delete lesson |
| POST | /lessons/:id/video | yes | owner, admin | Upload video, starts conversion (202) |
| GET | /lessons/:id/video/status | yes | owner, admin | none / uploaded / processing / ready / failed |
| GET | /lessons/:id/stream/* | yes | enrolled, owner, admin | HLS playlist and segments |
| POST | /lessons/:id/complete | yes | enrolled | Mark lesson done, update progress |
| POST | /courses/:id/quizzes | yes | owner, admin | Create quiz |
| GET | /courses/:id/quizzes | yes | enrolled, owner | List quizzes |
| GET | /quizzes/:id | yes | enrolled, owner | Quiz (no answers for students) |
| POST | /quizzes/:id/submit | yes | student | Submit answers, get graded result |
| GET | /quizzes/:id/attempts | yes | student | My past attempts |
| POST | /courses/:id/live | yes | owner, admin | Schedule live class |
| GET | /courses/:id/live | yes | enrolled, owner | List live classes |
| POST | /live/:id/start | yes | owner, admin | Go live |
| POST | /live/:id/end | yes | owner, admin | End class |
| POST | /live/:id/token | yes | enrolled, owner | LiveKit join token |
| POST | /enrollments/:courseId/certificate | yes | student | Issue certificate (needs 100% and quizzes passed) |
| GET | /certificates/:id/pdf | yes | holder, admin | Download PDF |
| GET | /certificates/:id/verify | no | any | Public verification |
| POST | /payments/order/:courseId | yes | student | Create Razorpay order |
| POST | /payments/verify | yes | student | Verify signature, enroll |
| GET | /payments/earnings | yes | instructor, admin | Revenue summary |

## Common errors

| Code | Meaning |
|---|---|
| 400 | Bad input or invalid id |
| 401 | Missing or invalid token |
| 402 | Paid course, payment required |
| 403 | Role or ownership not allowed |
| 404 | Not found (also used for hidden drafts) |
| 409 | Video already processing |

## Data models

User, Course, Lesson, Enrollment, Quiz (embedded questions), Attempt, LiveClass, Payment.
Relations: Course.instructor → User, Lesson.course → Course, Enrollment (student, course) is unique, Attempt → Quiz and User, Payment → student, course, instructor.