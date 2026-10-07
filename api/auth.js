const sendOtp = require('./auth/send-otp.js');
const verifyOtp = require('./auth/verify-otp.js');
const login = require('./auth/login.js');

module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname.includes('send-otp')) {
    return sendOtp(req, res);
  }
  if (pathname.includes('verify-otp')) {
    return verifyOtp(req, res);
  }
  if (pathname.includes('login')) {
    return login(req, res);
  }

  // Fallback to sendOtp
  return sendOtp(req, res);
};
