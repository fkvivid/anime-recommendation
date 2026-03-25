import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        req.user = { id: decoded.userId, email: decoded.email };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};