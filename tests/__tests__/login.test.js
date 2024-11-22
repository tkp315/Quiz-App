import request from "supertest";
import app from "../../src/app.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../../src/models/user.model";
import bcrypt from "bcrypt";

let mongoServer;

beforeAll(async () => {
  // Start MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Close the database and stop the server
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe("POST /api/v1/user/login", () => {
  it("should login successfully and return cookies", async () => {
    // Seed a user into the database
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
    });

    const response = await request(app).post("/api/v1/user/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.loggedInUser).toHaveProperty("email", user.email);
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should return error (500) when email is missing", async () => {
    const response = await request(app).post("/api/v1/user/login").send({
      password: "password123",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("email not found");
  });

  it("should return error (500) when password is missing", async () => {
    const response = await request(app).post("/api/v1/user/login").send({
      email: "john@example.com",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("password not found");
  });

  it("should return error (500) for unregistered user", async () => {
    const response = await request(app).post("/api/v1/user/login").send({
      email: "notregistered@example.com",
      password: "password123",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("user is not registerd");
  });

  it("should return error (500) for incorrect password", async () => {
    // Seed a user into the database
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: hashedPassword,
    });

    const response = await request(app).post("/api/v1/user/login").send({
      email: "john@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("incorrect password");
  });
});
