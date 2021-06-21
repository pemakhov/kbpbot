import { Request, Response } from 'express';
import Service from './service';
import constants from '../../constants';

function findAll(req: Request, res: Response): void {
  res.status(200).json(Service.findAll());
}

function update(req: Request, res: Response): void {
  const { newUser } = req.body;
  const { id, isAdmin } = newUser;

  if (!newUser) {
    res.status(400);
    return;
  }

  if (!isAdmin && id === constants.ADMIN_TELEGRAM_ID) {
    res.status(400).json({ error: 'This user is special' });
    return;
  }

  const updatedUser = Service.update(newUser);

  if (updatedUser === null) {
    res.status(404).json({ error: "Can't update user" });
    return;
  }

  res.status(200).json({ error: null, phone: updatedUser });
}

async function deleteById(req: Request, res: Response): Promise<void> {
  const { id } = req.body;

  if (!id) {
    res.status(400);
    return;
  }

  const { error, deleted } = await Service.deleteById(id);

  if (error) {
    res.status(500).json({ error: new Error('Something is wrong') });
    return;
  }

  res.status(200).json({ error: null, message: 'OK', deleted });
}

export default {
  findAll,
  update,
  deleteById,
};
