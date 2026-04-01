const prisma = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        charityId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ detail: 'Failed to fetch users' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: 'user' },
    });

    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' },
    });

    const revenueAgg = await prisma.subscription.aggregate({
      where: { status: 'active' },
      _sum: { amount: true },
    });

    const recentDraws = await prisma.draw.count({
      where: {
        drawDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({
      total_users: totalUsers,
      active_subscriptions: activeSubscriptions,
      total_revenue: Number(revenueAgg._sum.amount || 0),
      recent_draws: recentDraws,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ detail: 'Failed to fetch analytics' });
  }
};

const createCharity = async (req, res) => {
  try {
    const { name, description, category, website, logo_url } = req.body;

    const charity = await prisma.charity.create({
      data: {
        name,
        description,
        category,
        website,
        logoUrl: logo_url || null,
      },
    });

    res.json(charity);
  } catch (error) {
    console.error('Create charity error:', error);
    res.status(500).json({ detail: 'Failed to create charity' });
  }
};

const getDraws = async (req, res) => {
  try {
    const draws = await prisma.draw.findMany({
      orderBy: { drawDate: 'desc' },
      take: 50,
    });

    res.json(draws);
  } catch (error) {
    console.error('Get draws error:', error);
    res.status(500).json({ detail: 'Failed to fetch draws' });
  }
};

const verifyWinner = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { verified, proof_url } = req.body;

    await prisma.drawResult.update({
      where: { id },
      data: {
        verified: Boolean(verified),
        proofUrl: proof_url || null,
      },
    });

    res.json({ message: 'Winner verification updated' });
  } catch (error) {
    console.error('Verify winner error:', error);
    res.status(500).json({ detail: 'Failed to verify winner' });
  }
};

module.exports = {
  getUsers,
  getAnalytics,
  createCharity,
  getDraws,
  verifyWinner,
};