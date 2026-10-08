/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Standalone Production Vercel Serverless Function — Bookings API
 * Delegated to Master Production REST Handler for Strict Server-Side Validation,
 * Anti-Tamper Fare Lock, MongoDB Atlas Connection Pooling, and Role-Based Access Control.
 */

const indexHandler = require('./index.js');

module.exports = async (req, res) => {
  return indexHandler(req, res);
};
