import OpenAI from 'openai';
import axios from 'axios'
import { AnimeModel, type IAnime } from '../models/animeModel.js';
import { connectDB } from './connectDB.js';
import { getBaseTitle } from './util-functions.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const JIKAN_BASE = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity';
const TOTAL_ANIME = Number(process.env.TOTAL_ANIME) || 100;

export function buildEmbedText(anime: IAnime): string {
    const tags = [
        ...anime.genres,
        ...anime.themes,
        ...anime.demographics,
    ].filter(Boolean).join(", ");

    const studios = anime.studios.filter(Boolean).join(", ");

    return `
        Anime Title: ${anime.title_english || anime.title} (${anime.title_japanese || 'No Japanese Title'})
        Metadata: A ${anime.type} series animated by ${studios || 'Unknown Studio'}, based on ${anime.source || 'Original'} material. 
        Aired: ${anime.season && anime.year ? `${anime.season} ${anime.year}` : 'Unknown'}.
        Themes and Genres: ${tags || 'None'}.
        Synopsis: ${anime.synopsis || 'N/A'}
    `.trim().replace(/\n+/g, ' ').slice(0, 8000);
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
    let page = 1;
    const seenTitles = new Set<string>();

    await connectDB();

    // await AnimeModel.deleteMany({});

    do {
        const { data } = await axios.get(`${JIKAN_BASE}&page=${page++}`);

        const animeList = data.data as any[];
        if (!animeList || animeList.length === 0) break;

        for (const anime of animeList) {
            const baseJapanese = getBaseTitle(anime.title);
            const baseEnglish = getBaseTitle(anime.title_english);

            let isDuplicate = false;
            if (baseJapanese && seenTitles.has(baseJapanese)) isDuplicate = true;
            if (baseEnglish && seenTitles.has(baseEnglish)) isDuplicate = true;

            if (isDuplicate) {
                console.log(`Skipping duplicate sequence/season: ${anime.title}`);
                continue;
            }

            if (baseJapanese) seenTitles.add(baseJapanese);
            if (baseEnglish) seenTitles.add(baseEnglish);

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
                { mal_id: transformedAnime.mal_id as number },
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