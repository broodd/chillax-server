import mongoose from 'mongoose';

export type TrackDocument = mongoose.Document & {
		name: string;
		img: string;
		author: string;
		liked: string[];
};

const trackSchema = new mongoose.Schema({
		name: String,
		img: String,
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		liked: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
}, { timestamps: true });

export const Track = mongoose.model<TrackDocument>('Track', trackSchema);
