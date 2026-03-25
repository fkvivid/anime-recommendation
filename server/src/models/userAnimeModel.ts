import mongoose, { Types, Schema } from "mongoose";

export type WatchStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";

export interface IUserAnime extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    animeId: Types.ObjectId;
    status: WatchStatus;
    userRating: number | null;
    watchedAt: Date;
}

const UserAnimeSchema = new Schema<IUserAnime>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        animeId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        status: {
            type: String,
            enum: ["watching", "completed", "on_hold", "dropped", "plan_to_watch"],
            default: "plan_to_watch",
        },
        userRating: {
            type: Number,
            default: null,
            min: 1,
            max: 10,
        },
        watchedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false },
);

export const UserAnimeModel = mongoose.model<IUserAnime>("UserAnime", UserAnimeSchema);
