import { Application } from 'express';
import AuthRouter from '../components/auth/router';

function init(app: Application): void {
  app.use('/auth', AuthRouter.router);

  app.use('/', (req, res) => res.render('home'));
}

export default { init };
