import mongoose, { Schema, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    passwordHash: string;
    displayName: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 64,
        },
    },
    { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
