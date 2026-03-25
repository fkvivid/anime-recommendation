import mongoose, { Schema, Types } from "mongoose";

export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true },
);

export const RefreshTokenModel = mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
