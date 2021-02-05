import { Router } from 'express';
import BirthdayModule from '.';

const router = Router();

router.get('/', BirthdayModule.findAll);

export default { router };
