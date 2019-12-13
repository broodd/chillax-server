import { Request, Response, NextFunction } from 'express';
import { Playlist, IPlaylist } from '../models/Playlist';
import { Track, ITrack } from '../models/Track';
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
		{
      $project: {
				'author.likedPlaylists': 0,
        'author.likedTracks': 0,
        'author.followers': 0,
        'author.password': 0,
        'author.email': 0,
        'tracks': 0,
      }
		},
		{
			$unwind: '$author'
		},
		{
			$addFields: {
				liked: {
					$in: [Types.ObjectId(user.id), '$liked']
				},
			},
		},
	]);

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
				likedLength: {
					$size: '$liked'
				}
			},
		},
		{
			$sort: {
				likedLength: -1,
				liked: -1,
				createdAt: -1
			}
		},
		{ $skip: +skip },
		{ $limit: +limit }
	]);

	res.json({
		data: playlists
	});
};

/**
 * GET /playlists/liked
 * Get loved playlists
 */
export const getPlaylistsLiked = async (req: Request, res: Response) => {
	const { page = 1, limit = 10 } = req.query;
	const skip = (page - 1) * limit;
	const user = res.locals.user;

	const playlists = await Playlist.aggregate([
    {
      $match: {
        liked: {
          $in: [Types.ObjectId(user.id), '$liked']
        }
      }
    },
    {
      $addFields: {
        liked: true
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    { $skip: +skip },
    { $limit: +limit }
  ]);

	res.json({
		data: playlists
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
				likedLength: {
					$size: '$liked'
				}
			},
		},
		{
			$sort: {
				likedLength: -1,
				liked: -1,
				createdAt: -1
			}
		},
		{ $skip: +skip },
		{ $limit: +limit }
	]);

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
	const errors = [];

	if (!name || isEmpty(name)) {
		errors.push('Name is not valid');
	}
	if (!img || isEmpty(img)) {
		errors.push('Image is not valid');
	}

	if (!!errors.length) {
		throw new ApplicationError(errors[0], 404);
	}

	const playlist: IPlaylist = await Playlist.create({
		name,
		img,
		author: user._id,
		tracks: [],
		liked: []
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

	// if (playlist.author == user.id) {
	// 	return res.json({
	// 		data: true
	// 	})
	// }

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

/**
 * DELETE /playlist/l:id
 */
export const deletePlaylist = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;
	const { id } = req.params;

	const playlist: IPlaylist = await Playlist.findById(id);

	if (!playlist) {
		throw new ApplicationError('Playlist not found', 404);
	}
	if (playlist.author != user._id && user.role != 'ADMIN') {
		throw new ApplicationError('Dont have permission', 403);
	}

	await playlist.remove();
	await Track.deleteMany({
		playlist: playlist._id
	});

	return res.json({
		data: playlist
	});
};

