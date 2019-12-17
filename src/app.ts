import express, { Request, Response, NextFunction } from 'express';
import lusca from 'lusca';
import compression from 'compression';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import logger from './util/logger';
import path from 'path';
import { MONGODB_URI } from './util/secrets';

/**
 * Create Express server
 */
const app = express();

/**
 * Connect to MongoDB
 */
const mongoUrl = MONGODB_URI;
mongoose.Promise = global.Promise;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  .then(
    () => {
      /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    },
  ).catch((err: Error) => {
    logger.error(
      `Error occurred during an attempt to establish connection with the database: %O`,
      err
    );
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    process.exit();
  });


/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3000);
app.use(compression());
// app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use('/static', express.static(path.join(__dirname, '../static')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Uploading files
 */
import multer from './middlewares/upload';
app.use(multer);

/**
 * Routes
 */
import user from './routes/user';
import playlist from './routes/playlist';
import track from './routes/track';
import template from './routes/template';

app.use(user);
app.use(playlist);
app.use(track);
app.use(template);

/**
 * Error handler
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  const message = typeof err === 'object' ? err.message : err;

  logger.error(`[${status}]: ${message}`);
  res.status(status).json({
    success: false,
    message
  });
});


export default app;