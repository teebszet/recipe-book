/**
 * Integration tests for POST /api/import (fixtures-based, no real network).
 * Mocks importFromUrl so we test the route handler logic only.
 */

jest.mock("@/lib/import", () => ({ importFromUrl: jest.fn() }));
jest.mock("@/lib/auth", () => ({ checkAuth: jest.fn() }));

import { POST } from "@/app/api/import/route";
import { importFromUrl } from "@/lib/import";
import { checkAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

const mockImport = importFromUrl as jest.MockedFunction<typeof importFromUrl>;
const mockAuth = checkAuth as jest.MockedFunction<typeof checkAuth>;

function makeRequest(body: unknown, authed = true): Request {
  mockAuth.mockReturnValue(authed ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  return new Request("http://localhost/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const IMPORT_RESULT = {
  title: "Beef Stew",
  description: "A hearty stew.",
  ingredients: [{ name: "beef", quantity: "500", unit: "g", notes: null }],
  instructions: [{ stepNumber: 1, text: "Brown the beef." }],
  tags: ["dinner"],
  photos: [{ id: "photo-1", url: "/api/uploads/abc.jpg" }],
};

beforeEach(() => jest.clearAllMocks());

test("401 when unauthenticated", async () => {
  const req = makeRequest({ url: "https://example.com/recipe" }, false);
  const res = await POST(req);
  expect(res.status).toBe(401);
  expect(mockImport).not.toHaveBeenCalled();
});

test("400 when url is missing", async () => {
  const req = makeRequest({});
  const res = await POST(req);
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error).toMatch(/url is required/i);
});

test("400 when url is not a string", async () => {
  const req = makeRequest({ url: 42 });
  const res = await POST(req);
  expect(res.status).toBe(400);
});

test("400 when url has unsupported scheme", async () => {
  const req = makeRequest({ url: "ftp://example.com/file" });
  const res = await POST(req);
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error).toMatch(/http/i);
});

test("400 when url is malformed", async () => {
  const req = makeRequest({ url: "not a url at all" });
  const res = await POST(req);
  expect(res.status).toBe(400);
});

test("200 with mapped data on valid URL", async () => {
  mockImport.mockResolvedValue(IMPORT_RESULT);
  const req = makeRequest({ url: "https://example.com/recipe" });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.title).toBe("Beef Stew");
  expect(body.photos).toHaveLength(1);
  expect(mockImport).toHaveBeenCalledWith("https://example.com/recipe");
});

test("422 when importFromUrl throws (e.g. blocked URL, no parseable content)", async () => {
  mockImport.mockRejectedValue(new Error("Could not extract recipe data"));
  const req = makeRequest({ url: "https://cloudflare-blocked.com/recipe" });
  const res = await POST(req);
  expect(res.status).toBe(422);
  const body = await res.json();
  expect(body.error).toMatch(/could not extract/i);
});

test("422 on Instagram URL (phase 2 not yet implemented)", async () => {
  mockImport.mockRejectedValue(new Error("Instagram import is not yet supported"));
  const req = makeRequest({ url: "https://www.instagram.com/p/ABC123/" });
  const res = await POST(req);
  expect(res.status).toBe(422);
  const body = await res.json();
  expect(body.error).toMatch(/instagram/i);
});
