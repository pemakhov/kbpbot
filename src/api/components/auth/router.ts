import { Router } from 'express';

const router = Router();

router.use((req, res, next) => {
  console.log('auth router');
  next();
});

router.get('/login', (req, res) => {
  return res.send('login');
});

export default { router };
