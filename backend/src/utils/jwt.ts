import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload extends JwtPayload {
    userId: number;
}

export function generateAccessToken(userId: number): string {
    return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY,
    });
}

export function generateRefreshToken(userId: number): string {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
        expiresIn: `${env.JWT_REFRESH_EXPIRY_DAYS}d`,
    });
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
