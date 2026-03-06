import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as authService from './auth.service';
import { refreshTokenCookieOptions } from '../../config/security';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

export async function registerHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password, name } = req.body;
        const result = await authService.register(email, password, name);

        // Set refresh token cookie
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshTokenCookieOptions);

        res.status(201).json({
            accessToken: result.accessToken,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

export async function loginHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password } = req.body;
        const result = await authService.login(email, password);

        // Set refresh token cookie
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshTokenCookieOptions);

        res.json({
            accessToken: result.accessToken,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

export async function refreshHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const tokenFromCookie = req.cookies[REFRESH_TOKEN_COOKIE];

        if (!tokenFromCookie) {
            res.status(401).json({ error: 'Refresh token required' });
            return;
        }

        const result = await authService.refresh(tokenFromCookie);

        // Set new refresh token cookie
        res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshTokenCookieOptions);

        res.json({
            accessToken: result.accessToken,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

export async function logoutHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const tokenFromCookie = req.cookies[REFRESH_TOKEN_COOKIE];

        if (tokenFromCookie) {
            await authService.logout(tokenFromCookie);
        }

        // Clear the cookie
        res.clearCookie(REFRESH_TOKEN_COOKIE, {
            httpOnly: true,
            secure: refreshTokenCookieOptions.secure,
            sameSite: refreshTokenCookieOptions.sameSite,
            path: '/api/auth',
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
}
