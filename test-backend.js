/**
 * Backend integration test script.
 * Uses mongodb-memory-server to avoid needing a real MongoDB instance.
 * Tests: healthcheck, register, login, current-user, logout.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// We'll override MONGO_URI before importing app
let mongod;
let server;
const PORT = 9999;
const BASE = `http://localhost:${PORT}`;

let accessToken = "";
let refreshToken = "";
let cookies = "";

const results = [];

function log(label, pass, detail = "") {
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} ${label}${detail ? " — " + detail : ""}`);
  results.push({ label, pass, detail });
}

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let body;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, body };
}

async function main() {
  console.log("\n🚀 Starting in-memory MongoDB...\n");
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Connect mongoose before importing app
  await mongoose.connect(uri);
  console.log(`  MongoDB connected: ${uri}\n`);

  // Dynamically import app after DB is connected
  const { default: app } = await import("./src/app.js");

  // Start server
  server = app.listen(PORT, () => {
    console.log(`  Server running on ${BASE}\n`);
  });

  // Wait for server to be ready
  await new Promise((r) => setTimeout(r, 500));

  console.log("━".repeat(50));
  console.log("  RUNNING TESTS");
  console.log("━".repeat(50) + "\n");

  // ── 1. Root endpoint ──
  try {
    const res = await request("/");
    log("GET /", res.status === 200, `status=${res.status}`);
  } catch (e) {
    log("GET /", false, e.message);
  }

  // ── 2. Healthcheck ──
  try {
    const res = await request("/api/v1/healthcheck");
    log(
      "GET /api/v1/healthcheck",
      res.status === 200 && res.body?.data?.message === "Server is running",
      `status=${res.status} message=${res.body?.data?.message}`
    );
  } catch (e) {
    log("GET /api/v1/healthcheck", false, e.message);
  }

  // ── 3. Register — validation error (missing fields) ──
  try {
    const res = await request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({}),
    });
    log(
      "POST /register (empty body → 422)",
      res.status === 422,
      `status=${res.status}`
    );
  } catch (e) {
    log("POST /register (validation)", false, e.message);
  }

  // ── 4. Register — success ──
  try {
    const res = await request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        username: "testuser",
        password: "Test@1234",
      }),
    });
    log(
      "POST /register (success)",
      res.status === 201 && res.body?.data?.user?.email === "test@example.com",
      `status=${res.status} user=${res.body?.data?.user?.username}`
    );
  } catch (e) {
    log("POST /register (success)", false, e.message);
  }

  // ── 5. Register — duplicate user ──
  try {
    const res = await request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        username: "testuser",
        password: "Test@1234",
      }),
    });
    log(
      "POST /register (duplicate → 409)",
      res.status === 409,
      `status=${res.status}`
    );
  } catch (e) {
    log("POST /register (duplicate)", false, e.message);
  }

  // ── 6. Login — wrong password ──
  try {
    const res = await request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });
    log(
      "POST /login (wrong pw → 400)",
      res.status === 400,
      `status=${res.status}`
    );
  } catch (e) {
    log("POST /login (wrong pw)", false, e.message);
  }

  // ── 7. Login — success ──
  try {
    const res = await request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test@1234",
      }),
    });

    accessToken = res.body?.data?.accessToken || "";
    refreshToken = res.body?.data?.refreshToken || "";

    log(
      "POST /login (success)",
      res.status === 200 && !!accessToken,
      `status=${res.status} hasToken=${!!accessToken}`
    );
  } catch (e) {
    log("POST /login (success)", false, e.message);
  }

  // ── 8. Current user — without token (should fail) ──
  try {
    const res = await request("/api/v1/auth/current-user");
    log(
      "GET /current-user (no token → 401)",
      res.status === 401,
      `status=${res.status}`
    );
  } catch (e) {
    log("GET /current-user (no token)", false, e.message);
  }

  // ── 9. Current user — with token ──
  try {
    const res = await request("/api/v1/auth/current-user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    log(
      "GET /current-user (with token)",
      res.status === 200 && res.body?.data?.email === "test@example.com",
      `status=${res.status} email=${res.body?.data?.email}`
    );
  } catch (e) {
    log("GET /current-user (with token)", false, e.message);
  }

  // ── 10. Logout — without token (should fail) ──
  try {
    const res = await request("/api/v1/auth/logout", { method: "POST" });
    log(
      "POST /logout (no token → 401)",
      res.status === 401,
      `status=${res.status}`
    );
  } catch (e) {
    log("POST /logout (no token)", false, e.message);
  }

  // ── 11. Logout — with token ──
  try {
    const res = await request("/api/v1/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    log(
      "POST /logout (with token)",
      res.status === 200,
      `status=${res.status}`
    );
  } catch (e) {
    log("POST /logout (with token)", false, e.message);
  }

  // ── Summary ──
  console.log("\n" + "━".repeat(50));
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`  RESULTS: ${passed}/${total} tests passed`);
  console.log("━".repeat(50) + "\n");

  // Cleanup
  server.close();
  await mongoose.disconnect();
  await mongod.stop();

  process.exit(passed === total ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
