const prisma = require('../config/db');

const getCharities = async (req, res) => {
  try {
    const { category, search } = req.query;

    const charities = await prisma.charity.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });

    res.json(charities);
  } catch (error) {
    console.error('Get charities error:', error);
    res.status(500).json({ detail: 'Failed to fetch charities' });
  }
};

const getCharityById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const charity = await prisma.charity.findUnique({
      where: { id },
    });

    if (!charity) {
      return res.status(404).json({ detail: 'Charity not found' });
    }

    res.json(charity);
  } catch (error) {
    console.error('Get charity error:', error);
    res.status(500).json({ detail: 'Failed to fetch charity' });
  }
};

module.exports = {
  getCharities,
  getCharityById,
};