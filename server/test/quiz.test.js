import {
  app, request, connect, resetDb, disconnect,
  makeUser, auth, makePublishedCourse,
} from "./helpers.js";

beforeAll(connect);
beforeEach(resetDb);
afterAll(disconnect);

const quizBody = {
  title: "Basics",
  passPercent: 60,
  questions: [
    { text: "Q1", options: ["a", "b", "c"], correctIndex: 1 },
    { text: "Q2", options: ["a", "b"], correctIndex: 0 },
    { text: "Q3", options: ["a", "b", "c"], correctIndex: 2 },
  ],
};

async function setup() {
  const teacher = await makeUser("instructor");
  const student = await makeUser("student");
  const courseId = await makePublishedCourse(teacher.token, 0);
  const q = await request(app)
    .post(`/api/courses/${courseId}/quizzes`)
    .set(auth(teacher.token))
    .send(quizBody);
  return { teacher, student, courseId, quizId: q.body._id };
}

describe("quiz", () => {
  test("invalid correctIndex is rejected", async () => {
    const teacher = await makeUser("instructor");
    const courseId = await makePublishedCourse(teacher.token);
    const bad = { ...quizBody, questions: [{ text: "Q", options: ["a", "b"], correctIndex: 9 }] };
    const res = await request(app)
      .post(`/api/courses/${courseId}/quizzes`)
      .set(auth(teacher.token))
      .send(bad);
    expect(res.status).toBe(400);
  });

  test("student who is not enrolled cannot open the quiz", async () => {
    const { student, quizId } = await setup();
    const res = await request(app).get(`/api/quizzes/${quizId}`).set(auth(student.token));
    expect(res.status).toBe(403);
  });

  test("enrolled student never receives correct answers", async () => {
    const { student, courseId, quizId } = await setup();
    await request(app).post(`/api/courses/${courseId}/enroll`).set(auth(student.token));

    const res = await request(app).get(`/api/quizzes/${quizId}`).set(auth(student.token));
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("correctIndex");
  });

  test("full marks passes", async () => {
    const { student, courseId, quizId } = await setup();
    await request(app).post(`/api/courses/${courseId}/enroll`).set(auth(student.token));

    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set(auth(student.token))
      .send({ answers: [1, 0, 2] });
    expect(res.body.score).toBe(3);
    expect(res.body.percent).toBe(100);
    expect(res.body.passed).toBe(true);
  });

  test("one right out of three fails", async () => {
    const { student, courseId, quizId } = await setup();
    await request(app).post(`/api/courses/${courseId}/enroll`).set(auth(student.token));

    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set(auth(student.token))
      .send({ answers: [0, 0, 0] });
    expect(res.body.score).toBe(1);
    expect(res.body.percent).toBe(33);
    expect(res.body.passed).toBe(false);
  });

  test("skipped answers (-1) score zero", async () => {
    const { student, courseId, quizId } = await setup();
    await request(app).post(`/api/courses/${courseId}/enroll`).set(auth(student.token));

    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set(auth(student.token))
      .send({ answers: [-1, -1, -1] });
    expect(res.body.score).toBe(0);
  });

  test("wrong number of answers is rejected", async () => {
    const { student, courseId, quizId } = await setup();
    await request(app).post(`/api/courses/${courseId}/enroll`).set(auth(student.token));

    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set(auth(student.token))
      .send({ answers: [1] });
    expect(res.status).toBe(400);
  });

  test("instructor cannot submit a quiz", async () => {
    const { teacher, quizId } = await setup();
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set(auth(teacher.token))
      .send({ answers: [1, 0, 2] });
    expect(res.status).toBe(403);
  });
});