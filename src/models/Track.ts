import mongoose from 'mongoose';

export type ITrack = mongoose.Document & {
		name: string;
		img: string;
		author: string;
		playlist: string;
		liked: string[];
};

const trackSchema = new mongoose.Schema({
		name: String,
		img: String,
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		playlist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Playlist'
		},
		liked: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
}, { timestamps: true });

export const Track = mongoose.model<ITrack>('Track', trackSchema);
