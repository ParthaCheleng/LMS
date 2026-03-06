import { env } from './env';
import { CorsOptions } from 'cors';
import { CookieOptions } from 'express';

export const corsOptions: CorsOptions = {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
    path: '/api/auth',
    maxAge: env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000, // 30 days in ms
};

export const BCRYPT_SALT_ROUNDS = 12;
