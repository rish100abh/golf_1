const jwt = require('jsonwebtoken');

const createAccessToken = (userId, email) => {
  return jwt.sign(
    { sub: userId, email, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const createRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
};