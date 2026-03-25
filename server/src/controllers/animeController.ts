import type { NextFunction, Response } from 'express';
import { UserAnimeModel } from '../models/userAnimeModel.js';
import { AnimeModel } from '../models/animeModel.js';
import { type AuthRequest } from '../middleware/auth.js';

export const getUserAnime = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { limit = 12, page = 1 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const userAnime = await UserAnimeModel.find({ userId }).limit(Number(limit)).skip(skip);

        const animeIds = userAnime.map((ua: any) => ua.animeId);
        const animeDocs = await AnimeModel.find({ _id: { $in: animeIds } }, { embedding: 0 })
        const animeMap = new Map(animeDocs.map((anime: any) => [anime._id.toString(), anime]));

        const response = userAnime.map((ua: any) => ({
            ...ua.toObject(),
            anime: animeMap.get(ua.animeId.toString()) || null,
        }));

        res.json({
            data: response,
            success: false,
        });

    } catch (error) {
        console.error('Get user anime error:', error);
        next(error);
    }
};

export const addUserAnime = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { animeId, status } = req.body;

        if (!animeId) {
            throw new Error('Anime ID is required');
        }

        const anime = await AnimeModel.findOne({ mal_id: animeId });
        if (!anime) {
            throw new Error('Anime not found');
        }

        await UserAnimeModel.updateOne(
            { userId, animeId: anime._id },
            { $set: { status: status || 'plan_to_watch' } },
            { upsert: true });

        res.status(201).json({ message: 'Added/Updated' });
    } catch (error) {
        console.error('Add user anime error:', error);
        next(error);
    }
};

export const updateUserAnime = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const { status, userRating } = req.body;

        const userAnime = await UserAnimeModel.findOne({ _id: id as string, userId });
        if (!userAnime) {
            throw new Error('User anime not found');
        }

        if (status) userAnime.status = status;
        if (userRating !== undefined) userAnime.userRating = userRating;

        await userAnime.save();
        res.json(userAnime);
    } catch (error) {
        console.error('Update user anime error:', error);
        next(error);
    }
};

export const deleteUserAnime = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const result = await UserAnimeModel.deleteOne({ _id: id as string, userId });
        if (result.deletedCount === 0) {
            throw new Error('User anime not found');
        }

        res.json({ message: 'Deleted' });
    } catch (error) {
        console.error('Delete user anime error:', error);
        next(error);
    }
};