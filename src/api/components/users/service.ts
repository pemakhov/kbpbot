import { inMemoryDb } from '../../../data-manager/in-memory-database';
import { TUser } from '../../../types/TUser';

function findAll(): TUser[] {
  return [...inMemoryDb.users.all.values()];
}

function getByUsername(username: string): TUser | undefined {
  return inMemoryDb.users.getByTelegramName(username);
}

function getById(id: number | string): TUser | undefined {
  return inMemoryDb.users.getById(+id);
}

export default {
  findAll,
  getByUsername,
  getById,
};
