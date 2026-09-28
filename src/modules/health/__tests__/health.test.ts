import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../../infrastructure/http/app.js";

const app = createApp();

describe("health module", () => {
	it("GET /health/live returns 200 without touching the database", async () => {
		const res = await request(app).get("/health/live");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ status: "ok" });
	});

	it("GET /health/ready returns 200 when the database is reachable", async () => {
		const res = await request(app).get("/health/ready");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ status: "ok", checks: { database: "up" } });
	});
});

describe("infrastructure HTTP behaviour", () => {
	it("returns 404 with a JSON body for unknown routes", async () => {
		const res = await request(app).get("/does-not-exist");
		expect(res.status).toBe(404);
		expect(res.body.code).toBe("NOT_FOUND");
	});

	it("returns 400 INVALID_JSON for a malformed body", async () => {
		const res = await request(app)
			.post("/health/live")
			.set("content-type", "application/json")
			.send('{"broken');
		expect(res.status).toBe(400);
		expect(res.body.code).toBe("INVALID_JSON");
	});

	it("echoes an x-request-id header on responses", async () => {
		const res = await request(app).get("/health/live");
		expect(res.headers["x-request-id"]).toBeTruthy();
	});
});
