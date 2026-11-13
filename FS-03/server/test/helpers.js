import "dotenv/config";

process.env.MONGO_URI = "mongodb://127.0.0.1:27017/lms_test";
process.env.JWT_SECRET = "test_secret";
process.env.RAZORPAY_KEY_ID = "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET = "test_rzp_secret";

import mongoose from "mongoose";
import request from "supertest";
import crypto from "crypto";
import app from "../src/app.js";

export { app, request, mongoose };

export async function connect() {
  if (!process.env.MONGO_URI.endsWith("_test")) {
    throw new Error("Refusing to run tests on a non-test database");
  }
  await mongoose.connect(process.env.MONGO_URI);
}

export async function resetDb() {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
}

export async function disconnect() {
  await mongoose.disconnect();
}

let counter = 0;

// naya user banao, token aur id wapas lo
export async function makeUser(role = "student") {
  counter += 1;
  const email = `${role}${counter}@test.com`;
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: `${role} ${counter}`, email, password: "123456", role });
  return { token: res.body.token, id: res.body.user.id, email };
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });

// published course (1 lesson ke saath) banao
export async function makePublishedCourse(teacherToken, price = 0) {
  const created = await request(app)
    .post("/api/courses")
    .set(auth(teacherToken))
    .send({ title: "Test course", description: "demo", price });
  const courseId = created.body._id;

  await request(app)
    .post(`/api/courses/${courseId}/lessons`)
    .set(auth(teacherToken))
    .send({ title: "Lesson 1" });
  await request(app).patch(`/api/courses/${courseId}/publish`).set(auth(teacherToken));
  return courseId;
}

export function razorpaySignature(orderId, paymentId) {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}