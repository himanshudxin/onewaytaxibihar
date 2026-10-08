/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Standalone Production Vercel Serverless Function — Auth API
 * Delegated to Master Production REST Handler for Strict Rate Limiting,
 * Zero OTP Response Leakage, Single-Source Fast2SMS Telegram/SMS Dispatch, and Cryptographic Sessions.
 */

const indexHandler = require('./index.js');

module.exports = async (req, res) => {
  return indexHandler(req, res);
};
