import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

function init(app: Application): void {
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  // performs express use json from the body
  app.use(express.json());
  // parse Cookie header and populate req.cookies with an object keyed by the cookie names.
  app.use(cookieParser());

  app.set('env', process.env.NODE_ENV || 'development');

  app.use(express.static(path.join(__dirname, '../../../', 'build/')));

  app.set('view engine', 'pug');

  app.set('views', path.join(__dirname, '../', 'views'));
}

export default { init };
