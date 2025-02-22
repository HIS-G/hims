async function generateVin(vin_type) {
  // Generate a random number between 1000000000000000 and 9999999999999999 (16 digits)
  const vin_no = Math.floor(Math.random() * 1e16);
  return `${vin_type}-${vin_no}`;
}

module.exports = { generateVin };
