const axios = require('axios');

const rawUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
// Force IPv4 loopback (127.0.0.1) instead of 'localhost' to prevent 1000ms+ IPv6 (::1) SYN timeouts when service is offline
const AI_SERVICE_URL = rawUrl.replace('://localhost', '://127.0.0.1');
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

if (!INTERNAL_SERVICE_KEY && process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL] INTERNAL_SERVICE_KEY is required in production.');
}

const aiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json'
    }
});

let isAiServiceAlive = true;
let lastFailureTimestamp = 0;
const PROBE_INTERVAL_MS = 20000; // 20s backoff when offline

function shouldAttemptAiCall() {
    if (isAiServiceAlive) return true;
    if (Date.now() - lastFailureTimestamp > PROBE_INTERVAL_MS) {
        return true; // allow probe
    }
    return false; // fast fail to heuristic fallback
}

function recordAiCallSuccess() {
    isAiServiceAlive = true;
}

function recordAiCallFailure(err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
        isAiServiceAlive = false;
        lastFailureTimestamp = Date.now();
    }
}

aiClient.interceptors.request.use((config) => {
    const key = process.env.INTERNAL_SERVICE_KEY || INTERNAL_SERVICE_KEY;
    if (key) {
        config.headers['X-Internal-Service-Key'] = key;
    }
    return config;
});

const predictPrice = async (tripData) => {
    const response = await aiClient.post('/predict-price', tripData);
    return response.data;
};

const predictTime = async (tripData) => {
    const response = await aiClient.post('/predict-time', tripData);
    return response.data;
};

const optimizeRoute = async (routeData) => {
    const response = await aiClient.post('/optimize-route', routeData);
    return response.data;
};

const DAY_NAME_MAP = {
    'monday': 1, 'mon': 1,
    'tuesday': 2, 'tue': 2,
    'wednesday': 3, 'wed': 3,
    'thursday': 4, 'thu': 4,
    'friday': 5, 'fri': 5,
    'saturday': 6, 'sat': 6,
    'sunday': 7, 'sun': 7
};

function normalizeDayOfWeek(dow) {
    if (typeof dow === 'number' && !isNaN(dow)) return Math.max(1, Math.min(7, Math.round(dow)));
    if (typeof dow === 'string') {
        const cleaned = dow.trim().toLowerCase();
        if (DAY_NAME_MAP[cleaned]) return DAY_NAME_MAP[cleaned];
        const num = parseInt(cleaned, 10);
        if (!isNaN(num)) return Math.max(1, Math.min(7, num));
    }
    return 1;
}

const predictDelay = async (delayData = {}) => {
    const payload = {
        train_number: String(delayData.train_number || delayData.trainNumber || delayData.train_no || '12000'),
        route: String(delayData.route || delayData.station_code || 'ALL'),
        day_of_week: normalizeDayOfWeek(delayData.day_of_week),
        month: typeof delayData.month === 'number' ? delayData.month : 1,
        season: typeof delayData.season === 'number' ? delayData.season : 1,
        weather: String(delayData.weather || 'Clear')
    };

    if (shouldAttemptAiCall()) {
        try {
            const response = await aiClient.post('/predict-delay', payload);
            recordAiCallSuccess();
            return response.data;
        } catch (err) {
            recordAiCallFailure(err);
            console.warn(`[aiService.predictDelay] AI microservice call failed (${err.message}). Using telemetry heuristic fallback.`);
        }
    }
    const trainNumInt = parseInt(payload.train_number) || 12000;
    const isRajdhaniOrShatabdi = [12001, 12002, 12004, 12301, 12302, 12423, 12424].includes(trainNumInt);
    const isSuperfast = trainNumInt >= 12000 && trainNumInt < 13000;
    
    const arrDelay = isRajdhaniOrShatabdi ? 6 : isSuperfast ? 14 : 28;
    const depDelay = isRajdhaniOrShatabdi ? 2 : isSuperfast ? 8 : 18;
    const prob = isRajdhaniOrShatabdi ? 16.5 : isSuperfast ? 32.0 : 48.0;

    return {
        expected_arrival_delay_mins: arrDelay,
        expected_departure_delay_mins: depDelay,
        delay_probability: prob,
        confidence: null,
        fallback: true
    };
};

const predictFare = async (fareData = {}) => {
    const payload = {
        source: String(fareData.source || fareData.source_code || fareData.from || 'NDLS').toUpperCase(),
        destination: String(fareData.destination || fareData.destination_code || fareData.dest || fareData.to || 'CNB').toUpperCase(),
        class_code: String(fareData.class_code || fareData.class_type || fareData.class || 'SL').toUpperCase(),
        month: typeof fareData.month === 'number' ? fareData.month : 1,
        season_code: typeof fareData.season_code === 'number' ? fareData.season_code : 2,
        demand_score: typeof fareData.demand_score === 'number' ? fareData.demand_score : 0.65,
        current_fare: parseFloat(fareData.current_fare) || 1200.0
    };

    if (shouldAttemptAiCall()) {
        try {
            const response = await aiClient.post('/predict-fare', payload);
            recordAiCallSuccess();
            return response.data;
        } catch (err) {
            recordAiCallFailure(err);
            console.warn(`[aiService.predictFare] AI microservice call failed (${err.message}). Using telemetry heuristic fallback.`);
        }
    }
    const currentFare = payload.current_fare;
    const forecasted = Math.round(currentFare * 1.08);
    return {
        current_fare: currentFare,
        forecasted_fare_7d: forecasted,
        recommendation: "Book Now",
        demand_level: "High",
        fallback: true
    };
};

const predictCrowd = async (crowdData = {}) => {
    const payload = {
        station_code: String(crowdData.station_code || crowdData.station || 'NDLS').toUpperCase(),
        day_of_week: normalizeDayOfWeek(crowdData.day_of_week),
        hour_of_day: typeof crowdData.hour_of_day === 'number' ? crowdData.hour_of_day : (parseInt(crowdData.hour_of_day, 10) || 12)
    };

    if (shouldAttemptAiCall()) {
        try {
            const response = await aiClient.post('/predict-crowd', payload);
            recordAiCallSuccess();
            return response.data;
        } catch (err) {
            recordAiCallFailure(err);
            console.warn(`[aiService.predictCrowd] AI microservice call failed (${err.message}). Using telemetry heuristic fallback.`);
        }
    }
    const hour = payload.hour_of_day;
    const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    return {
        crowd_level: isPeak ? "High" : "Moderate",
        expected_crowd_percent: isPeak ? 74.0 : 45.0,
        platform_congestion_percent: isPeak ? 68.0 : 38.0,
        peak_time_alert: isPeak,
        fallback: true
    };
};

const predictOccupancy = async (occupancyData = {}) => {
    const payload = {
        train_number: String(occupancyData.train_number || occupancyData.trainNumber || '12000'),
        class_code: String(occupancyData.class_code || occupancyData.class_type || 'SL').toUpperCase(),
        month: typeof occupancyData.month === 'number' ? occupancyData.month : 1,
        day_of_week: normalizeDayOfWeek(occupancyData.day_of_week),
        season_code: typeof occupancyData.season_code === 'number' ? occupancyData.season_code : 2
    };

    if (shouldAttemptAiCall()) {
        try {
            const response = await aiClient.post('/predict-occupancy', payload);
            recordAiCallSuccess();
            return response.data;
        } catch (err) {
            recordAiCallFailure(err);
            console.warn(`[aiService.predictOccupancy] AI microservice call failed (${err.message}). Using telemetry heuristic fallback.`);
        }
    }
    return {
        availability_probability: 72.0,
        expected_waiting_list: "Available",
        seat_demand: "Medium",
        coach_occupancy_percent: 68.5,
        predicted_occupancy: 68.5,
        waitlist_clearing_chance: 72.0,
        status: "RAC / High Confirmation Probability",
        fallback: true
    };
};

const recommendRoute = async (routeRecData) => {
    const response = await aiClient.post('/recommend-route', routeRecData);
    return response.data;
};

const recommendFood = async (foodRecData) => {
    const response = await aiClient.post('/recommend-food', foodRecData);
    return response.data;
};

const predictBehavior = async (behaviorData) => {
    const response = await aiClient.post('/predict-behavior', behaviorData);
    return response.data;
};

const retrainModels = async () => {
    const response = await aiClient.post('/retrain');
    return response.data;
};

const getModelMetrics = async () => {
    const response = await aiClient.get('/model-metrics');
    return response.data;
};

const uploadRAGDocument = async (filePath, filename, category) => {
    const response = await aiClient.post('/rag/upload', {
        file_path: filePath,
        filename: filename,
        category: category
    });
    return response.data;
};

const queryRAG = async (query, userId) => {
    const response = await aiClient.post('/rag/query', {
        query,
        user_id: userId
    });
    return response.data;
};

const parseVoiceCommand = async (text, language, userId) => {
    const response = await aiClient.post('/voice/respond', {
        text,
        language,
        user_id: userId
    });
    return response.data;
};

const queryCopilot = async (query, userId) => {
    const response = await aiClient.post('/copilot/query', {
        query,
        user_id: userId
    });
    return response.data;
};

const getMemoryProfile = async (userId) => {
    const response = await aiClient.post('/memory/profile', {
        user_id: userId
    });
    return response.data;
};

const updateMemoryProfile = async (profileData) => {
    const response = await aiClient.post('/memory/update', profileData);
    return response.data;
};

module.exports = {
    predictPrice,
    predictTime,
    optimizeRoute,
    predictDelay,
    predictFare,
    predictCrowd,
    predictOccupancy,
    recommendRoute,
    recommendFood,
    predictBehavior,
    retrainModels,
    getModelMetrics,
    uploadRAGDocument,
    queryRAG,
    parseVoiceCommand,
    queryCopilot,
    getMemoryProfile,
    updateMemoryProfile
};
