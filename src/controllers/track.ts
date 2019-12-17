import { Request, Response, NextFunction } from 'express';
import { Playlist, IPlaylist } from '../models/Playlist';
import { Track, ITrack } from '../models/Track';
import { User, IUser } from '../models/User';
import { isEmpty } from 'validator';
import { ApplicationError } from '../util/error-handler';
import { Types } from 'mongoose';
import logger from '../util/logger';

/**
 * GET /tracks
 * Get popular tracks
 */
export const getTracks = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const user = res.locals.user;

  const tracks = await Track.aggregate([
    {
      $addFields: {
        liked: {
          $in: [Types.ObjectId(user.id), '$liked']
        },
        likedLength: {
          $size: '$liked'
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $project: {
        'author.likedPlaylists': 0,
        'author.likedTracks': 0,
        'author.followers': 0,
        'author.password': 0,
        'author.email': 0
      }
    },
    {
      $unwind: '$author'
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
    data: tracks
  });
};

/**
 * GET /tracks/playlist/:id
 * Get tracks in playlist
 */
export const getTracksInPlaylist = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const { id } = req.params;
  const user = res.locals.user;

  const tracks = await Track.aggregate([
    {
      $match: {
        playlist: Types.ObjectId(id)
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
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $project: {
        'author.likedPlaylists': 0,
        'author.likedTracks': 0,
        'author.followers': 0,
        'author.password': 0,
        'author.email': 0
      }
    },
    {
      $unwind: '$author'
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
    data: tracks
  });
};

/**
 * GET /tracks/liked
 * Get loved tracks
 */
export const getTracksLiked = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const user = res.locals.user;

  const tracks = await Track.aggregate([
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
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $project: {
        'author.likedPlaylists': 0,
        'author.likedTracks': 0,
        'author.followers': 0,
        'author.password': 0,
        'author.email': 0
      }
    },
    {
      $unwind: '$author'
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
    data: tracks
  });
};

/**
 * GET /tracks/author/:id
 * Get author tracks
 */
export const getTracksByAuthor = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const { id } = req.params;
  const user = res.locals.user;

  const tracks = await Track.aggregate([
    {
      $match: {
        author: Types.ObjectId(id)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $project: {
        'author.likedPlaylists': 0,
        'author.likedTracks': 0,
        'author.followers': 0,
        'author.password': 0,
        'author.email': 0
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
        likedLength: {
          $size: '$liked'
        }
      }
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
    data: tracks
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

  // if (track.author == user.id) {
  // 	return res.json({
  // 		data: true
  // 	})
  // }

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

/**
 * DELETE /track/l:id
 */
export const deleteTrack = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  const { id } = req.params;

  const track: ITrack = await Track.findById(id);

  if (!track) {
    throw new ApplicationError('Track not found', 404);
  }
  if (track.author != user._id && user.role != 'ADMIN') {
    throw new ApplicationError('Dont have permission', 403);
  }

  await Playlist.updateOne({
    _id: track.playlist
  },
  {
    $pull: {
      tracks: track._id
    }
  });

  await track.remove();

  return res.json({
    data: track
  });
};

export const putTrackUpload = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  const { name, playlistId } = req.body;
  const errors = [];

  if (!req.file) {
    errors.push('File is empty');
  }

  if (!name || isEmpty(name)) {
    errors.push('Name is not valid');
  }

  if (!playlistId || isEmpty(playlistId)) {
    errors.push('PlaylistId is not valid');
  }

  if (!!errors.length) {
    throw new ApplicationError(errors[0], 404);
  }

  const playlist: IPlaylist = await Playlist.findById(playlistId);

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
  });

  return res.json({
    data: track
  });
};

/**
 * PUT /track/:id
 * Update track
 */
export const putTrackUpdate = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  const { name, img, order } = req.body;
  const { id } = req.params;

  const track: ITrack = await Track.findById(id);

  if (!track) {
    throw new ApplicationError('Track not found', 404);
  }
  if (track.author != user._id && user.role != 'ADMIN') {
    throw new ApplicationError('Dont have permission', 403);
  }

  if (name) {
    track.name = name;
  }

  if (img) {
    track.img = img;
  }

  if (req.file) {
    track.src = req.file.filename;
  }

  if (order) {
    track.order = order;
  }

  await track.save();

  return res.json({
    data: track
  });
};