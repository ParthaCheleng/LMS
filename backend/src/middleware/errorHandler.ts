import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export function errorHandler(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${statusCode} - ${message}`, {
        stack: err.stack,
        timestamp: new Date().toISOString(),
    });

    res.status(statusCode).json({
        error: message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
