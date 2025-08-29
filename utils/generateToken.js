const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateJWT = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const generateOTP = (length = 6) => {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
};

module.exports = { generateJWT, generateOTP };