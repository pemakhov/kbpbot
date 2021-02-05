import { Application } from 'express';
import AuthRouter from '../components/auth/router';
import UsersRouter from '../components/users/router';
import PhonesRouter from '../components/phones/router';
import BirthdaysRouter from '../components/birthdays/router';
import Auth from '../components/auth';

function init(app: Application): void {
  app.use('/auth', AuthRouter.router);

  app.use('/users', UsersRouter.router);

  app.use('/birthdays', BirthdaysRouter.router);

  app.use('/phones', PhonesRouter.router);

  app.get('/', (req, res) => res.render('home', { userName: req.body.userName }));

  app.post('/', Auth.authenticate, (req, res) => {
    const { userName } = req.body;
    console.log({ userName });

    res.render('home-content', { userName });
  });
}

export default { init };
