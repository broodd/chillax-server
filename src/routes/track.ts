import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const track = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as trackController from '../controllers/track';

track.get('/tracks', authGuard, asyncWrapper(trackController.getTracks));
track.get('/tracks/playlist/:id', authGuard, asyncWrapper(trackController.getTracksInPlaylist));
track.get('/tracks/liked', authGuard, asyncWrapper(trackController.getTracksLiked));
track.get('/tracks/author/:id', authGuard, asyncWrapper(trackController.getTracksByAuthor));

track.put('/track/like/:id', authGuard, asyncWrapper(trackController.putTrackLike));
track.put('/audio-file', authGuard, asyncWrapper(trackController.putTrackUpload));
track.put('/track/:id', authGuard, asyncWrapper(trackController.putTrackUpdate));

track.delete('/track/:id', authGuard, asyncWrapper(trackController.deleteTrack));

export default track;