import { Request, Response, NextFunction } from 'express';
import { Playlist, IPlaylist } from '../models/Playlist';
import { Track, ITrack } from '../models/Track';
import { User, IUser } from '../models/User';
import { isEmpty } from 'validator';
import { ApplicationError } from '../util/error-handler';
import { Types } from 'mongoose';
import logger from '../util/logger';

/**
 * Get /tracks
 * Get popular tracks
 */
export const getTracks = async (req: Request, res: Response) => {
	const tracks: ITrack[] = await Track.find({});

	res.json({
		data: tracks
	});
};

/**
 * Get /tracks/liked
 * Get loved tracks
 */
export const getTracksLiked = async (req: Request, res: Response) => {
	const id = res.locals.user.id;
	const user: IUser = await User.findById(id)
		.populate({
			path: 'track',
			select: 'likedTracks',
		});

	res.json({
		data: user.likedTracks
	});
};


/**
 * Post /track/:id
 * Add track to playlist
 */
export const postTrack = async (req: Request, res: Response, next: NextFunction) => {
	const { id } = req.params;
	const user = res.locals.user;
	const { name } = req.body;
	let errors = [];

	if (!name || isEmpty(name)) {
		errors.push('Name is not valid')
	}

	if (!!errors.length) {
		throw new ApplicationError(errors[0], 404);
	}

	const playlist: IPlaylist = await Playlist.findById(id)

	if (!playlist) {
		throw new ApplicationError('Playlist not found', 404);
	}

	const track: ITrack = await Track.create({
		name,
		img: playlist.img,
		author: user._id,
		playlist: playlist._id,
		liked: [user._id]
	});

	await playlist.update({
		$push: {
			tracks: track._id
		}
	})

	return res.json({
		data: track
	});
};


/**
 * PUT /track/like/:id
 * Like / unlike track
 */
export const putTrackLike = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;
	const { id } = req.params;

	const track: ITrack = await Track.findById(id, {
		liked: 1,
		author: 1
	});

	if (!track) {
		throw new ApplicationError('Track not found', 404);
	}

	if (track.author == user.id) {
		return res.json({
			data: true
		})
	}

	const liked = track.liked.includes(user._id);

	if (liked) {
		await track.updateOne({
			$pull: {
				liked: user.id
			}
		});
	} else {
		await track.updateOne({
			$addToSet: {
				liked: user.id
			}
		});
	}

	return res.json({
		data: !liked
	});
};
