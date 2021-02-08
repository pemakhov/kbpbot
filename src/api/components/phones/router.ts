import { Router } from 'express';
import PhonesModule from '.';

const router = Router();

router.get('/', PhonesModule.findAll);

router.post('/', PhonesModule.update);

export default { router };
