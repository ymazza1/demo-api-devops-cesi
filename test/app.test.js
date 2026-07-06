const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { createApp } = require("../src/app");

const app = createApp();

test("GET / renvoie 200 et le statut ok", async () => {
  const res = await request(app).get("/");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, "ok");
});

test("GET /health renvoie 200", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, "healthy");
});

test("GET /products renvoie la liste des produits", async () => {
  const res = await request(app).get("/products");
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
});

test("GET /products/:id renvoie un produit existant", async () => {
  const res = await request(app).get("/products/1");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.id, 1);
});

test("GET /products/:id renvoie 404 pour un id inconnu", async () => {
  const res = await request(app).get("/products/9999");
  assert.strictEqual(res.status, 404);
});

test("GET /metrics expose des métriques au format Prometheus", async () => {
  // On génère d'abord un peu de trafic pour que des métriques existent.
  await request(app).get("/");
  const res = await request(app).get("/metrics");
  assert.strictEqual(res.status, 200);
  // Le compteur de requêtes doit apparaître dans la sortie exposée.
  assert.match(res.text, /http_requests_total/);
});
