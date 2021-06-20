import { Router } from 'express';
import PhonesModule from '.';
import AuthModule from '../auth';

const router = Router();

router.get('/', PhonesModule.findAll);

router.put('/', AuthModule.authenticate, PhonesModule.update);

router.delete('/', AuthModule.authenticate, PhonesModule.deleteById);

export default { router };
