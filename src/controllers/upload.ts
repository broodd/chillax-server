import { Request, Response, NextFunction } from 'express';
import { Playlist, IPlaylist } from '../models/Playlist';
import { Track, ITrack } from '../models/Track';
import { isEmpty } from 'validator';
import { ApplicationError } from '../util/error-handler';
import logger from '../util/logger';

export const putUpload = async (req: Request, res: Response, next: NextFunction) => {
	const user = res.locals.user;
	const { name, playlistId } = req.body;
	let errors = [];

	logger.debug('req body', req.body);
	logger.debug('req body', req.body.audio);
	logger.debug('req headers', req.headers);
	logger.debug('req file', req.file);

	if (!req.file) {
		errors.push('File is empty');
	}

	if (!name || isEmpty(name)) {
		errors.push('Name is not valid')
	}

	if (!playlistId || isEmpty(playlistId)) {
		errors.push('PlaylistId is not valid')
	}

	if (!!errors.length) {
		throw new ApplicationError(errors[0], 404);
	}

	const playlist: IPlaylist = await Playlist.findById(playlistId)

	if (!playlist) {
		throw new ApplicationError('Playlist not found', 404);
	}

	const track: ITrack = await Track.create({
		name,
		img: playlist.img,
		src: req.file.filename,
		author: user._id,
		playlist: playlist._id,
		liked: [user._id]
	});

	await playlist.updateOne({
		$push: {
			tracks: track._id
		}
	})

	return res.json({
		data: track
	});
};