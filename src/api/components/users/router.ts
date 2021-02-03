import { Router } from 'express';
import UsersModule from './';

const router = Router();

router.get('/', UsersModule.findAll);

export default { router };
