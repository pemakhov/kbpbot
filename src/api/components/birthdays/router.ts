import { Router } from 'express';
import BirthdayModule from '.';
import AuthModule from '../auth';

const router = Router();

router.get('/', BirthdayModule.findAll);

router.put('/', AuthModule.authenticate, BirthdayModule.update);

router.delete('/', AuthModule.authenticate, BirthdayModule.deleteById);

export default { router };
