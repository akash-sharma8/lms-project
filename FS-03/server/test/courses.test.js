import {
  app, request, connect, resetDb, disconnect,
  makeUser, auth, makePublishedCourse,
} from "./helpers.js";

beforeAll(connect);
beforeEach(resetDb);
afterAll(disconnect);

describe("courses and role guards", () => {
  test("student cannot create a course", async () => {
    const s = await makeUser("student");
    const res = await request(app)
      .post("/api/courses")
      .set(auth(s.token))
      .send({ title: "x", description: "y" });
    expect(res.status).toBe(403);
  });

  test("instructor creates a draft course", async () => {
    const t = await makeUser("instructor");
    const res = await request(app)
      .post("/api/courses")
      .set(auth(t.token))
      .send({ title: "x", description: "y" });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("draft");
  });

  test("cannot publish without a lesson", async () => {
    const t = await makeUser("instructor");
    const c = await request(app)
      .post("/api/courses")
      .set(auth(t.token))
      .send({ title: "x", description: "y" });
    const res = await request(app)
      .patch(`/api/courses/${c.body._id}/publish`)
      .set(auth(t.token));
    expect(res.status).toBe(400);
  });

  test("another instructor cannot edit my course", async () => {
    const owner = await makeUser("instructor");
    const other = await makeUser("instructor");
    const id = await makePublishedCourse(owner.token);
    const res = await request(app)
      .put(`/api/courses/${id}`)
      .set(auth(other.token))
      .send({ title: "hacked" });
    expect(res.status).toBe(403);
  });

  test("drafts are hidden from the public list and detail", async () => {
    const t = await makeUser("instructor");
    const c = await request(app)
      .post("/api/courses")
      .set(auth(t.token))
      .send({ title: "secret draft", description: "y" });

    const list = await request(app).get("/api/courses");
    expect(list.body.total).toBe(0);

    const detail = await request(app).get(`/api/courses/${c.body._id}`);
    expect(detail.status).toBe(404);
  });

  test("malformed id returns 400, not 500", async () => {
    const res = await request(app).get("/api/courses/abc");
    expect(res.status).toBe(400);
  });
});