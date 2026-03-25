import type { NextFunction, Response } from 'express';
import { AnimeModel } from '../models/animeModel.js';
import { type AuthRequest } from '../middleware/auth.js';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { query } = req.body;

        let embedding: number[];

        if (!query) throw new Error('Query is required for recommendations');

        // Query expansion: rewrite to match descriptive database embeddings
        const chatRes = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an anime recommendation system. Rephrase and expand the user's query into a richer, descriptive paragraph focusing on themes, mood, genres, and plot without listing specific anime titles. Keep it under 60 words.",
                },
                { role: "user", content: query }
            ]
        });

        const expandedQuery = chatRes.choices[0]?.message?.content || query;

        const resEmbed = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: expandedQuery,
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
                    title_japanese: 1,
                    image_url: 1,
                    score: 1,
                    genres: 1,
                    synopsis: 1,
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
        const animes = await AnimeModel.find({}, { embedding: 0 }).limit(Number(limit)).skip(skip);
        res.json({
            data: animes,
            success: true,
        });
    } catch (error) {
        console.error('Get animes error:', error);
        next(error);
    }
};

export const randomizeRecommendations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const totalAnime = await AnimeModel.countDocuments();
        const animes = await AnimeModel.find({}, { embedding: 0 }).limit(1).skip(Math.floor(Math.random() * totalAnime))
        res.json({
            data: animes.length > 0 ? animes[0] : null,
            success: true,
        });
    } catch (error) {
        console.error('Randomize recommendations error:', error);
        next(error);
    }
};
