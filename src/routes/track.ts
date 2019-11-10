import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const track = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as trackController from '../controllers/track';

track.get('/tracks', authGuard, asyncWrapper(trackController.getTracks));
track.get('/tracks/:id', authGuard, asyncWrapper(trackController.getTracksInPlaylist));
track.get('/tracks/liked', authGuard, asyncWrapper(trackController.getTracksLiked));
track.get('/tracks/author/:id', authGuard, asyncWrapper(trackController.getTracksByAuthor));

track.post('/track/:id', authGuard, asyncWrapper(trackController.postTrack));

track.put('/track/like/:id', authGuard, asyncWrapper(trackController.putTrackLike));

export default track;