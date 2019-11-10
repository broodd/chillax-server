import { Request, Response, NextFunction } from 'express';
import { Playlist, IPlaylist } from '../models/Playlist';
import { User, IUser } from '../models/User';
import { isEmpty } from 'validator';
import { ApplicationError } from '../util/error-handler';
import logger from '../util/logger';
import { Types } from 'mongoose';

/**
 * GET /playlist/:id
 * Get playlist
 */
export const getPlaylist = async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = res.locals.user;

	const playlist = await Playlist.aggregate([
		{
			$match: {
				_id: Types.ObjectId(id)
			}
		},
		{
			$lookup: {
				from: 'users',
				localField: 'author',
				foreignField: '_id',
				as: 'author',
			}
		},
		{ $unwind: '$author' },
		{
			$addFields: {
				liked: {
					$in: [Types.ObjectId(user.id), '$liked']
				},
			},
		},
		{
			$project: {
				'name': 1,
				'img': 1,
				'author.profile': 1
			}
		}
	])

	res.json({
		data: playlist
	});
};

/**
 * GET /playlists
 * Get popular playlists
 */
export const getPlaylists = async (req: Request, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	const skip = (page - 1) * limit;
	const user = res.locals.user;

	const playlists = await Playlist.aggregate([
		{
			$addFields: {
				liked: {
					$in: [Types.ObjectId(user.id), '$liked']
				},
			},
		},
		{
			$sort: {
				createdAt: -1
			}
		},
		{ $skip: +skip },
		{ $limit: +limit }
	])

	res.json({
		data: playlists
	});
};

/**
 * GET /playlists/liked
 * Get loved playlists
 */
export const getPlaylistsLiked = async (req: Request, res: Response) => {
	const _id = res.locals.user._id;
	const user: IUser = await User.findById(_id)
		.populate({
			path: 'likedPlaylists',
			// select: 'likedPlaylists',
		});

	res.json({
		data: user.likedPlaylists
	});
};

/**
 * GET /playlists/author/:id
 * Get author playlists
 */
export const getPlaylistsByAuthor = async (req: Request, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	const skip = (page - 1) * limit;
	const { id } = req.params;
	const user = res.locals.user;

	const playlists = await Playlist.aggregate([
		{
			$match: {
				author: Types.ObjectId(id)
			}
		},
		{
			$addFields: {
				liked: {
					$in: [Types.ObjectId(user.id), '$liked']
				},
			},
		},
		{
			$sort: {
				createdAt: -1
			}
		},
		{ $skip: +skip },
		{ $limit: +limit }
	])

	res.json({
		data: playlists
	});
};

/**
 * POST /playlist
 * Create playlist
 */
export const postPlaylist = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;
	const { name, img } = req.body;
	let errors = [];

	if (!name || isEmpty(name)) {
		errors.push('Name is not valid')
	}
	if (!img || isEmpty(img)) {
		errors.push('Image is not valid')
	}

	if (!!errors.length) {
		throw new ApplicationError(errors[0], 404);
	}

	const playlist: IPlaylist = await Playlist.create({
		name,
		img,
		author: user._id,
		tracks: [],
		liked: [user._id]
	});

	return res.json({
		data: playlist
	});
};

/**
 * PUT /playlist/like/:id
 * Like / unlike playlist
 */
export const putPlaylistLike = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;
	const { id } = req.params;

	const playlist: IPlaylist = await Playlist.findById(id, {
		liked: 1,
		author: 1
	});

	if (!playlist) {
		throw new ApplicationError('Playlist not found', 404);
	}

	if (playlist.author == user.id) {
		return res.json({
			data: true
		})
	}

	const liked = playlist.liked.includes(user._id);

	if (liked) {
		await playlist.update({
			$pull: {
				liked: user.id
			}
		});
	} else {
		await playlist.update({
			$addToSet: {
				liked: user.id
			}
		});
	}

	return res.json({
		data: !liked
	});
};
