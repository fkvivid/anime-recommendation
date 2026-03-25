import { NextFunction, Response } from 'express';
import { AnimeModel } from '../models/animeModel';
import { UserAnimeModel } from '../models/userAnimeModel';
import { AuthRequest } from '../middleware/auth';
import OpenAI from 'openai';
import { error } from 'console';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { query } = req.body;

        let embedding: number[];

        if (!query) throw new Error('Query is required for recommendations');

        const resEmbed = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
            dimensions: 1536,
        });
        embedding = resEmbed.data[0]!.embedding;

        const recommendations = await AnimeModel.aggregate([
            {
                $vectorSearch: {
                    index: "anime_vector_index",
                    path: "embedding",
                    queryVector: embedding,
                    numCandidates: 100,
                    limit: 9,
                }
            },
            {
                $project: {
                    _id: 1,
                    mal_id: 1,
                    title: 1,
                    title_english: 1,
                    image_url: 1,
                    score: 1,
                    genres: 1,
                    vectorScore: { $meta: "vectorSearchScore" }
                }
            }
        ]);

        res.json({
            data: recommendations,
            success: true,
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        next(error);
    }
};

export const getAnimeDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { mal_id } = req.params;
        const anime = await AnimeModel.findOne({ mal_id: Number(mal_id) });
        if (!anime) {
            res.status(404).json({ error: 'Anime not found' });
            return;
        }
        res.json(anime);
    } catch (error) {
        console.error('Get anime details error:', error);
        next(error);
    }
};

export const getAnimes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { limit = 12, page = 1 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const animes = await AnimeModel.find({}, {embedding: 0}).limit(Number(limit)).skip(skip);
        res.json({
            data: animes,
            success: true,
        });
    } catch (error) {
        console.error('Get animes error:', error);
        next(error);
    }
};
