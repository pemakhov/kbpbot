import { Application } from 'express';
import AuthRouter from '../components/auth/router';

function init(app: Application): void {
  app.use('/auth', AuthRouter.router);
}

export default { init };
