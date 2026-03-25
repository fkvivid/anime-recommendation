import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { RefreshTokenModel } from '../models/refreshToken.js';
import { type AuthRequest } from '../middleware/auth.js';
import { generateUsername } from "unique-username-generator";

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const displayName = generateUsername()

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await UserModel.create({ email, passwordHash, displayName });

        res.status(201).json({
            user: { email: user.email, displayName: user.displayName }
        });
    } catch (error) {
        console.error('Signup error:', error);
        next(error);
    }
};

export const signin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        const accessToken = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: '7d' }
        );

        await RefreshTokenModel.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.json({
            user: { email: user.email, displayName: user.displayName },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Signin error:', error);
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

        const tokenDoc = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
            throw new Error('Invalid or expired refresh token');
        }

        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            throw new Error('User not found');
        }

        const newAccessToken = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Refresh error:', error);
        next(error);
    }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await RefreshTokenModel.deleteOne({ token: refreshToken });
        }
        res.json({ message: 'Logged out' });
    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
};