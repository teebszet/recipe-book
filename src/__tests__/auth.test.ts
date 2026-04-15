import { checkAuth } from "@/lib/auth";

// Mock crypto.timingSafeEqual
jest.mock("crypto", () => ({
  timingSafeEqual: (a: Buffer, b: Buffer) => a.equals(b),
}));

describe("checkAuth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 401 when ADMIN_PASSWORD is not set", () => {
    delete process.env.ADMIN_PASSWORD;
    const request = new Request("http://localhost/api/recipes", {
      method: "POST",
    });
    const result = checkAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns 401 when no Authorization header", () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const request = new Request("http://localhost/api/recipes", {
      method: "POST",
    });
    const result = checkAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns 401 when Authorization header is wrong format", () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const request = new Request("http://localhost/api/recipes", {
      method: "POST",
      headers: { Authorization: "Basic abc123" },
    });
    const result = checkAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns 401 when password is incorrect", () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const request = new Request("http://localhost/api/recipes", {
      method: "POST",
      headers: { Authorization: "Bearer wrongpassword" },
    });
    const result = checkAuth(request);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns null when password is correct", () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const request = new Request("http://localhost/api/recipes", {
      method: "POST",
      headers: { Authorization: "Bearer secret123" },
    });
    const result = checkAuth(request);
    expect(result).toBeNull();
  });
});
