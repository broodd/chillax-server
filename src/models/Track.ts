import mongoose from 'mongoose';

export type ITrack = mongoose.Document & {
		name: string;
		img: string;
		author: string;
		src: string;
		playlist: string;
		liked: string[];
		order: number;
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
		src: {
			type: String,
			required: '{PATH} is required!'
		},
		playlist: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Playlist',
			required: '{PATH} is required!'
		},
		liked: {
			type: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			}],
			select: false
		},
		order: Number
}, {
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
	timestamps: true
});

export const Track = mongoose.model<ITrack>('Track', trackSchema);
