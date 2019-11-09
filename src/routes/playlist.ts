import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const playlist = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as playlistController from '../controllers/playlist';

playlist.get('/playlist/:id', asyncWrapper(playlistController.getPlaylist));
playlist.get('/playlists', asyncWrapper(playlistController.getPlaylists));
playlist.get('/playlists/liked', authGuard, asyncWrapper(playlistController.getPlaylistsLiked));

playlist.post('/playlist', authGuard, asyncWrapper(playlistController.postPlaylist));

playlist.put('/playlist/like/:id', authGuard, asyncWrapper(playlistController.putPlaylistLike));

export default playlist;