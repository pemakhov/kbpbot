import { inMemoryDb, fillIn } from '../../../data-manager/in-memory-database';
import redisDb from '../../../data-manager/redis-db';
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

async function update(user: TUser): Promise<{ error: Error | null; result: boolean }> {
  try {
    const result: boolean = await redisDb
      .saveUser(user)
      .then(() => inMemoryDb.users.clear())
      .then(() => redisDb.getUsers())
      .then((users) => fillIn(users, undefined, undefined))
      .then(() => true);

    return { error: null, result };
  } catch (error) {
    console.error(error.message);
    return { error, result: false };
  }
}

async function deleteById(id: number): Promise<{ error: Error | null; deleted: number }> {
  try {
    const result: number = await redisDb.deleteUserById(id);
    inMemoryDb.users.clear();
    const users = await redisDb.getUsers();
    fillIn(users, undefined, undefined);

    return { error: null, deleted: result };
  } catch (error) {
    console.error(error.message);
    return { error, deleted: 0 };
  }
}

export default {
  findAll,
  getByUsername,
  getById,
  update,
  deleteById,
};
