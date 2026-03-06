import crypto from 'crypto';
import prisma from '../../config/db';
import { env } from '../../config/env';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { ApiError } from '../../middleware/errorHandler';

function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthResponse extends AuthTokens {
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export async function register(
    email: string,
    password: string,
    name: string
): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, 'Email already registered');
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
        data: { email, passwordHash, name },
    });

    // Generate tokens
    const accessToken = generateAccessToken(Number(user.id));
    const refreshToken = generateRefreshToken(Number(user.id));

    // Store hashed refresh token
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        },
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
        },
    };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(Number(user.id));
    const refreshToken = generateRefreshToken(Number(user.id));

    // Store hashed refresh token
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        },
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
        },
    };
}

export async function refresh(tokenFromCookie: string): Promise<AuthTokens & { user: { id: string; email: string; name: string } }> {
    // Verify the JWT
    let payload;
    try {
        payload = verifyRefreshToken(tokenFromCookie);
    } catch {
        throw new ApiError(401, 'Invalid refresh token');
    }

    const tokenHash = hashToken(tokenFromCookie);

    // Find the token in DB
    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            userId: BigInt(payload.userId),
            tokenHash,
            revokedAt: null,
        },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new ApiError(401, 'Refresh token expired or revoked');
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
    });

    // Get user
    const user = await prisma.user.findUnique({
        where: { id: BigInt(payload.userId) },
    });

    if (!user) {
        throw new ApiError(401, 'User not found');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(Number(user.id));
    const newRefreshToken = generateRefreshToken(Number(user.id));

    // Store new hashed refresh token
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(newRefreshToken),
            expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
        },
    };
}

export async function logout(tokenFromCookie: string): Promise<void> {
    const tokenHash = hashToken(tokenFromCookie);

    // Revoke the refresh token
    await prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    });
}
