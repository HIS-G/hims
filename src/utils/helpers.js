const { vin_types } = require("../models/vins");

async function generateVin(type) {
  // Generate a random number between 1000000000000000 and 9999999999999999 (16 digits)
  if(type !== vin_types[6]){
    const vin_no = Math.floor(Math.random() * 1e16);
    return `${type}-${vin_no}`;
  } else if(type == vin_types[7]) {
    const sid_no = Math.floor(1000 + Math.random() * 9000).toString();
    return `${type}-${sid_no}`;
  } else if(type == vin_types[6]) {
    const min_no = Math.floor(1000 + Math.random() * 9000).toString();
    return `${type}-${min_no}`;
  }
}

async function generateVerificationToken() {
  const code = await Math.random().toString().substring(2, 8);
  return code;    
}

module.exports = { generateVin, generateVerificationToken };
