function generateVin() {
  // Generate a random number between 1000000000000000 and 9999999999999999 (16 digits)
  return Math.floor(Math.random() * 1e16);
}

module.exports = { generateVin };
