import { Router } from 'express';
import AuthModule from './';

const router = Router();

router.get('/login', (req, res) => {
  return res.render('login');
});

router.get('/test', (req, res) => {
  return res.render('login');
});

router.post('/code-request', AuthModule.handleCodeRequest);

router.post('/token-request', AuthModule.handleTokenRequest);

export default { router };
