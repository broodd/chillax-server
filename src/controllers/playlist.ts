import { Request, Response, NextFunction } from 'express';
import { Playlist, IPlaylist } from '../models/Playlist';
import { User, IUser } from '../models/User';
import { isEmpty } from 'validator';
import { ApplicationError } from '../util/error-handler';
import logger from '../util/logger';
import { Types } from 'mongoose';

/**
 * Get /playlist/:id
 * Get popular playlists
 */
export const getPlaylist = async (req: Request, res: Response) => {
	const playlist: IPlaylist = await Playlist.findById(req.params.id)
		// maybe change it later
		// .populate('tracks')
		.populate(
			{
				path: 'tracks',
				// select: 'tracks',
				// model: 'Track',
				// options: {
				// 	sort: {},
				// 	skip: 5,
				// 	limit: 10
				// },
				// match: {
				// 	// filter result in case of multiple result in populate
				// 	// may not useful in this case
				// }
			}
		)

	res.json({
		data: playlist
	});
};

/**
 * Get /playlists
 * Get popular playlists
 */
export const getPlaylists = async (req: Request, res: Response) => {
	const playlists: IPlaylist[] = await Playlist.find({})

	res.json({
		data: playlists
	});
};

/**
 * Get /playlists/liked
 * Get loved playlists
 */
export const getPlaylistsLiked = async (req: Request, res: Response) => {
	const _id = res.locals.user._id;
	const user: IUser = await User.findById(_id)
		.populate({
			path: 'track',
			select: 'likedPlaylists',
		});

	res.json({
		data: user.likedPlaylists
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
