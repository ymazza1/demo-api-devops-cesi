// Renvoie une promesse résolue après `ms` millisecondes.
// Sert à simuler de la latence sur certaines routes pour rendre le monitoring lisible.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Renvoie un entier aléatoire dans l'intervalle [min, max].
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { delay, randomBetween };
