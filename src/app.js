const express = require("express");
const { products } = require("./products");
const { delay, randomBetween } = require("./utils");
const { createMetrics } = require("./metrics");

// On construit et on exporte l'application SANS appeler listen().
// Cela permet de la tester (supertest) sans ouvrir de port réseau.
// Le démarrage réel du serveur est isolé dans server.js.
function createApp() {
  const app = express();
  const metrics = createMetrics();

  // Middleware de mesure : démarre un chrono à l'entrée, et à la fin de la
  // réponse enregistre la durée et incrémente le compteur de requêtes.
  // On labellise par route (req.route.path, ex. "/products/:id") et non par
  // URL réelle, pour éviter l'explosion du nombre de séries temporelles.
  app.use((req, res, next) => {
    const stopTimer = metrics.httpRequestDuration.startTimer();
    res.on("finish", () => {
      const route = req.route ? req.route.path : req.path;
      const labels = {
        method: req.method,
        route,
        status_code: res.statusCode,
      };
      stopTimer(labels);
      metrics.httpRequestsTotal.inc(labels);
    });
    next();
  });

  // GET /  -> baseline : réponse immédiate.
  app.get("/", (req, res) => {
    // --- Ligne correcte (état nominal) : le test GET / attend status === "ok".
    res.json({ status: "ok", service: "demo-api", version: "1.0.0" });

    // --- [TP1] RÉGRESSION VOLONTAIRE ---
    // Pour l'étape "casser le test" du TP GitHub Actions : commenter la ligne
    // ci-dessus et décommenter celle-ci, puis pousser. Le test GET / échouera
    // (status "ko" au lieu de "ok") et le workflow passera au rouge.
    // res.json({ status: "ko", service: "demo-api", version: "1.0.0" });
  });

  // GET /metrics -> expose les métriques au format Prometheus (cible de scrape).
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", metrics.register.contentType);
    res.end(await metrics.register.metrics());
  });

  // GET /health -> sonde de vivacité (Docker HEALTHCHECK + cible Prometheus).
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  // GET /products -> latence légère (30-80 ms) pour une courbe non plate.
  app.get("/products", async (req, res) => {
    await delay(randomBetween(30, 80));
    res.json(products);
  });

  // GET /products/:id -> 200 si l'id existe, 404 sinon (taux d'erreur client).
  app.get("/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ error: "Product not found", id });
    }
    res.json(product);
  });

  // GET /slow -> délai volontaire (300-500 ms) : pic de latence net à l'oeil.
  app.get("/slow", async (req, res) => {
    await delay(randomBetween(300, 500));
    res.json({ status: "ok", note: "slow response" });
  });

  // GET /error -> 500 volontaire (taux d'erreur serveur, à distinguer du 404).
  app.get("/error", (req, res) => {
    res.status(500).json({ error: "Internal Server Error (simulé)" });
  });

  return app;
}

module.exports = { createApp };
