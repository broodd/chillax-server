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
    tracks: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
      }],
      select: false
    },
    liked: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      select: false
    }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true
});

const autoPopulateAuthor = function(next: NextFunction) {
  this.populate('author');
  next();
};

playlistSchema.pre('find', autoPopulateAuthor);

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
