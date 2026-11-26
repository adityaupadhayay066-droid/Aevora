const { sequelize } = require('./models');
const { seedStations } = require('./seeders/stationSeeder');
const { seedTrains } = require('./seeders/trainSeeder');
const { seedFares } = require('./seeders/seed_fares');
const { seedFoodRecommendations } = require('./seeders/foodSeeder');
const { seedChatbotKnowledge } = require('./seeders/chatbotSeeder');
const { loadHotelData } = require('./services/hotelService');

sequelize.sync({ alter: false }).then(async () => {
    console.log('Database synced. Creating views & running seeders...');
    try {
        await sequelize.query(`
            CREATE OR REPLACE VIEW train_stops AS
            SELECT id, train_number AS train_no, train_number, station_code, arrival_time, departure_time, day_count, stop_sequence
            FROM train_schedules
        `);
    } catch (_) {}
    await seedStations();
    await seedTrains();
    await seedFares();
    await seedFoodRecommendations();
    await seedChatbotKnowledge();
    await loadHotelData();
    console.log('✅ Seeding complete.');
    process.exit(0);
}).catch((err) => {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
});
