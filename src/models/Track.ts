import mongoose from 'mongoose';

export type ITrack = mongoose.Document & {
		name: string;
		img: string;
		author: string;
		playlist: string;
		liked: string[];
};

const trackSchema = new mongoose.Schema({
		name: {
			type: String,
			required: '{PATH} is required!'
		},
		img: {
			type: String,
			required: '{PATH} is required!'
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: '{PATH} is required!'
		},
		playlist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Playlist',
			required: '{PATH} is required!'
		},
		liked: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
}, { timestamps: true });

export const Track = mongoose.model<ITrack>('Track', trackSchema);
