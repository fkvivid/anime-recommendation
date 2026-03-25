import mongoose from 'mongoose';
import OpenAI from 'openai';
import axios from 'axios'
import { AnimeModel, IAnime } from '../models/animeModel';
import { connectDB } from './connectDB';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const JIKAN_BASE = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity';
const TOTAL_ANIME = 1000;

export function buildEmbedText(anime: IAnime): string {
    const tags = [
        ...anime.genres,
        ...anime.themes,
        ...anime.demographics,
    ]
        .filter(Boolean)
        .join(", ");

    const studios = anime.studios.filter(Boolean).join(", ");

    const lines: string[] = [
        `Title: ${anime.title}`,
        anime.title_english ? `English title: ${anime.title_english}` : "",
        anime.title_japanese ? `Japanese title: ${anime.title_japanese}` : "",

        `Type: ${anime.type}`,
        anime.source ? `Source: ${anime.source}` : "",
        anime.episodes ? `Episodes: ${anime.episodes}` : "",
        anime.season && anime.year
            ? `Season: ${anime.season} ${anime.year}`
            : "",
        anime.rating ? `Rating: ${anime.rating}` : "",
        anime.duration ? `Duration: ${anime.duration}` : "",
        anime.status ? `Status: ${anime.status}` : "",

        anime.score !== null
            ? `MAL score: ${anime.score} out of 10`
            : "",
        anime.rank !== null
            ? `MAL rank: #${anime.rank} overall`
            : "",
        anime.popularity !== null
            ? `Popularity rank: #${anime.popularity}`
            : "",

        tags ? `Genres and themes: ${tags}` : "",

        studios ? `Studios: ${studios}` : "",

        anime.synopsis
            ? `Synopsis: ${anime.synopsis}`
            : "",
    ];

    return lines
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n")
        .slice(0, 8000);
}

export async function embedAnime(anime: IAnime): Promise<number[]> {
    const text = buildEmbedText(anime);

    const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 1536,
    });

    return res.data[0]!.embedding;
}

async function main() {

    let current = 0;
    let page = 1

    await connectDB()

    await AnimeModel.deleteMany({})

    do {
        const { data } = await axios.get(`${JIKAN_BASE}&page=${page++}`)

        for (const anime of data.data as any[]) {
            const transformedAnime: Partial<IAnime> = {
                mal_id: anime.mal_id,
                title: anime.title,
                title_english: anime.title_english || '',
                title_japanese: anime.title_japanese || '',
                synopsis: anime.synopsis || '',
                image_url: anime.images?.jpg?.image_url || '',
                type: anime.type,
                source: anime.source || '',
                episodes: anime.episodes,
                status: anime.status,
                score: anime.score,
                scored_by: anime.scored_by,
                rank: anime.rank,
                popularity: anime.popularity,
                season: anime.season,
                year: anime.year,
                genres: anime.genres?.map((g: any) => g.name) || [],
                themes: anime.themes?.map((t: any) => t.name) || [],
                demographics: anime.demographics?.map((d: any) => d.name) || [],
                studios: anime.studios?.map((s: any) => s.name) || [],
                rating: anime.rating,
                duration: anime.duration,
                synced_at: new Date(),
            };

            const embed = await embedAnime(transformedAnime as IAnime)

            const response = await AnimeModel.updateOne(
                { mal_id: transformedAnime.mal_id },
                {
                    $set: {
                        ...transformedAnime,
                        embedding: embed,
                    }
                },
                { upsert: true }
            )

            console.log(`current: ${current++}, mal_id: ${transformedAnime.mal_id}, title: ${transformedAnime.title}, updated: ${response.modifiedCount}, inserted: ${response.upsertedCount}`)
        }

    } while (current < TOTAL_ANIME)
    process.exit(0)

}
main()