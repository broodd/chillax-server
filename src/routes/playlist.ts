import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const playlist = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as playlistController from '../controllers/playlist';

playlist.get('/playlist/:id', authGuard, asyncWrapper(playlistController.getPlaylist));
playlist.get('/playlists', authGuard, asyncWrapper(playlistController.getPlaylists));
playlist.get('/playlists/liked', authGuard, asyncWrapper(playlistController.getPlaylistsLiked));
playlist.get('/playlists/author/:id', authGuard, asyncWrapper(playlistController.getPlaylistsByAuthor));

playlist.post('/playlist', authGuard, asyncWrapper(playlistController.postPlaylist));

playlist.put('/playlist/like/:id', authGuard, asyncWrapper(playlistController.putPlaylistLike));

playlist.delete('/playlist/:id', authGuard, asyncWrapper(playlistController.deletePlaylist));

export default playlist;