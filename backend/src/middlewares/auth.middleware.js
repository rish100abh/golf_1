const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const authenticateToken = async (req, res, next) => {
  let token = req.cookies.access_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.type !== 'access') {
      return res.status(401).json({ detail: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        charityId: true,
        charityPercentage: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return res.status(401).json({ detail: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ detail: 'Invalid token' });
  }
};

module.exports = { authenticateToken };