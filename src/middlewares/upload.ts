import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({
	destination: (req: Request, file: any, cb: CallableFunction) => {
		cb(null, 'static/audio');
	},
	filename: (req: Request, file: any, cb: CallableFunction) => {
		const date = new Date().toISOString().replace(/:/g, '_');
		const name = file.originalname.toLowerCase().replace(/[\s]/g, '_');
		cb(null, `${date}-${name}`);
	}
});

const fileFilter = (req: Request, file: any, cb: CallableFunction) => {
	if (file.mimetype.includes('audio')) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

export default multer({ storage, fileFilter }).single('audio');