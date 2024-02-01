import request from "supertest";
import app from "../app";

describe("Express App", () => {
  it("should check if db is connected", async () => {
    jest.setTimeout(15000);

    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Connected to the database");
  });
});
