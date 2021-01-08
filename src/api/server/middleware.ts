import { Application } from 'express';

function init(app: Application): void {
  app.use((req, res, next) => {
    console.log("It's middleware");
    next();
  });
}

export default { init };
