# demo-api

Micro-API Express de démonstration, support des TP de la formation **DevOps — Administrateurs Systèmes & Réseaux**.

Elle sert de fil rouge aux trois TP : intégration continue (GitHub Actions), conteneurisation (Docker), puis monitoring (Prometheus / Grafana).

## Routes

| Méthode | Route            | Réponse                        | Rôle pédagogique                     |
|---------|------------------|--------------------------------|--------------------------------------|
| GET     | `/`              | 200 · JSON de statut           | Baseline, réponse immédiate          |
| GET     | `/health`        | 200 · `{ status: "healthy" }`  | Sonde Docker + cible Prometheus      |
| GET     | `/products`      | 200 · liste (délai 30–80 ms)   | Latence légère visible               |
| GET     | `/products/:id`  | 200 si trouvé, sinon 404       | Taux d'erreur **client**             |
| GET     | `/slow`          | 200 · délai 300–500 ms         | Pic de latence net                   |
| GET     | `/error`         | 500                            | Taux d'erreur **serveur**            |
| GET     | `/metrics`       | 200 · format Prometheus        | Cible de scrape (TP 3)               |

## Lancer en local (hors Docker)

```bash
npm install
npm start          # http://localhost:3000
npm test           # lance les tests
```

## Structure

```
demo-api/
├── src/
│   ├── app.js        # application Express (les 6 routes), sans listen() -> testable
│   ├── server.js     # point d'entrée : ouvre le port
│   ├── products.js   # jeu de données en dur
│   └── utils.js      # helpers (délai, aléatoire)
├── test/
│   └── app.test.js   # tests des routes (node:test + supertest)
├── Dockerfile        # image multi-stage + HEALTHCHECK (TP 2)
├── docker-compose.yml            # TP 2 : l'API seule
├── docker-compose.monitoring.yml # TP 3 : API + Prometheus + Grafana
├── ci.yml.fourni     # workflow à placer dans .github/workflows/ (TP 1)
├── monitoring/
│   ├── prometheus.yml            # config de scrape Prometheus
│   ├── generate-traffic.sh       # génère du trafic pour animer les courbes
│   └── grafana/                  # datasource + dashboard pré-provisionnés
└── package.json
```

> `app.js` est séparé de `server.js` pour permettre de tester l'application sans ouvrir de port réseau.
