import mongoose from 'mongoose';
import { NextFunction } from 'express';

export type IPlaylist = mongoose.Document & {
		name: string;
		img: string;
		author: string;
		tracks: string[];
		liked: string[];
};

const playlistSchema = new mongoose.Schema({
		name: {
			type: String,
			required: '{PATH} is required!'
		},
		img:  {
			type: String,
			required: '{PATH} is required!'
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: '{PATH} is required!'
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

const autoPopulateAuthor = function(next: NextFunction) {
  this.populate('author');
  next();
};

playlistSchema.pre('find', autoPopulateAuthor);

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
