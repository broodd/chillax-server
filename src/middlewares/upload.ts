import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: CallableFunction) => {
    cb(undefined, 'static/audio');
    // cb(undefined, path.join(__dirname, '../../static/audio'));
  },
  filename: (req: Request, file: any, cb: CallableFunction) => {
    const date = new Date().toISOString().replace(/:/g, '_');
    const name = file.originalname.toLowerCase().replace(/[\s]/g, '_');
    cb(undefined, `${date}-${name}`);
  }
});

const fileFilter = (req: Request, file: any, cb: CallableFunction) => {
  if (file.mimetype.includes('audio')) {
    cb(undefined, true);
  } else {
    cb(undefined, false);
  }
};

export default multer({ storage, fileFilter }).single('audio');