import { Request, Response } from 'express';
import Service from './service';

function findAll(req: Request, res: Response): void {
  res.status(200).json(Service.findAll());
}

function update(req: Request, res: Response): void {
  const { newPhone } = req.body;

  if (!newPhone) {
    res.status(400);
    return;
  }

  const updatedPhone = Service.update(newPhone);

  if (updatedPhone === null) {
    res.status(404).json({ error: "Can't update phone" });
    return;
  }

  res.status(200).json({ error: null, phone: updatedPhone });
}

export default {
  findAll,
  update,
};
