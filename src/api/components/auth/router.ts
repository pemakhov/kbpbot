import { Router } from 'express';
import AuthModule from './';

const router = Router();

router.get('/login', (req, res) => {
  return res.render('login', { hideLogin: true });
});

router.get('/test', (req, res) => {
  return res.render('login');
});

router.post('/code-request', AuthModule.handleCodeRequest);

router.post('/login-with-code', AuthModule.processLoginWithCode);

router.post('/refresh', AuthModule.refresh);

export default { router };
