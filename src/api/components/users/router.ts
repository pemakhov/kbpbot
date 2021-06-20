import { Router } from 'express';
import UsersModule from './';
import AuthModule from '../auth';

const router = Router();

router.get('/', UsersModule.findAll);

router.put('/', AuthModule.authenticate, UsersModule.update);

router.delete('/', AuthModule.authenticate, UsersModule.deleteById);

export default { router };
