import dotenv from 'dotenv';

dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '23730', 10),

    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',

    // JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-me',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY_DAYS: 30,

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Cookie
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',

    // HuggingFace AI
    HF_TOKEN: process.env.HF_TOKEN || '',
    HF_MODEL_ID: process.env.HF_MODEL_ID || 'mistralai/Voxtral-Mini-4B-Realtime-2602',
} as const;

// Validate required env vars at startup
const requiredVars = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

export function validateEnv(): void {
    const missing = requiredVars.filter(
        (key) => !process.env[key] || process.env[key] === ''
    );

    if (missing.length > 0 && env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (missing.length > 0) {
        console.warn(`⚠️  Missing environment variables (non-production): ${missing.join(', ')}`);
    }
}
