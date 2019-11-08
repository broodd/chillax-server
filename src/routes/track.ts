import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const track = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as trackController from '../controllers/track';

track.get('/tracks', asyncWrapper(trackController.getTracks));
track.get('/tracks/liked', authGuard, asyncWrapper(trackController.getTracksLiked));

track.post('/track/:id', authGuard, asyncWrapper(trackController.postTrack));

export default track;