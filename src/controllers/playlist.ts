import { Request, Response, NextFunction } from 'express';
import { Playlist, PlaylistDocument } from '../models/Playlist';
import crypto from 'crypto';
import { check, sanitize, validationResult } from 'express-validator';
import logger from '../util/logger';
import mongoose from 'mongoose';

/**
 * Get /playlists
 * Get popular playlists
 */
export const getPlaylists = async (req: Request, res: Response) => {
	const playlists: PlaylistDocument[] = await Playlist.find({})
	
	res.json({
		data: playlists
	})
};

/**
 * Post /playlist
 * Create playlist
 */
export const postPlaylist = async (req: Request, res: Response, next: NextFunction) => {
	const playlist: PlaylistDocument = await Playlist.create({
		name: 'focus',
		img: 's img',
		author: '5dc480d86e91e410e4197b91',
		tracks: ['5dc480d86e91e410e4197b91', '5dc480d86e91e410e4197b91'],
		liked: ['5dc480d86e91e410e4197b91', '5dc480d86e91e410e4197b91']
	});
	
	return res.json({
		data: playlist
	})
};
