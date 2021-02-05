import { Request, Response } from 'express';
import Service from './service';

function findAll(req: Request, res: Response): void {
  res.status(200).json(Service.findAll());
}

export default {
  findAll,
};
