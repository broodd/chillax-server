import { Router } from 'express';
import asyncWrapper from '../util/error-handler';
const upload = Router();

import authGuard from '../middlewares/authGuard';

/**
 * Controllers (route handlers)
 */
import * as uploadControllers from '../controllers/upload';

upload.put('/audio-file', authGuard, asyncWrapper(uploadControllers.putUpload));

export default upload;