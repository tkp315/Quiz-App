import supertest from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/models/user.model";
import { Profile } from "../../src/models/profile.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let server;
let request;

beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    server = app.listen(3001); // Start the server
    request = supertest(server); // Initialize supertest
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await server.close();
  });
  
  describe("POST /api/v1/user/signup", () => {
    afterEach(async () => {
      // Clear the database after each test
      await User.deleteMany({});
      await Profile.deleteMany({});
    });
  
    it("should register a new user successfully", async () => {
      const response = await request.post("/api/v1/user/signup").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "Student",
      });
  
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("name", "John Doe");
      expect(response.body.data).not.toHaveProperty("password");
    });
  
    it("should return error when required fields are missing", async () => {
      const response = await request.post("/api/v1/user/signup").send({
        name: "John Doe",
        email: "",
        password: "password123",
        confirmPassword: "password123",
        role: "Student",
      });
  
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("please enter all the fields");
    });
  
    it("should return error if email is already registered", async () => {
      await User.create({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "Student",
      });
  
      const response = await request.post("/api/v1/user/signup").send({
        name: "Jane Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
        role: "Student",
      });
  
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Already Registered");
    });
  
    it("should return error when passwords do not match", async () => {
      const response = await request.post("/api/v1/user/signup").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password321",
        role: "Student",
      });
  
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("password not matched");
    });
  });




