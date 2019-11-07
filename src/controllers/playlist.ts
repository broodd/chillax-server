import { Request, Response, NextFunction } from 'express';
import { Playlist, PlaylistDocument } from '../models/Playlist';
import crypto from 'crypto';
import { check, sanitize, validationResult } from 'express-validator';
import logger from '../util/logger';

/**
 * Get /playlists
 * Get popular playlists
 */
export const getPlaylists = (req: Request, res: Response, next: NextFunction) => {
  check('email', 'Email is not valid').isEmail();
  check('password', 'Password cannot be blank').isLength({ min: 1 });
  // eslint-disable-next-line @typescript-eslint/camelcase
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  logger.debug('errors', errors.array())
};
