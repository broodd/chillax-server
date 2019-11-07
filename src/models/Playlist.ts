import mongoose from 'mongoose';

export type PlaylistDocument = mongoose.Document & {
		name: string;
		img: string;
		author: string;
		tracks: string[];
		liked: string[];
};

const playlistSchema = new mongoose.Schema({
		name: String,
		img: String,
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		tracks: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Track'
		}],
		liked: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
}, { timestamps: true });

export const Playlist = mongoose.model<PlaylistDocument>('Playlist', playlistSchema);
