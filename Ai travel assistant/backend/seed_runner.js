const { sequelize } = require('./models');
const { seedStations } = require('./seeders/stationSeeder');
const { seedTrains } = require('./seeders/trainSeeder');

sequelize.sync({ alter: false }).then(async () => {
    console.log('Database synced. Seeding stations & trains...');
    await seedStations();
    await seedTrains();
    console.log('✅ Seeding complete.');
    process.exit(0);
}).catch((err) => {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
});
