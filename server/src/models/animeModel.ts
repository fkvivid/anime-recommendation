import mongoose, { Schema, Document, Types } from "mongoose";

export type AnimeType = "TV" | "Movie" | "OVA" | "ONA" | "Special" | "Music";
export type AnimeStatus =
    | "Finished Airing"
    | "Currently Airing"
    | "Not yet aired";
export type AiringSeason = "winter" | "spring" | "summer" | "fall";

export interface IAnime extends Document {
    _id: Types.ObjectId;
    mal_id: number;
    title: string;
    title_english: string;
    title_japanese: string;
    synopsis: string;
    image_url: string;
    type: AnimeType;
    source: string;
    episodes: number | null;
    status: AnimeStatus;
    score: number | null;
    scored_by: number | null;
    rank: number | null;
    popularity: number | null;
    season: AiringSeason | null;
    year: number | null;
    genres: string[];
    themes: string[];
    demographics: string[];
    studios: string[];
    rating: string;
    duration: string;
    embedding: number[];
    synced_at: Date;
}

const AnimeSchema = new Schema<IAnime>(
    {
        mal_id: { type: Number, required: true, unique: true },
        title: { type: String, required: true, trim: true },
        title_english: { type: String, default: "", trim: true },
        title_japanese: { type: String, default: "", trim: true },
        synopsis: { type: String, default: "" },
        image_url: { type: String, default: "" },
        type: {
            type: String,
            enum: ["TV", "Movie", "OVA", "ONA", "Special", "Music"],
            default: "TV",
        },
        source: { type: String, default: "" },
        episodes: { type: Number, default: null },
        status: {
            type: String,
            enum: ["Finished Airing", "Currently Airing", "Not yet aired"],
            required: true,
        },
        rating: { type: String, default: "" },
        duration: { type: String, default: "" },
        score: { type: Number, default: null, min: 0, max: 10 },
        scored_by: { type: Number, default: null },
        rank: { type: Number, default: null },
        popularity: { type: Number, default: null },
        season: {
            type: String,
            enum: ["winter", "spring", "summer", "fall", null],
            default: null,
        },
        year: { type: Number, default: null },
        genres: { type: [String], default: [] },
        themes: { type: [String], default: [] },
        demographics: { type: [String], default: [] },
        studios: { type: [String], default: [] },
        embedding: {
            type: [Number],
            required: true,
            validate: {
                validator: (v: number[]) => v.length === 1536,
                message: "Embedding must be 1536 dimensions (text-embedding-3-small)",
            },
        },

        synced_at: { type: Date, default: Date.now },
    },
    { collection: "animes", timestamps: false }
);

export const AnimeModel = mongoose.model<IAnime>("Anime", AnimeSchema);