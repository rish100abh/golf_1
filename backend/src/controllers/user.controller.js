const prisma = require('../config/db');

const getScores = async (req, res) => {
  try {
    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { datePlayed: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 5,
    });

    res.json(scores);
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ detail: 'Failed to fetch scores' });
  }
};

const addScore = async (req, res) => {
  try {
    const { value, date_played } = req.body;

    if (!value || !date_played) {
      return res.status(400).json({ detail: 'Score value and date are required' });
    }

    if (value < 1 || value > 45) {
      return res.status(400).json({ detail: 'Score must be between 1 and 45' });
    }

    await prisma.score.create({
      data: {
        userId: req.user.id,
        value: Number(value),
        datePlayed: new Date(date_played),
      },
    });

    const scores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { datePlayed: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    if (scores.length > 5) {
      const idsToDelete = scores.slice(5).map((item) => item.id);
      await prisma.score.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });
    }

    const updatedScores = await prisma.score.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { datePlayed: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 5,
    });

    res.json(updatedScores);
  } catch (error) {
    console.error('Add score error:', error);
    res.status(500).json({ detail: 'Failed to add score' });
  }
};

const deleteScore = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const score = await prisma.score.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!score) {
      return res.status(404).json({ detail: 'Score not found' });
    }

    await prisma.score.delete({
      where: { id },
    });

    res.json({ message: 'Score deleted' });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ detail: 'Failed to delete score' });
  }
};

const updateCharity = async (req, res) => {
  try {
    const { charity_id, charity_percentage } = req.body;

    if (!charity_id) {
      return res.status(400).json({ detail: 'Charity ID is required' });
    }

    const percentage = charity_percentage || 10;

    if (percentage < 10 || percentage > 100) {
      return res.status(400).json({ detail: 'Percentage must be between 10 and 100' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        charityId: Number(charity_id),
        charityPercentage: Number(percentage),
      },
    });

    res.json({ message: 'Charity selection updated' });
  } catch (error) {
    console.error('Update charity error:', error);
    res.status(500).json({ detail: 'Failed to update charity' });
  }
};

const getSubscription = async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(subscription || null);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ detail: 'Failed to fetch subscription' });
  }
};

const getWinnings = async (req, res) => {
  try {
    const winnings = await prisma.drawResult.findMany({
      where: { userId: req.user.id },
      include: {
        draw: {
          select: {
            drawDate: true,
            winningNumbers: true,
          },
        },
      },
      orderBy: {
        draw: {
          drawDate: 'desc',
        },
      },
    });

    res.json(winnings);
  } catch (error) {
    console.error('Get winnings error:', error);
    res.status(500).json({ detail: 'Failed to fetch winnings' });
  }
};

module.exports = {
  getScores,
  addScore,
  deleteScore,
  updateCharity,
  getSubscription,
  getWinnings,
};