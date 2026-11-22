const express = require('express');
const router = express.Router();
const { requireApiKey } = require('../middleware/apiKeyMiddleware');
const aiService = require('../services/aiService');
const { Station, Train } = require('../models');

// All endpoints in this router are secured with X-API-Key and metered for billing
router.use(requireApiKey);

/**
 * Health check & Key Validation
 * GET /api/v1/public/ping
 */
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AEVORA API Key authenticated successfully',
    organization: req.organization.name,
    plan_tier: req.organization.plan_tier,
    quota_limit: req.organization.monthly_quota,
    quota_remaining: Math.max(0, req.organization.monthly_quota - req.organization.used_quota),
    timestamp: new Date().toISOString()
  });
});

/**
 * Delay Prediction API
 * POST /api/v1/public/predict-delay
 */
router.post('/predict-delay', async (req, res) => {
  try {
    const trainNumber = req.body.train_number || req.body.trainNumber;
    const stationCode = req.body.station_code || req.body.stationCode;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDayOfWeek = (now.getDay() % 7) + 1;
    const currentSeason = [12, 1, 2].includes(currentMonth) ? 1 : [3, 4, 5].includes(currentMonth) ? 2 : [6, 7, 8, 9].includes(currentMonth) ? 3 : 4;

    if (!trainNumber) {
      return res.status(400).json({ success: false, error: 'Missing required field: train_number' });
    }

    // Verify train number exists in official train directory
    const trainRecord = await Train.findOne({ where: { train_number: String(trainNumber).trim() } });
    if (!trainRecord) {
      return res.status(400).json({ success: false, error: `Train #${trainNumber} not found in official directory.` });
    }

    // Verify station code if provided
    if (stationCode) {
      const stationRecord = await Station.findOne({ where: { station_code: String(stationCode).trim().toUpperCase() } });
      if (!stationRecord) {
        return res.status(400).json({ success: false, error: `Station '${stationCode}' not found in official station directory.` });
      }
    }

    const route = req.body.route || (stationCode ? `${stationCode}-NEXT` : 'ALL');
    const weather = req.body.weather || 'Clear';
    const dayOfWeek = parseInt(req.body.day_of_week || req.body.dayOfWeek) || currentDayOfWeek;
    const month = parseInt(req.body.month) || currentMonth;
    const season = parseInt(req.body.season) || currentSeason;

    const payload = {
      train_number: String(trainNumber),
      route,
      weather,
      day_of_week: dayOfWeek,
      month,
      season
    };

    const prediction = await aiService.predictDelay(payload);
    if (prediction && prediction.fallback) {
      return res.status(503).json({
        success: false,
        error: 'AI prediction service temporarily unavailable. Circuit breaker open or service degraded.',
        code: 'AI_SERVICE_UNAVAILABLE'
      });
    }

    return res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    console.error('[Public API: predictDelay Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to process delay prediction' });
  }
});

/**
 * Fare Forecast API
 * POST /api/v1/public/predict-fare
 */
router.post('/predict-fare', async (req, res) => {
  try {
    const source = req.body.source || req.body.origin;
    const destination = req.body.destination || req.body.dest;
    const travelClass = req.body.travel_class || req.body.travelClass || req.body.class_code || 'SL';
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentSeason = [12, 1, 2].includes(currentMonth) ? 1 : [3, 4, 5].includes(currentMonth) ? 2 : [6, 7, 8, 9].includes(currentMonth) ? 3 : 4;

    if (!source || !destination) {
      return res.status(400).json({ success: false, error: 'Missing required fields: source, destination' });
    }

    const srcCode = String(source).trim().toUpperCase();
    const dstCode = String(destination).trim().toUpperCase();

    // Verify stations exist in official directory
    const [srcStn, dstStn] = await Promise.all([
      Station.findOne({ where: { station_code: srcCode } }),
      Station.findOne({ where: { station_code: dstCode } })
    ]);

    if (!srcStn) {
      return res.status(400).json({ success: false, error: `Source station '${source}' not found in official station directory.` });
    }
    if (!dstStn) {
      return res.status(400).json({ success: false, error: `Destination station '${destination}' not found in official station directory.` });
    }

    const payload = {
      source: srcCode,
      destination: dstCode,
      class_code: travelClass,
      month: parseInt(req.body.month) || currentMonth,
      season_code: parseInt(req.body.season_code || req.body.seasonCode) || currentSeason,
      demand_score: parseFloat(req.body.demand_score || req.body.demandScore) || 0.65,
      current_fare: parseFloat(req.body.current_fare || req.body.currentFare || req.body.fare) || 1200.0
    };

    const forecast = await aiService.predictFare(payload);
    if (forecast && forecast.fallback) {
      return res.status(503).json({
        success: false,
        error: 'AI prediction service temporarily unavailable. Circuit breaker open or service degraded.',
        code: 'AI_SERVICE_UNAVAILABLE'
      });
    }

    return res.status(200).json({
      success: true,
      data: forecast
    });
  } catch (err) {
    console.error('[Public API: predictFare Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to process fare forecast' });
  }
});

/**
 * Crowd & Occupancy Prediction API
 * POST /api/v1/public/predict-crowd
 */
router.post('/predict-crowd', async (req, res) => {
  try {
    const stationCode = req.body.station_code || req.body.stationCode;
    const trainNumber = req.body.train_number || req.body.trainNumber;
    const now = new Date();
    const currentDayOfWeek = (now.getDay() % 7) + 1;
    const currentHour = now.getHours();

    if (!stationCode && !trainNumber) {
      return res.status(400).json({ success: false, error: 'Must provide either station_code or train_number' });
    }

    if (stationCode) {
      const stn = await Station.findOne({ where: { station_code: String(stationCode).trim().toUpperCase() } });
      if (!stn) {
        return res.status(400).json({ success: false, error: `Station '${stationCode}' not found in official station directory.` });
      }
    }

    if (trainNumber) {
      const tr = await Train.findOne({ where: { train_number: String(trainNumber).trim() } });
      if (!tr) {
        return res.status(400).json({ success: false, error: `Train #${trainNumber} not found in official directory.` });
      }
    }

    const payload = {
      station_code: String(stationCode || 'NDLS').toUpperCase(),
      day_of_week: parseInt(req.body.day_of_week || req.body.dayOfWeek) || currentDayOfWeek,
      hour_of_day: parseInt(req.body.hour_of_day || req.body.hourOfDay || req.body.time_slot || req.body.timeSlot) || currentHour
    };

    const prediction = await aiService.predictCrowd(payload);
    if (prediction && prediction.fallback) {
      return res.status(503).json({
        success: false,
        error: 'AI prediction service temporarily unavailable. Circuit breaker open or service degraded.',
        code: 'AI_SERVICE_UNAVAILABLE'
      });
    }

    return res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    console.error('[Public API: predictCrowd Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to process crowd prediction' });
  }
});

/**
 * Route Optimization API (Developer Portal Endpoint)
 * POST /api/v1/public/optimize-route
 */
router.post('/optimize-route', async (req, res) => {
  try {
    const source = req.body.source;
    const destination = req.body.destination;
    const preference = req.body.preference || req.body.preferences || 'time';

    if (!source || !destination) {
      return res.status(400).json({ success: false, error: 'Missing source or destination' });
    }

    const payload = { source, destination, preference };
    const result = await aiService.optimizeRoute(payload);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('[Public API: optimizeRoute Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to process route optimization' });
  }
});

/**
 * Intelligent Route Recommendation API (NCF Recommender)
 * POST /api/v1/public/recommend-route
 */
router.post('/recommend-route', async (req, res) => {
  try {
    const { source, destination, preferences } = req.body;
    if (!source || !destination) {
      return res.status(400).json({ success: false, error: 'Missing source or destination' });
    }

    const recommendation = await aiService.recommendRoute(req.body);
    return res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (err) {
    console.error('[Public API: recommendRoute Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to process route recommendation' });
  }
});

/**
 * Food & Culinary Recommendation API
 * POST /api/v1/public/recommend-food
 */
router.post('/recommend-food', async (req, res) => {
  try {
    const destination = req.body.destination;
    const dietaryPref = req.body.dietary_pref || req.body.dietaryPref;
    const budget = req.body.budget;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'Missing destination' });
    }

    const foodRecs = await aiService.recommendFood({
      destination,
      dietary_pref: dietaryPref,
      budget
    });
    return res.status(200).json({
      success: true,
      data: foodRecs
    });
  } catch (err) {
    console.error('[Public API: recommendFood Error]:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to process food recommendations' });
  }
});

module.exports = router;
