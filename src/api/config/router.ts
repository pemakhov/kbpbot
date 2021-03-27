import { Application } from 'express';
import AuthRouter from '../components/auth/router';
import UsersRouter from '../components/users/router';
import PhonesRouter from '../components/phones/router';
import BirthdaysRouter from '../components/birthdays/router';
import Auth from '../components/auth';
import path from 'path';

function init(app: Application): void {
  app.use('/api/auth', AuthRouter.router);

  app.use('/api/users', UsersRouter.router);

  app.use('/api/birthdays', BirthdaysRouter.router);

  app.use('/api/phones', PhonesRouter.router);

  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../../../', 'front/build', 'index.html')));

  app.post('/', Auth.authenticate, (req, res) => {
    const { userName } = req.body;
    console.log({ userName });

    res.render('home-content', { userName });
  });
}

export default { init };
