require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const seed = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: 'Admin User',
          role: 'admin',
        },
      });

      console.log('✅ Admin user created');
    }

    const charityCount = await prisma.charity.count();

    if (charityCount === 0) {
      await prisma.charity.createMany({
        data: [
          {
            name: 'Save the Children',
            description: 'Helping children worldwide',
            category: 'Children',
            website: 'https://www.savethechildren.org',
          },
          {
            name: 'Red Cross',
            description: 'Humanitarian aid organization',
            category: 'Health',
            website: 'https://www.redcross.org',
          },
          {
            name: 'WWF',
            description: 'Wildlife conservation',
            category: 'Environment',
            website: 'https://www.worldwildlife.org',
          },
          {
            name: 'Doctors Without Borders',
            description: 'Medical humanitarian organization',
            category: 'Health',
            website: 'https://www.doctorswithoutborders.org',
          },
          {
            name: 'Water.org',
            description: 'Safe water and sanitation',
            category: 'Water',
            website: 'https://water.org',
          },
        ],
      });

      console.log('✅ Sample charities seeded');
    }
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();