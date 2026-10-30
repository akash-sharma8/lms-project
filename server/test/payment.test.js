import {
  app, request, connect, resetDb, disconnect,
  makeUser, auth, makePublishedCourse, razorpaySignature,
} from "./helpers.js";
import Payment from "../src/models/Payment.js";
import Course from "../src/models/Course.js";

beforeAll(connect);
beforeEach(resetDb);
afterAll(disconnect);

async function setup() {
  const teacher = await makeUser("instructor");
  const student = await makeUser("student");
  const courseId = await makePublishedCourse(teacher.token, 500);
  const course = await Course.findById(courseId);
  const payment = await Payment.create({
    student: student.id,
    course: courseId,
    instructor: course.instructor,
    amount: 500,
    platformFee: 100,
    instructorShare: 400,
    orderId: "order_test_1",
  });
  return { teacher, student, courseId, payment };
}

const enrollmentsOf = async (token) =>
  (await request(app).get("/api/enrollments/mine").set(auth(token))).body;

describe("payments", () => {
  test("paid course cannot be joined through the free enroll route", async () => {
    const { student, courseId } = await setup();
    const res = await request(app).post(`/api/courses/${courseId}/enroll`).set(auth(student.token));
    expect(res.status).toBe(402);
  });

  test("bad signature does not enroll", async () => {
    const { student } = await setup();
    const res = await request(app)
      .post("/api/payments/verify")
      .set(auth(student.token))
      .send({
        razorpay_order_id: "order_test_1",
        razorpay_payment_id: "pay_1",
        razorpay_signature: "not_a_real_signature",
      });
    expect(res.status).toBe(400);
    expect(await enrollmentsOf(student.token)).toHaveLength(0);
  });

  test("valid signature enrolls and records the split", async () => {
    const { student } = await setup();
    const res = await request(app)
      .post("/api/payments/verify")
      .set(auth(student.token))
      .send({
        razorpay_order_id: "order_test_1",
        razorpay_payment_id: "pay_1",
        razorpay_signature: razorpaySignature("order_test_1", "pay_1"),
      });
    expect(res.status).toBe(200);
    expect(await enrollmentsOf(student.token)).toHaveLength(1);

    const saved = await Payment.findOne({ orderId: "order_test_1" });
    expect(saved.status).toBe("paid");
    expect(saved.instructorShare).toBe(400);
  });

  test("verifying twice creates only one enrollment", async () => {
    const { student } = await setup();
    const body = {
      razorpay_order_id: "order_test_1",
      razorpay_payment_id: "pay_1",
      razorpay_signature: razorpaySignature("order_test_1", "pay_1"),
    };
    await request(app).post("/api/payments/verify").set(auth(student.token)).send(body);
    const again = await request(app).post("/api/payments/verify").set(auth(student.token)).send(body);
    expect(again.status).toBe(200);
    expect(await enrollmentsOf(student.token)).toHaveLength(1);
  });

  test("another student cannot verify my order", async () => {
    const { } = await setup();
    const thief = await makeUser("student");
    const res = await request(app)
      .post("/api/payments/verify")
      .set(auth(thief.token))
      .send({
        razorpay_order_id: "order_test_1",
        razorpay_payment_id: "pay_1",
        razorpay_signature: razorpaySignature("order_test_1", "pay_1"),
      });
    expect(res.status).toBe(404);
  });

  test("earnings show the instructor's 80% share", async () => {
    const { teacher, student } = await setup();
    await request(app)
      .post("/api/payments/verify")
      .set(auth(student.token))
      .send({
        razorpay_order_id: "order_test_1",
        razorpay_payment_id: "pay_1",
        razorpay_signature: razorpaySignature("order_test_1", "pay_1"),
      });
    const res = await request(app).get("/api/payments/earnings").set(auth(teacher.token));
    expect(res.body.totals.sales).toBe(1);
    expect(res.body.totals.earned).toBe(400);
  });

  test("students cannot see earnings", async () => {
    const s = await makeUser("student");
    const res = await request(app).get("/api/payments/earnings").set(auth(s.token));
    expect(res.status).toBe(403);
  });
});