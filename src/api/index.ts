import { Application } from 'express';
import middleware from './config/middleware';
import router from './config/router';

function init(app: Application): void {
  const PORT = process.env.PORT || 5000;

  middleware.init(app);

  router.init(app);

  app.get('/users', (req, res) => {
    res.send('<h1>Hello, we are users</h1>');
  });

  app.listen(PORT, () => {
    console.log(`Listening to the port ${PORT}`);
  });
}

export default { init };
