import { Router } from 'express';
import PhonesModule from '.';

const router = Router();

router.get('/', PhonesModule.findAll);

export default { router };
