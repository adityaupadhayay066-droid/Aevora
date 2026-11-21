'use strict';

const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Helper to determine if real SMTP credentials are provided
 */
function isSmtpConfigured() {
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
    const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').trim();

    if (!user || !pass) return false;
    // Check for dummy or placeholder values
    if (user === '@gmail.com' || user.startsWith('@') || !user.includes('@')) return false;
    if (user === 'test@example.com' || user === 'your_email@gmail.com') return false;
    if (pass === '123165489' || pass === 'password' || pass === 'your_password' || pass.startsWith('your_')) return false;

    return true;
}

let transporterInstance = null;

function getTransporter() {
    if (!transporterInstance && isSmtpConfigured()) {
        const port = parseInt(process.env.SMTP_PORT, 10) || 587;
        transporterInstance = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port,
            secure: port === 465,
            auth: {
                user: (process.env.SMTP_USER || process.env.EMAIL_USER).trim(),
                pass: (process.env.SMTP_PASS || process.env.EMAIL_PASS).trim(),
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 10000,
        });
    }
    return transporterInstance;
}

/**
 * Send mail with exponential backoff retry for transient network errors.
 */
async function sendMailWithRetry(transporter, mailOptions, maxRetries = 2) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await transporter.sendMail(mailOptions);
        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

/**
 * Send email safely with environment-aware dispatch and redaction.
 */
async function sendEmail({ to, subject, html, text, otpCode, purpose = 'notification' }) {
    if (!to || typeof to !== 'string') {
        return { success: false, error: 'Recipient email address is required.' };
    }

    const fromAddress = process.env.SMTP_FROM || 
        (process.env.SMTP_USER ? `"AEVORA Support" <${process.env.SMTP_USER.trim()}>` : '"AEVORA Notifications" <noreply@aevora.travel>');

    // 1. If SMTP is not configured
    if (!isSmtpConfigured()) {
        if (isProduction) {
            logger.error({ to, purpose }, '[Email Service] Outbound email dispatch failed: SMTP is not configured in production.');
            return { success: false, error: 'SMTP delivery service is not configured on this server.' };
        }

        // Development/Test fallback simulation
        if (otpCode) {
            console.log('\n┌────────────────────────────────────────────────────────┐');
            console.log(`│ 🔒 [AEVORA DEV OTP] ${purpose.toUpperCase()}`);
            console.log(`│ To: ${to}`);
            console.log(`│ 🔑 Verification Code: ${otpCode}`);
            console.log(`│ (SMTP not configured. Real email simulated)            `);
            console.log('└────────────────────────────────────────────────────────┘\n');
        } else {
            console.log(`ℹ️ [Email Simulation] '${subject}' skipped for ${to} (SMTP not configured in local environment)`);
        }
        return { success: true, simulated: true };
    }

    // 2. Real SMTP delivery with retries
    try {
        const transporter = getTransporter();
        const mailOptions = {
            from: fromAddress,
            to,
            subject,
            ...(html ? { html } : {}),
            ...(text ? { text } : {})
        };

        const info = await sendMailWithRetry(transporter, mailOptions, 2);
        logger.info({ to: to.replace(/(.{2})(.*)(?=@)/, '$1***'), subject, messageId: info?.messageId }, '[Email Service] Outbound email delivered successfully');
        return { success: true, info, messageId: info?.messageId };
    } catch (err) {
        logger.warn({ to: to.replace(/(.{2})(.*)(?=@)/, '$1***'), subject, error: err.message }, '[Email Service] SMTP transmission error');

        // Only log fallback in non-production environments to prevent developer lockout during testing
        if (!isProduction && otpCode) {
            console.log('\n┌────────────────────────────────────────────────────────┐');
            console.log(`│ ⚠️ [FALLBACK DEV OTP] Email delivery failed`);
            console.log(`│ To: ${to}`);
            console.log(`│ 🔑 Verification Code: ${otpCode}`);
            console.log('└────────────────────────────────────────────────────────┘\n');
        }

        return { success: false, error: err.message };
    }
}

/**
 * Send booking confirmation email and simulated SMS notification
 */
async function sendBookingConfirmation({ user, booking }) {
    if (!user || !user.email) return;

    const bookingRef = booking.booking_reference || `TIQ-BR-${booking.id}`;
    const passengerNames = Array.isArray(booking.passengers)
        ? booking.passengers.map(p => typeof p === 'string' ? p : p.name).filter(Boolean).join(', ')
        : 'Confirmed Passenger';

    const subject = `🎫 Booking Confirmed: Service #${booking.train_number || '12301'} (Booking Ref: ${bookingRef})`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="background: #101B2D; padding: 28px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">AEVORA E-Ticket Confirmation</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #20C5D9;">Your reservation has been confirmed and verified!</p>
        </div>
        <div style="padding: 24px;">
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                    <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">AEVORA Booking Ref:</span>
                    <strong style="font-size: 15px; color: #101B2D; font-family: monospace;">${bookingRef}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #64748b;">Service Number:</span>
                    <strong style="font-size: 13px; color: #0f172a;">#${booking.train_number || '12301'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #64748b;">Route:</span>
                    <strong style="font-size: 13px; color: #0f172a;">${booking.source_station_code} ➔ ${booking.destination_station_code}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #64748b;">Class:</span>
                    <strong style="font-size: 13px; color: #0f172a;">${booking.travel_class || 'SL'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: #64748b;">Travelers:</span>
                    <strong style="font-size: 13px; color: #0f172a;">${passengerNames || user.name} (${booking.total_passengers || 1})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 8px;">
                    <span style="font-size: 13px; color: #101B2D; font-weight: bold;">Total Amount Paid:</span>
                    <strong style="font-size: 16px; color: #15803d;">₹${(booking.ticket_fare || 0).toLocaleString()}</strong>
                </div>
            </div>
            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
                💡 <strong>Important Note:</strong> Please carry an original government photo ID (Aadhaar / Voter ID / Passport) during the journey.
            </p>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
            AEVORA AI Smart Travel Assistant • Automated Notification Dispatch
        </div>
    </div>
    `;

    await sendEmail({
        to: user.email,
        subject,
        html,
        purpose: 'booking_confirmation'
    });

    // Simulated SMS Notification in dev
    if (!isProduction) {
        console.log('\n┌────────────────────────────────────────────────────────┐');
        console.log(`│ 📱 [AEVORA SMS SIMULATOR] Booking SMS Dispatched      `);
        console.log(`│ To: ${user.phone || 'N/A'} (${user.name || 'Traveler'})`);
        console.log(`│ Booking Ref: ${bookingRef} | Train: #${booking.train_number || '12301'}`);
        console.log(`│ Route: ${booking.source_station_code} ➔ ${booking.destination_station_code}`);
        console.log(`│ Class: ${booking.travel_class || 'SL'} | Fare: ₹${booking.ticket_fare}`);
        console.log(`│ Status: CONFIRMED ✅                                   `);
        console.log('└────────────────────────────────────────────────────────┘\n');
    }
}

/**
 * Send password reset email with secure token link
 */
async function sendPasswordResetEmail({ user, resetToken }) {
    if (!user || !user.email) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;

    const subject = '🔒 AEVORA: Password Reset Request';
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a;">Password Reset Request</h2>
        <p>Hello ${user.name || 'Traveler'},</p>
        <p>We received a request to reset your password for your AEVORA account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">This link will expire in 15 minutes. If you did not make this request, you can safely ignore this email.</p>
    </div>
    `;

    return sendEmail({
        to: user.email,
        subject,
        html,
        purpose: 'password_reset'
    });
}

/**
 * Send payment receipt email
 */
async function sendPaymentNotification({ user, booking, transaction }) {
    if (!user || !user.email) return;

    const subject = `💳 AEVORA Payment Receipt: ₹${transaction.amount || booking.ticket_fare}`;
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a;">Payment Confirmation</h2>
        <p>Dear ${user.name || 'Traveler'},</p>
        <p>Your payment of <strong>₹${transaction.amount || booking.ticket_fare}</strong> has been successfully processed.</p>
        <p><strong>Transaction ID:</strong> ${transaction.transaction_id || transaction.id}</p>
        <p><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
    </div>
    `;

    return sendEmail({
        to: user.email,
        subject,
        html,
        purpose: 'payment_receipt'
    });
}

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendPasswordResetEmail,
    sendPaymentNotification,
    isSmtpConfigured,
    getTransporter
};
