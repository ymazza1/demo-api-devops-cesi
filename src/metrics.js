const client = require("prom-client");

// On isole toute la logique de métriques ici pour ne pas polluer app.js
// et pouvoir la tester indépendamment.

// Un registre dédié plutôt que le registre global : cela évite les fuites
// d'état entre les tests et rend le module autoportant.
function createMetrics() {
  const register = new client.Registry();

  // Métriques système par défaut (CPU, mémoire, event loop...).
  client.collectDefaultMetrics({ register });

  // Compteur de requêtes HTTP, ventilé par méthode, route et code de statut.
  // C'est lui qui alimentera le taux d'erreur (4xx/5xx) dans Grafana.
  const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Nombre total de requêtes HTTP",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
  });

  // Histogramme de la durée des requêtes, pour observer la latence.
  const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Durée des requêtes HTTP en secondes",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
    registers: [register],
  });

  return { register, httpRequestsTotal, httpRequestDuration };
}

module.exports = { createMetrics };
