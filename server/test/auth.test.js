import { app, request, connect, resetDb, disconnect, makeUser, auth } from "./helpers.js";

beforeAll(connect);
beforeEach(resetDb);
afterAll(disconnect);

describe("auth", () => {
  test("register returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "A", email: "a@test.com", password: "123456" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("student");
  });

  test("nobody can register as admin", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Evil", email: "e@test.com", password: "123456", role: "admin" });
    expect(res.body.user.role).toBe("student");
  });

  test("duplicate email is rejected", async () => {
    const body = { name: "A", email: "a@test.com", password: "123456" };
    await request(app).post("/api/auth/register").send(body);
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(400);
  });

  test("wrong password gives 401", async () => {
    const u = await makeUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: u.email, password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  test("/me needs a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("/me works with a valid token", async () => {
    const u = await makeUser();
    const res = await request(app).get("/api/auth/me").set(auth(u.token));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(u.email);
  });
});