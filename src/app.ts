import express from 'express';
import lusca from 'lusca';
import compression from 'compression';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
// import flash from 'express-flash';
import path from 'path';
import logger from './util/logger';
import { MONGODB_URI, SESSION_SECRET } from './util/secrets';

// Create Express server
const app = express();

// Connect to MongoDB
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


// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
// app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

/**
 * maybe need it later
 */
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });
// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user &&
//     req.path !== '/login' &&
//     req.path !== '/signup' &&
//     !req.path.match(/^\/auth/) &&
//     !req.path.match(/\./)) {
//     req.session.returnTo = req.path;
//   } else if (req.user &&
//     req.path == '/account') {
//     req.session.returnTo = req.path;
//   }
//   next();
// });


// Controllers (route handlers)
import * as userController from './controllers/user';

app.post('/login', userController.postLogin)


export default app;