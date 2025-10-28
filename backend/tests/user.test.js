const request = require("supertest");
const app = require("../src/index"); // Assuming your express app is exported from src/index.js
const mongoose = require("mongoose");
const User = require("../src/models/user");
const jwt = require("jsonwebtoken");

let server;
let token;
let userId;

beforeAll(async () => {
  server = app.listen(4000);
  await mongoose.connect(process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/expenseDBTest", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a test user
  const user = new User({
    name: "Test User",
    email: "testuser@example.com",
    password: "hashedpassword",
    totalAmount: 1000,
  });
  await user.save();
  userId = user._id;

  // Generate JWT token
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET || "yourSecretKey", { expiresIn: "1h" });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
  server.close();
});

describe("User API tests", () => {
  test("GET /api/user/profile - success", async () => {
    const res = await request(server)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("testuser@example.com");
    expect(res.body).not.toHaveProperty("password");
  });

  test("GET /api/user/profile - unauthorized", async () => {
    const res = await request(server).get("/api/user/profile");
    expect(res.statusCode).toBe(401);
  });

  test("PUT /api/user/updateBudget - success", async () => {
    const res = await request(server)
      .put("/api/user/updateBudget")
      .set("Authorization", `Bearer ${token}`)
      .send({ additionalAmount: 500 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Budget updated successfully");
    expect(res.body.totalAmount).toBe(1500);
  });

  test("PUT /api/user/updateBudget - invalid amount", async () => {
    const res = await request(server)
      .put("/api/user/updateBudget")
      .set("Authorization", `Bearer ${token}`)
      .send({ additionalAmount: -100 });
    expect(res.statusCode).toBe(400);
  });
});
