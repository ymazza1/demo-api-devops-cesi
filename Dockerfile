# ---- Étape 1 : dépendances ----
# On installe uniquement les dépendances de production dans une étape séparée,
# pour tirer parti du cache de couches Docker : tant que package*.json ne change
# pas, cette étape coûteuse n'est pas rejouée.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Étape 2 : image finale ----
# Image légère : on part d'Alpine et on ne copie que ce qui est nécessaire à
# l'exécution (les node_modules de prod + le code source).
FROM node:20-alpine AS runtime
WORKDIR /app

# Sécurité : on exécute l'application avec l'utilisateur non-root "node"
# fourni par l'image officielle, plutôt qu'en root.
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

USER node

EXPOSE 3000

# HEALTHCHECK : Docker interroge /health périodiquement. Le conteneur est marqué
# "healthy" / "unhealthy" selon le code retour. wget est présent dans Alpine.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
