const { createApp } = require("./app");

// Point d'entrée : c'est le seul endroit qui ouvre un port réseau.
// Le port est configurable par variable d'environnement (défaut 3000).
const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`demo-api à l'écoute sur le port ${PORT}`);
});
