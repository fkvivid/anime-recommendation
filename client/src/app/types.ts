export interface User {
    email: string;
    displayName: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type AnimeType = 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' | 'Music';
export type AnimeStatus = 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
export type AiringSeason = 'winter' | 'spring' | 'summer' | 'fall';

export interface Anime {
    _id: string;
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
    vectorScore?: number;
}

export interface RecommendResponse {
    success: boolean;
    message: string;
    data: Anime[];
}

export type WatchStatus =
    | 'watching'
    | 'completed'
    | 'on_hold'
    | 'dropped'
    | 'plan_to_watch';

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
    watching: 'Watching',
    completed: 'Completed',
    on_hold: 'On Hold',
    dropped: 'Dropped',
    plan_to_watch: 'Plan to Watch',
};

export interface WatchedAnime {
    _id: string;
    animeId: string;
    status: WatchStatus;
    userRating: number | null;
    watchedAt: string;
    anime: Anime;
}

export interface AddToWatchlistRequest {
    animeId: number;
    status: WatchStatus;
}

export interface UpdateWatchlistRequest {
    status?: WatchStatus;
    userRating?: number | null;
}