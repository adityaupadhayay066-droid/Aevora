'use strict';

const pino = require('pino');
const pinoHttp = require('pino-http');
const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// ─── Automated Redaction Paths for Sensitive Information ───
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-traveliq-secret"]',
  'req.headers["x-aevora-secret"]',
  'req.headers["x-internal-service-key"]',
  'req.headers["x-api-key"]',
  'req.body.password',
  'req.body.oldPassword',
  'req.body.newPassword',
  'req.body.confirmPassword',
  'req.body.otp',
  'req.body.otpCode',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.secret',
  'req.body.apiKey',
  'req.body.razorpay_signature',
  'req.body.card_number',
  'req.body.cvv',
  'req.body.gov_id_number',
  'req.body.govIdNumber',
  'password',
  'otp',
  'otpCode',
  'token',
  'refreshToken',
  'secret',
  'apiKey',
  'internalServiceKey',
  'razorpaySignature',
  '*.password',
  '*.otp',
  '*.token',
  '*.secret'
];

const logger = pino({
  level: logLevel,
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]'
  },
  base: {
    service: 'aevora-backend',
    env: process.env.NODE_ENV || 'development'
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  }
});

/**
 * Express middleware for request correlation and structured HTTP logging.
 */
const httpLogger = pinoHttp({
  logger,
  genReqId: function (req, res) {
    const existingId = req.id || req.headers['x-request-id'] || req.headers['x-correlation-id'];
    if (existingId) return existingId;
    const generated = `req-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    res.setHeader('X-Request-Id', generated);
    return generated;
  },
  autoLogging: {
    ignore: (req) => {
      // Avoid spamming health check logs
      return req.url === '/health' || req.url === '/favicon.ico';
    }
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: function (req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: function (req, res, err) {
    return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
  }
});

/**
 * Structured Security & Audit Event Helpers
 */
function logSecurityEvent(eventType, { ip, userId, details, severity = 'warn' }) {
  const payload = {
    category: 'SECURITY',
    eventType,
    ip: ip || 'unknown',
    userId: userId || null,
    details: details || {},
    timestamp: new Date().toISOString()
  };
  if (severity === 'error' || severity === 'critical') {
    logger.error(payload, `[SECURITY_ALERT] ${eventType}`);
  } else {
    logger.warn(payload, `[SECURITY_EVENT] ${eventType}`);
  }
}

function logAuthEvent(eventType, { userId, email, ip, success, reason }) {
  const payload = {
    category: 'AUTHENTICATION',
    eventType,
    userId: userId || null,
    email: email ? email.replace(/(.{2})(.*)(?=@)/, '$1***') : null,
    ip: ip || 'unknown',
    success: !!success,
    reason: reason || null,
    timestamp: new Date().toISOString()
  };
  if (success) {
    logger.info(payload, `[AUTH_SUCCESS] ${eventType}`);
  } else {
    logger.warn(payload, `[AUTH_FAILURE] ${eventType}`);
  }
}

function logPaymentEvent(eventType, { bookingId, amount, gateway, success, status, orderId }) {
  const payload = {
    category: 'PAYMENT',
    eventType,
    bookingId: bookingId || null,
    orderId: orderId || null,
    amount: typeof amount === 'number' ? amount : null,
    gateway: gateway || 'Razorpay',
    success: !!success,
    status: status || null,
    timestamp: new Date().toISOString()
  };
  if (success) {
    logger.info(payload, `[PAYMENT_SUCCESS] ${eventType}`);
  } else {
    logger.warn(payload, `[PAYMENT_FAILURE] ${eventType}`);
  }
}

function logBookingEvent(eventType, { bookingId, userId, trainNumber, status }) {
  logger.info({
    category: 'BOOKING',
    eventType,
    bookingId: bookingId || null,
    userId: userId || null,
    trainNumber: trainNumber || null,
    status: status || null,
    timestamp: new Date().toISOString()
  }, `[BOOKING_EVENT] ${eventType}`);
}

module.exports = {
  logger,
  httpLogger,
  logSecurityEvent,
  logAuthEvent,
  logPaymentEvent,
  logBookingEvent
};
